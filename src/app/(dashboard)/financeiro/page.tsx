import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { DollarSign } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Financeiro"
        description="Transações, DRE e conciliação financeira"
      />

      <EmptyState
        icon={DollarSign}
        title="Área financeira em construção"
        description="O módulo financeiro estará disponível na Fase 4 do projeto. Aqui você terá visão de transações, relatório DRE e conciliação de vendas."
      />
    </div>
  );
}
