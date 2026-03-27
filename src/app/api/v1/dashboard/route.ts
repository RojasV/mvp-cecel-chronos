import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch all watches for this org
    const { data: watches, error } = await supabase
      .from("watches")
      .select("id, brand, model, status, asking_price_cents, created_at, condition")
      .eq("org_id", DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allWatches = watches || [];

    // KPIs
    const totalWatches = allWatches.length;
    const totalValueCents = allWatches.reduce(
      (sum, w) => sum + (w.asking_price_cents || 0),
      0,
    );
    const avgPriceCents = totalWatches > 0
      ? Math.round(totalValueCents / totalWatches)
      : 0;

    const statusCounts: Record<string, number> = {};
    for (const w of allWatches) {
      statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
    }

    // Brand distribution
    const brandCounts: Record<string, { count: number; valueCents: number }> = {};
    for (const w of allWatches) {
      if (!brandCounts[w.brand]) {
        brandCounts[w.brand] = { count: 0, valueCents: 0 };
      }
      brandCounts[w.brand].count++;
      brandCounts[w.brand].valueCents += w.asking_price_cents || 0;
    }

    const brandDistribution = Object.entries(brandCounts)
      .map(([brand, data]) => ({
        brand,
        count: data.count,
        valueCents: data.valueCents,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent watches (last 10)
    const recentWatches = allWatches.slice(0, 10).map((w) => ({
      id: w.id,
      brand: w.brand,
      model: w.model,
      status: w.status,
      askingPriceCents: w.asking_price_cents,
      createdAt: w.created_at,
    }));

    // Fetch acquisition data for cost analysis
    const { data: acquisitions } = await supabase
      .from("acquisitions")
      .select("purchase_cost_cents, acquisition_type")
      .eq("org_id", DEFAULT_ORG_ID);

    const totalCostCents = (acquisitions || []).reduce(
      (sum, a) => sum + (a.purchase_cost_cents || 0),
      0,
    );
    const potentialProfitCents = totalValueCents - totalCostCents;

    return NextResponse.json({
      kpis: {
        totalWatches,
        totalValueCents,
        avgPriceCents,
        totalCostCents,
        potentialProfitCents,
        statusCounts,
      },
      brandDistribution,
      recentWatches,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
