import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: watches, error } = await supabase
      .from("watches")
      .select("id, brand, model, status, asking_price_cents, created_at, condition")
      .eq("org_id", DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allWatches = watches || [];

    const totalWatches = allWatches.length;
    const totalValueCents = allWatches.reduce(
      (sum, w) => sum + (w.asking_price_cents || 0),
      0,
    );
    const averagePrice = totalWatches > 0
      ? totalValueCents / 100 / totalWatches
      : 0;

    const statusCounts: Record<string, number> = {};
    for (const w of allWatches) {
      statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
    }

    const brandMap: Record<string, { count: number; valueCents: number }> = {};
    for (const w of allWatches) {
      if (!brandMap[w.brand]) {
        brandMap[w.brand] = { count: 0, valueCents: 0 };
      }
      brandMap[w.brand].count++;
      brandMap[w.brand].valueCents += w.asking_price_cents || 0;
    }

    const brandDistribution = Object.entries(brandMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.valueCents / 100,
      }))
      .sort((a, b) => b.count - a.count);

    const recentWatches = allWatches.slice(0, 10).map((w) => ({
      id: w.id,
      brand: w.brand,
      model: w.model,
      status: w.status,
      asking_price: w.asking_price_cents ? w.asking_price_cents / 100 : null,
    }));

    const { data: acquisitions } = await supabase
      .from("acquisitions")
      .select("purchase_cost_cents, acquisition_type")
      .eq("org_id", DEFAULT_ORG_ID);

    const totalCostCents = (acquisitions || []).reduce(
      (sum, a) => sum + (a.purchase_cost_cents || 0),
      0,
    );

    return NextResponse.json({
      kpis: {
        totalWatches,
        totalValue: totalValueCents / 100,
        averagePrice,
        totalCost: totalCostCents / 100,
        potentialProfit: (totalValueCents - totalCostCents) / 100,
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
