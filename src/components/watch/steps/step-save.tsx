"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Edit,
  RotateCcw,
  PartyPopper,
  Watch,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  WATCH_CONDITION_LABELS,
  type WatchCondition,
} from "@/shared/constants";
import { toast } from "sonner";
import type { WatchFormData, AcquisitionData } from "../watch-wizard";
import type { WatchSuggestions } from "@/domain/ports/i-image-analyzer";
import Link from "next/link";

type StepSaveProps = {
  formData: WatchFormData;
  acquisitionData: AcquisitionData;
  imagePreview: string | null;
  imageBase64: string | null;
  imageMimeType: string | null;
  aiSuggestions: WatchSuggestions | null;
  onEdit: () => void;
  onReset: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-sm text-chronos-text-muted shrink-0">{label}</span>
      <span className="text-sm text-chronos-text text-right">{value}</span>
    </div>
  );
}

export function StepSave({
  formData,
  acquisitionData,
  imagePreview,
  imageBase64,
  imageMimeType,
  aiSuggestions,
  onEdit,
  onReset,
}: StepSaveProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaveState("saving");
    setErrorMsg(null);

    try {
      const response = await fetch("/api/v1/watches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageBase64: imageBase64 ?? undefined,
          imageMimeType: imageMimeType ?? undefined,
          acquisition_type: acquisitionData.type,
          purchase_cost: acquisitionData.purchase_cost || undefined,
          supplier_name: acquisitionData.supplier_name || undefined,
          acquired_at: acquisitionData.acquired_at || undefined,
          ai_suggestions: aiSuggestions ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar relógio");
      }

      setSaveState("saved");
      toast.success("Relógio salvo com sucesso!", {
        description: `${formData.brand} ${formData.model} adicionado ao estoque`,
      });
    } catch (err) {
      setSaveState("error");
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErrorMsg(msg);
      toast.error("Erro ao salvar", { description: msg });
    }
  }

  useEffect(() => {
    handleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceFormatted = formData.asking_price
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(formData.asking_price))
    : null;

  const costFormatted = acquisitionData.purchase_cost
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(acquisitionData.purchase_cost))
    : null;

  const conditionLabel = formData.condition
    ? WATCH_CONDITION_LABELS[formData.condition as WatchCondition]
    : null;

  if (saveState === "saving") {
    return (
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-chronos-gold animate-spin mb-6" />
            <h2 className="text-xl font-semibold text-chronos-text mb-2">
              Salvando no estoque...
            </h2>
            <p className="text-sm text-chronos-text-muted">
              Fazendo upload da imagem e salvando os dados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (saveState === "saved") {
    return (
      <Card className="border-chronos-success/30 bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chronos-success/20 mb-6">
              <PartyPopper className="h-10 w-10 text-chronos-success" />
            </div>
            <h2 className="text-2xl font-semibold text-chronos-text mb-2">
              Relógio Cadastrado!
            </h2>
            <p className="text-chronos-text-muted text-center max-w-md mb-2">
              <strong className="text-chronos-gold">
                {formData.brand} {formData.model}
              </strong>{" "}
              foi adicionado ao seu inventário
            </p>
            {costFormatted && priceFormatted && (
              <div className="flex gap-4 mt-2 mb-6">
                <Badge
                  variant="outline"
                  className="border-0 bg-red-500/10 text-red-400"
                >
                  Custo: {costFormatted}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-0 bg-chronos-gold/10 text-chronos-gold"
                >
                  Venda: {priceFormatted}
                </Badge>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Link href="/relogios">
                <Button
                  variant="outline"
                  className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver Estoque
                </Button>
              </Link>
              <Button
                onClick={onReset}
                className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
              >
                <Watch className="mr-2 h-4 w-4" />
                Cadastrar Outro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (saveState === "error") {
    return (
      <Card className="border-chronos-error/30 bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chronos-error/20 mb-6">
              <AlertTriangle className="h-10 w-10 text-chronos-error" />
            </div>
            <h2 className="text-xl font-semibold text-chronos-text mb-2">
              Erro ao Salvar
            </h2>
            <p className="text-chronos-text-muted text-center max-w-md mb-6">
              {errorMsg}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onEdit}
                className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Dados
              </Button>
              <Button
                onClick={handleSave}
                className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // idle — show review before saving
  return (
    <Card className="border-chronos-border bg-chronos-surface-raised">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-chronos-text mb-2">
            Revisão Final
          </h2>
          <p className="text-sm text-chronos-text-muted">
            Confira os dados antes de salvar no estoque
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {imagePreview && (
              <img
                src={imagePreview}
                alt={`${formData.brand} ${formData.model}`}
                className="max-h-[350px] rounded-xl border border-chronos-border object-contain"
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-chronos-gold">
                {formData.brand} {formData.model}
              </h3>
              {formData.reference && (
                <p className="text-sm text-chronos-text-muted">
                  Ref. {formData.reference}
                </p>
              )}
              {priceFormatted && (
                <p className="text-xl font-bold text-chronos-text mt-2">
                  {priceFormatted}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
              Aquisição
            </h4>
            <ReviewField
              label="Tipo"
              value={
                acquisitionData.type === "direct_purchase"
                  ? "Compra Direta"
                  : "Permuta"
              }
            />
            <ReviewField label="Custo" value={costFormatted} />
            <ReviewField
              label="Fornecedor"
              value={acquisitionData.supplier_name}
            />
            <ReviewField label="Data" value={acquisitionData.acquired_at} />

            <Separator className="bg-chronos-border my-3" />

            <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
              Identificação
            </h4>
            <ReviewField label="Marca" value={formData.brand} />
            <ReviewField label="Modelo" value={formData.model} />
            <ReviewField label="Referência" value={formData.reference} />
            <ReviewField label="Ano" value={formData.year_of_production} />

            <Separator className="bg-chronos-border my-3" />

            <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
              Características
            </h4>
            <ReviewField label="Mostrador" value={formData.dial_color} />
            <ReviewField label="Material" value={formData.case_material} />
            <ReviewField
              label="Diâmetro"
              value={
                formData.case_diameter_mm
                  ? `${formData.case_diameter_mm}mm`
                  : null
              }
            />
            <ReviewField label="Movimento" value={formData.movement} />
            <ReviewField label="Condição" value={conditionLabel} />
            <ReviewField label="Acessórios" value={formData.accessories} />
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-6 border-t border-chronos-border">
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Dados
          </Button>
          <Button
            onClick={handleSave}
            className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Salvar no Estoque
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
