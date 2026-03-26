import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { MessageCircle } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="WhatsApp"
        description="Envie materiais e gerencie comunicações"
      />

      <EmptyState
        icon={MessageCircle}
        title="WhatsApp não configurado"
        description="A integração com WhatsApp via Evolution API estará disponível na Fase 3 do projeto. Aqui você poderá enviar materiais de marketing diretamente para clientes e grupos."
      />
    </div>
  );
}
