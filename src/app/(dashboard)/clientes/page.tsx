import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Users } from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes e interesses"
      />

      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="A gestão de clientes estará disponível na Fase 3 do projeto. Aqui você poderá cadastrar clientes, definir interesses e receber matches automáticos com novos relógios."
      />
    </div>
  );
}
