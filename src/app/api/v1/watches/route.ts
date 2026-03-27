import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseStorageAdapter } from "@/infrastructure/storage/supabase-storage-adapter";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json({ error: "ids parameter required" }, { status: 400 });
    }

    const idList = ids.split(",").filter(Boolean);

    const { data: images } = await supabase
      .from("watch_images")
      .select("storage_path")
      .in("watch_id", idList);

    if (images?.length) {
      const storage = new SupabaseStorageAdapter(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      for (const img of images) {
        try {
          await storage.deleteWatchImage(img.storage_path);
        } catch {}
      }
    }

    await supabase.from("whatsapp_messages").delete().in("watch_id", idList);
    await supabase.from("watch_images").delete().in("watch_id", idList);
    await supabase.from("acquisitions").delete().in("watch_id", idList);
    const { error } = await supabase.from("watches").delete().in("id", idList).eq("org_id", DEFAULT_ORG_ID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: idList.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");

    let query = supabase
      .from("watches")
      .select(`
        *,
        watch_images (id, url, storage_path, is_primary, sort_order),
        acquisitions (id, acquisition_type, purchase_cost_cents, acquired_at, supplier_id)
      `)
      .eq("org_id", DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (brand) query = query.eq("brand", brand);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const watches = (data ?? []).map((w: Record<string, unknown>) => ({
      ...w,
      asking_price: typeof w.asking_price_cents === "number"
        ? (w.asking_price_cents as number) / 100
        : null,
    }));

    return NextResponse.json({ watches });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const {
      brand, model, reference, dial_color, case_material,
      case_diameter_mm, movement, year_of_production, condition,
      accessories, description, asking_price, notes,
      imageBase64, imageMimeType,
      acquisition_type, purchase_cost, supplier_name, acquired_at,
      ai_suggestions,
    } = body;

    if (!brand || !model) {
      return NextResponse.json(
        { error: "brand and model are required" },
        { status: 400 },
      );
    }

    const askingPriceCents = asking_price
      ? Math.round(parseFloat(asking_price) * 100)
      : 0;
    const purchaseCostCents = purchase_cost
      ? Math.round(parseFloat(purchase_cost) * 100)
      : 0;

    // 1. Create watch
    const { data: watch, error: watchError } = await supabase
      .from("watches")
      .insert({
        org_id: DEFAULT_ORG_ID,
        brand,
        model,
        reference: reference || null,
        dial_color: dial_color || null,
        case_material: case_material || null,
        case_diameter_mm: case_diameter_mm ? parseFloat(case_diameter_mm) : null,
        movement: movement || null,
        year_of_production: year_of_production ? parseInt(year_of_production) : null,
        condition: condition || null,
        accessories: accessories || null,
        description: description || null,
        asking_price_cents: askingPriceCents,
        notes: notes || null,
        status: "draft",
        ai_suggestions: ai_suggestions || null,
        ai_suggestions_confirmed: !!ai_suggestions,
      })
      .select()
      .single();

    if (watchError) {
      return NextResponse.json(
        { error: `Watch creation failed: ${watchError.message}` },
        { status: 500 },
      );
    }

    // 2. Upload image if provided
    let imageUrl: string | null = null;
    if (imageBase64) {
      try {
        const storage = new SupabaseStorageAdapter(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const { url, storagePath } = await storage.uploadWatchImage(
          imageBase64,
          watch.id,
          imageMimeType || "image/jpeg",
        );
        imageUrl = url;

        await supabase.from("watch_images").insert({
          watch_id: watch.id,
          org_id: DEFAULT_ORG_ID,
          storage_path: storagePath,
          url,
          is_primary: true,
          sort_order: 0,
        });
      } catch (uploadErr) {
        console.error("Image upload failed:", uploadErr);
      }
    }

    // 3. Create supplier if name provided
    let supplierId: string | null = null;
    if (supplier_name) {
      const { data: supplier } = await supabase
        .from("suppliers")
        .upsert(
          { org_id: DEFAULT_ORG_ID, name: supplier_name },
          { onConflict: "org_id,name", ignoreDuplicates: true },
        )
        .select("id")
        .single();

      if (supplier) supplierId = supplier.id;
    }

    // 4. Create acquisition
    if (acquisition_type) {
      await supabase.from("acquisitions").insert({
        watch_id: watch.id,
        org_id: DEFAULT_ORG_ID,
        supplier_id: supplierId,
        acquisition_type: acquisition_type || "direct_purchase",
        purchase_cost_cents: purchaseCostCents,
        acquired_at: acquired_at || new Date().toISOString().split("T")[0],
        condition_at_purchase: condition || null,
      });
    }

    return NextResponse.json({
      id: watch.id,
      brand: watch.brand,
      model: watch.model,
      imageUrl,
      status: watch.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
