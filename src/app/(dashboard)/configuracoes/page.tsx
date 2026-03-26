import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da plataforma"
      />

      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-chronos-text">
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-chronos-text-muted">
            <Settings className="h-10 w-10 mb-3 text-chronos-text-subtle" />
            <p className="text-sm">Configurações em construção</p>
            <p className="text-xs text-chronos-text-subtle mt-1">
              Em breve: perfil, membros, integrações
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
