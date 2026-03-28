import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const watchFields: Record<string, unknown> = {};
    const directFields = [
      "brand", "model", "reference", "dial_color", "case_material",
      "movement", "condition", "accessories", "description", "notes", "status",
    ] as const;
    for (const f of directFields) {
      if (body[f] !== undefined) watchFields[f] = body[f] || null;
    }
    if (body.case_diameter_mm !== undefined) {
      watchFields.case_diameter_mm = body.case_diameter_mm
        ? parseFloat(body.case_diameter_mm)
        : null;
    }
    if (body.year_of_production !== undefined) {
      watchFields.year_of_production = body.year_of_production
        ? parseInt(body.year_of_production)
        : null;
    }
    if (body.asking_price !== undefined) {
      watchFields.asking_price_cents = body.asking_price
        ? Math.round(parseFloat(body.asking_price) * 100)
        : 0;
    }

    const { error: watchError } = await supabase
      .from("watches")
      .update(watchFields)
      .eq("id", id)
      .eq("org_id", DEFAULT_ORG_ID);

    if (watchError) {
      return NextResponse.json({ error: watchError.message }, { status: 500 });
    }

    if (body.acquisition_type !== undefined) {
      const purchaseCostCents = body.purchase_cost
        ? Math.round(parseFloat(body.purchase_cost) * 100)
        : 0;

      let supplierId: string | null = null;
      if (body.supplier_name) {
        const { data: supplier } = await supabase
          .from("suppliers")
          .upsert(
            { org_id: DEFAULT_ORG_ID, name: body.supplier_name },
            { onConflict: "org_id,name", ignoreDuplicates: true },
          )
          .select("id")
          .single();
        if (supplier) supplierId = supplier.id;
      }

      const { data: existingAcq } = await supabase
        .from("acquisitions")
        .select("id")
        .eq("watch_id", id)
        .limit(1)
        .single();

      if (existingAcq) {
        await supabase
          .from("acquisitions")
          .update({
            acquisition_type: body.acquisition_type || "direct_purchase",
            purchase_cost_cents: purchaseCostCents,
            acquired_at: body.acquired_at || new Date().toISOString().split("T")[0],
            supplier_id: supplierId,
          })
          .eq("id", existingAcq.id);
      } else {
        await supabase.from("acquisitions").insert({
          watch_id: id,
          org_id: DEFAULT_ORG_ID,
          supplier_id: supplierId,
          acquisition_type: body.acquisition_type || "direct_purchase",
          purchase_cost_cents: purchaseCostCents,
          acquired_at: body.acquired_at || new Date().toISOString().split("T")[0],
          condition_at_purchase: body.condition || null,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: watch, error } = await supabase
      .from("watches")
      .select(`
        *,
        watch_images (id, url, storage_path, is_primary, sort_order),
        acquisitions (
          id, acquisition_type, purchase_cost_cents, acquired_at,
          condition_at_purchase, notes,
          supplier_id
        )
      `)
      .eq("id", id)
      .eq("org_id", DEFAULT_ORG_ID)
      .single();

    if (error || !watch) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    let supplierName: string | null = null;
    const rawAcq = watch.acquisitions;
    const acq: Record<string, unknown> | undefined = Array.isArray(rawAcq)
      ? rawAcq[0]
      : rawAcq ?? undefined;
    if (acq?.supplier_id) {
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("name")
        .eq("id", acq.supplier_id as string)
        .single();
      if (supplier) supplierName = supplier.name;
    }

    return NextResponse.json({
      watch: {
        ...watch,
        asking_price: watch.asking_price_cents
          ? watch.asking_price_cents / 100
          : null,
        acquisition: acq
          ? {
              type: acq.acquisition_type,
              cost: (acq.purchase_cost_cents as number) / 100,
              acquired_at: acq.acquired_at,
              condition_at_purchase: acq.condition_at_purchase,
              supplier_name: supplierName,
            }
          : null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
