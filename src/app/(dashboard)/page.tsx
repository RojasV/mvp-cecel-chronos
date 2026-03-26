import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Watch,
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  FileEdit,
  Clock,
} from "lucide-react";

const statCards = [
  {
    label: "Total em Estoque",
    value: "0",
    icon: Watch,
    color: "text-chronos-gold",
    bg: "bg-chronos-gold/10",
  },
  {
    label: "Disponíveis",
    value: "0",
    icon: PackageCheck,
    color: "text-chronos-success",
    bg: "bg-chronos-success/10",
  },
  {
    label: "Reservados",
    value: "0",
    icon: Clock,
    color: "text-chronos-warning",
    bg: "bg-chronos-warning/10",
  },
  {
    label: "Vendidos",
    value: "0",
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Rascunhos",
    value: "0",
    icon: FileEdit,
    color: "text-chronos-text-muted",
    bg: "bg-chronos-text-muted/10",
  },
  {
    label: "Valor em Estoque",
    value: "R$ 0",
    icon: TrendingUp,
    color: "text-chronos-gold",
    bg: "bg-chronos-gold/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu inventário e operações"
      />

      {/* Status Cards */}
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

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-chronos-border bg-chronos-surface-raised">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-chronos-text">
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-chronos-text-muted">
              <Watch className="h-10 w-10 mb-3 text-chronos-text-subtle" />
              <p className="text-sm">Nenhuma atividade registrada</p>
              <p className="text-xs text-chronos-text-subtle mt-1">
                Cadastre seu primeiro relógio para começar
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chronos-border bg-chronos-surface-raised">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-chronos-text">
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-chronos-text-muted">
              <PackageCheck className="h-10 w-10 mb-3 text-chronos-text-subtle" />
              <p className="text-sm">Tudo em ordem</p>
              <p className="text-xs text-chronos-text-subtle mt-1">
                Nenhum alerta no momento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
