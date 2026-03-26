import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Truck } from "lucide-react";

export default function FornecedoresPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Fornecedores"
        description="Gerencie seus fornecedores e aquisições"
      />

      <EmptyState
        icon={Truck}
        title="Nenhum fornecedor cadastrado"
        description="A gestão de fornecedores e aquisições estará disponível na Fase 4 do projeto. Aqui você poderá registrar fornecedores, custos de aquisição e margens."
      />
    </div>
  );
}
