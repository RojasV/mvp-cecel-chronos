import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Lock } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Configurações" description="Gerencie as configurações da plataforma">
        <Badge variant="outline" className="border-0 bg-chronos-surface-hover text-chronos-text-muted">
          Em breve
        </Badge>
      </PageHeader>

      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-16 text-chronos-text-muted">
            <div className="relative mb-6">
              <Settings className="h-16 w-16 text-chronos-text-subtle" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-chronos-surface-raised p-1">
                <Lock className="h-4 w-4 text-chronos-text-subtle" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-chronos-text mb-2">
              Configurações
            </h2>
            <p className="text-sm text-center max-w-md">
              Configurações avançadas estarão disponíveis em breve.
              Perfil, membros, integrações e personalizações.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
