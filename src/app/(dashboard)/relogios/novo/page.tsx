import { PageHeader } from "@/components/layout/page-header";
import { WatchWizard } from "@/components/watch/watch-wizard";

export default function NovoRelogioPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Novo Relógio"
        description="Cadastre um novo relógio no inventário"
      />
      <WatchWizard />
    </div>
  );
}
