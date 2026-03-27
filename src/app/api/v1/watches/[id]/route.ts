import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

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
    const acq = (watch.acquisitions as Record<string, unknown>[])?.[0];
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
