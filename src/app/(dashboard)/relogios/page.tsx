import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Watch, Plus } from "lucide-react";
import Link from "next/link";

export default function RelogiosPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Relógios"
        description="Gerencie seu inventário de relógios de luxo"
      >
        <Link href="/relogios/novo">
          <Button className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light">
            <Plus className="mr-2 h-4 w-4" />
            Novo Relógio
          </Button>
        </Link>
      </PageHeader>

      <EmptyState
        icon={Watch}
        title="Nenhum relógio cadastrado"
        description="Comece adicionando seu primeiro relógio ao inventário. Use a IA para preencher os dados automaticamente a partir de uma foto."
      >
        <Link href="/relogios/novo">
          <Button className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Primeiro Relógio
          </Button>
        </Link>
      </EmptyState>
    </div>
  );
}
