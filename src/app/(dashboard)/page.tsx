"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Watch,
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Clock,
  Loader2,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DashboardData = {
  kpis: {
    totalWatches: number;
    totalValue: number;
    averagePrice: number;
    statusCounts: Record<string, number>;
    totalCost: number;
    potentialProfit: number;
  };
  brandDistribution: { name: string; count: number; value: number }[];
  recentWatches: {
    id: string;
    brand: string;
    model: string;
    asking_price: number | null;
    status: string;
  }[];
};

const CHART_COLORS = [
  "#D4AF37",
  "#5EEAD4",
  "#818CF8",
  "#FB923C",
  "#F472B6",
  "#38BDF8",
  "#A3E635",
  "#C084FC",
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dashboard" description="Visão geral do inventário" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-chronos-gold animate-spin" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const brands = data?.brandDistribution ?? [];
  const recent = data?.recentWatches ?? [];

  const statCards = [
    {
      label: "Total em Estoque",
      value: kpis?.totalWatches?.toString() ?? "0",
      icon: Watch,
      color: "text-chronos-gold",
      bg: "bg-chronos-gold/10",
    },
    {
      label: "Disponíveis",
      value: kpis?.statusCounts?.available?.toString() ?? "0",
      icon: PackageCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Reservados",
      value: kpis?.statusCounts?.reserved?.toString() ?? "0",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Vendidos",
      value: kpis?.statusCounts?.sold?.toString() ?? "0",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Valor em Estoque",
      value: formatCurrency(kpis?.totalValue ?? 0),
      icon: TrendingUp,
      color: "text-chronos-gold",
      bg: "bg-chronos-gold/10",
    },
    {
      label: "Lucro Potencial",
      value: formatCurrency(kpis?.potentialProfit ?? 0),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu inventário e operações"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-chronos-border bg-chronos-surface-raised"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-chronos-text-muted">
                {stat.label}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-chronos-text">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Brand bar chart */}
        <Card className="border-chronos-border bg-chronos-surface-raised">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-chronos-text">
              Relógios por Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brands.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brands} barCategoryGap="30%">
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #2a2a3e",
                      borderRadius: "8px",
                      color: "#f0f0f0",
                    }}
                  />
                  <Bar dataKey="count" name="Quantidade" radius={[6, 6, 0, 0]}>
                    {brands.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-chronos-text-muted">
                <Watch className="h-10 w-10 mb-3 text-chronos-text-subtle" />
                <p className="text-sm">Sem dados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brand pie chart (by value) */}
        <Card className="border-chronos-border bg-chronos-surface-raised">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-chronos-text">
              Valor por Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brands.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={brands}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#4a4a5e" }}
                  >
                    {brands.map((_, i) => (
                      <Cell
                        key={`pie-${i}`}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(Number(val ?? 0))}
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #2a2a3e",
                      borderRadius: "8px",
                      color: "#f0f0f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-chronos-text-muted">
                <TrendingUp className="h-10 w-10 mb-3 text-chronos-text-subtle" />
                <p className="text-sm">Sem dados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent watches */}
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-chronos-text">
            Últimas Aquisições
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between py-2 border-b border-chronos-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-chronos-text">
                      {w.brand} {w.model}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-chronos-gold">
                    {w.asking_price
                      ? formatCurrency(w.asking_price)
                      : "Sob consulta"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-chronos-text-muted">
              <Watch className="h-10 w-10 mb-3 text-chronos-text-subtle" />
              <p className="text-sm">Nenhuma aquisição registrada</p>
              <p className="text-xs text-chronos-text-subtle mt-1">
                Cadastre seu primeiro relógio para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
