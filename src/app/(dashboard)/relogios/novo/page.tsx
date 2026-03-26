import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Watch } from "lucide-react";

export default function NovoRelogioPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Novo Relógio"
        description="Cadastre um novo relógio no inventário"
      />

      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-chronos-text">
            Dados do Relógio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-chronos-text-muted">
            <Watch className="h-10 w-10 mb-3 text-chronos-text-subtle" />
            <p className="text-sm">Formulário em construção</p>
            <p className="text-xs text-chronos-text-subtle mt-1">
              Fase 1A — Em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
