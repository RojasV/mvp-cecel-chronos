import { PageHeader } from "@/components/layout/page-header";
import { WatchWizard } from "@/components/watch/watch-wizard";

export default function NovaAquisicaoPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nova Aquisição"
        description="Registre um novo relógio no inventário a partir de uma compra ou permuta"
      />
      <WatchWizard />
    </div>
  );
}
