import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Lock } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Financeiro" description="Transações, DRE e conciliação financeira">
        <Badge variant="outline" className="border-0 bg-chronos-surface-hover text-chronos-text-muted">
          Em breve
        </Badge>
      </PageHeader>

      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-16 text-chronos-text-muted">
            <div className="relative mb-6">
              <DollarSign className="h-16 w-16 text-chronos-text-subtle" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-chronos-surface-raised p-1">
                <Lock className="h-4 w-4 text-chronos-text-subtle" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-chronos-text mb-2">
              Módulo Financeiro
            </h2>
            <p className="text-sm text-center max-w-md">
              O módulo financeiro estará disponível em breve. Aqui você terá
              visão de transações, relatório DRE e conciliação de vendas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
