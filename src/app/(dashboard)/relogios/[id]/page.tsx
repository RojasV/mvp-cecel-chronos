"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Send,
  ImageOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Repeat2,
  Calendar,
  User,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  WATCH_STATUS_LABELS,
  WATCH_CONDITION_LABELS,
} from "@/shared/constants";
import type { WatchStatus, WatchCondition } from "@/shared/constants";

type WatchImage = { id: string; url: string; is_primary: boolean };

type WatchDetail = {
  id: string;
  brand: string;
  model: string;
  reference: string | null;
  dial_color: string | null;
  case_material: string | null;
  case_diameter_mm: number | null;
  movement: string | null;
  year_of_production: number | null;
  condition: string | null;
  accessories: string | null;
  description: string | null;
  asking_price: number | null;
  notes: string | null;
  status: WatchStatus;
  created_at: string;
  watch_images: WatchImage[];
  acquisition: {
    type: string;
    cost: number;
    acquired_at: string;
    condition_at_purchase: string | null;
    supplier_name: string | null;
  } | null;
};

const TARGET_PHONES = ["5567981532222", "5567981167199"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: typeof DollarSign;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon className="h-4 w-4 text-chronos-text-subtle mt-0.5 shrink-0" />}
      <div className="flex-1 flex justify-between items-start gap-4">
        <span className="text-sm text-chronos-text-muted">{label}</span>
        <span className="text-sm text-chronos-text text-right font-medium">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function WatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [watch, setWatch] = useState<WatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/watches/${params.id}`)
      .then((r) => r.json())
      .then((d) => setWatch(d.watch ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDeleteConfirm() {
    if (!watch) return;
    setDeleting(true);
    setConfirmDeleteOpen(false);
    try {
      const res = await fetch(`/api/v1/watches?ids=${watch.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Relógio excluído");
      router.push("/relogios");
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDispatch() {
    if (!watch) return;
    setDispatching(true);
    try {
      const res = await fetch("/api/v1/dispatch-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchIds: [watch.id],
          phones: TARGET_PHONES,
        }),
      });
      if (!res.ok) throw new Error("Erro ao disparar");
      const result = await res.json();
      toast.success("WhatsApp disparado!", {
        description: `${result.sent} enviadas, ${result.failed} falhas`,
      });
    } catch {
      toast.error("Erro ao disparar WhatsApp");
    } finally {
      setDispatching(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-chronos-gold animate-spin" />
        </div>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="space-y-8">
        <PageHeader title="Relógio não encontrado" />
        <Button
          variant="outline"
          onClick={() => router.push("/relogios")}
          className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Estoque
        </Button>
      </div>
    );
  }

  const primaryImg =
    watch.watch_images?.find((i) => i.is_primary)?.url ??
    watch.watch_images?.[0]?.url;

  const cost = watch.acquisition?.cost ?? 0;
  const askingPrice = watch.asking_price ?? 0;
  const profit = askingPrice - cost;
  const profitPercent = cost > 0 ? ((profit / cost) * 100).toFixed(1) : null;
  const isProfitable = profit > 0;

  const conditionLabel = watch.condition
    ? WATCH_CONDITION_LABELS[watch.condition as WatchCondition] ?? watch.condition
    : null;

  function getStatusBadge(status: WatchStatus) {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      reserved: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      sold: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      consigned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
    return (
      <Badge variant="outline" className={colors[status] ?? colors.draft}>
        {WATCH_STATUS_LABELS[status] ?? status}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/relogios")}
            className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-chronos-text">
              {watch.brand} {watch.model}
            </h1>
            {watch.reference && (
              <p className="text-sm text-chronos-text-muted">
                Ref. {watch.reference}
              </p>
            )}
          </div>
          <div className="ml-2">{getStatusBadge(watch.status)}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/relogios/${watch.id}/editar`)}
            className="border-chronos-gold/30 text-chronos-gold hover:bg-chronos-gold/10"
          >
            <Pencil className="mr-2 h-3 w-3" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDispatch}
            disabled={dispatching}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            {dispatching ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Send className="mr-2 h-3 w-3" />
            )}
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={deleting}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            {deleting ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-3 w-3" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <Card className="border-chronos-border bg-chronos-surface-raised lg:col-span-1">
          <CardContent className="p-4">
            {primaryImg ? (
              <img
                src={primaryImg}
                alt={`${watch.brand} ${watch.model}`}
                className="w-full rounded-lg object-contain max-h-[400px]"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-chronos-surface flex items-center justify-center">
                <ImageOff className="h-16 w-16 text-chronos-text-subtle" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profit card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-chronos-text-muted uppercase tracking-wider">
                    Custo
                  </span>
                  <ShoppingCart className="h-4 w-4 text-red-400" />
                </div>
                <p className="text-xl font-bold text-red-400">
                  {cost > 0 ? formatCurrency(cost) : "—"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-chronos-text-muted uppercase tracking-wider">
                    Preço de Venda
                  </span>
                  <DollarSign className="h-4 w-4 text-chronos-gold" />
                </div>
                <p className="text-xl font-bold text-chronos-gold">
                  {askingPrice > 0 ? formatCurrency(askingPrice) : "—"}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`border-chronos-border bg-chronos-surface-raised ${
                isProfitable
                  ? "ring-1 ring-emerald-500/20"
                  : profit < 0
                    ? "ring-1 ring-red-500/20"
                    : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-chronos-text-muted uppercase tracking-wider">
                    Lucro Estimado
                  </span>
                  {isProfitable ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <p
                  className={`text-xl font-bold ${
                    isProfitable ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {cost > 0 && askingPrice > 0
                    ? formatCurrency(profit)
                    : "—"}
                </p>
                {profitPercent && cost > 0 && askingPrice > 0 && (
                  <p
                    className={`text-xs mt-1 ${
                      isProfitable ? "text-emerald-400/70" : "text-red-400/70"
                    }`}
                  >
                    {isProfitable ? "+" : ""}
                    {profitPercent}% de margem
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acquisition details */}
          {watch.acquisition && (
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-chronos-text flex items-center gap-2">
                  {watch.acquisition.type === "trade" ? (
                    <Repeat2 className="h-4 w-4 text-chronos-gold" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 text-chronos-gold" />
                  )}
                  {watch.acquisition.type === "trade"
                    ? "Permuta"
                    : "Compra Direta"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <DetailRow
                  label="Custo de Aquisição"
                  value={
                    watch.acquisition.cost > 0
                      ? formatCurrency(watch.acquisition.cost)
                      : null
                  }
                  icon={DollarSign}
                />
                <DetailRow
                  label="Data da Aquisição"
                  value={watch.acquisition.acquired_at}
                  icon={Calendar}
                />
                <DetailRow
                  label="Fornecedor"
                  value={watch.acquisition.supplier_name}
                  icon={User}
                />
              </CardContent>
            </Card>
          )}

          {/* Watch details */}
          <Card className="border-chronos-border bg-chronos-surface-raised">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-chronos-text">
                Características
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <DetailRow label="Marca" value={watch.brand} />
              <DetailRow label="Modelo" value={watch.model} />
              <DetailRow label="Referência" value={watch.reference} />
              <DetailRow
                label="Ano de Produção"
                value={watch.year_of_production?.toString()}
              />
              <Separator className="bg-chronos-border my-2" />
              <DetailRow label="Cor do Mostrador" value={watch.dial_color} />
              <DetailRow label="Material da Caixa" value={watch.case_material} />
              <DetailRow
                label="Diâmetro"
                value={
                  watch.case_diameter_mm
                    ? `${watch.case_diameter_mm}mm`
                    : null
                }
              />
              <DetailRow label="Movimento" value={watch.movement} />
              <DetailRow label="Condição" value={conditionLabel} />
              <DetailRow label="Acessórios" value={watch.accessories} />
            </CardContent>
          </Card>

          {/* Description */}
          {watch.description && (
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-chronos-text">
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-chronos-text leading-relaxed whitespace-pre-wrap">
                  {watch.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {watch.notes && (
            <Card className="border-chronos-border bg-chronos-surface-raised border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-amber-400">
                  Notas Internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-chronos-text-muted leading-relaxed whitespace-pre-wrap">
                  {watch.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir relógio"
        description={`Tem certeza que deseja excluir o ${watch.brand} ${watch.model}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
