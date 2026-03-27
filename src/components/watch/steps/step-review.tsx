"use client";

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
} from "lucide-react";
import {
  WATCH_CONDITION_LABELS,
  type WatchCondition,
} from "@/shared/constants";
import type { WatchFormData } from "../watch-wizard";

type StepReviewProps = {
  formData: WatchFormData;
  imagePreview: string | null;
  isComplete: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onReset: () => void;
};

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
      <span className="text-sm text-chronos-text-muted shrink-0">
        {label}
      </span>
      <span className="text-sm text-chronos-text text-right">{value}</span>
    </div>
  );
}

export function StepReview({
  formData,
  imagePreview,
  isComplete,
  onConfirm,
  onEdit,
  onReset,
}: StepReviewProps) {
  if (isComplete) {
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
              foi adicionado ao seu inventário com status{" "}
              <Badge
                variant="outline"
                className="border-0 bg-chronos-text-muted/10 text-chronos-text-muted mx-1"
              >
                Rascunho
              </Badge>
            </p>
            <p className="text-xs text-chronos-text-subtle mb-8">
              Quando o banco de dados estiver configurado, os dados serão
              persistidos automaticamente.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={onReset}
                className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
              >
                <Watch className="mr-2 h-4 w-4" />
                Cadastrar Outro Relógio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priceFormatted = formData.asking_price
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(formData.asking_price))
    : null;

  const conditionLabel = formData.condition
    ? WATCH_CONDITION_LABELS[formData.condition as WatchCondition]
    : null;

  return (
    <Card className="border-chronos-border bg-chronos-surface-raised">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-chronos-text mb-2">
            Revisão Final
          </h2>
          <p className="text-sm text-chronos-text-muted">
            Confira os dados antes de salvar o relógio no inventário
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
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

          {/* Details */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
              Identificação
            </h4>
            <ReviewField label="Marca" value={formData.brand} />
            <ReviewField label="Modelo" value={formData.model} />
            <ReviewField label="Referência" value={formData.reference} />
            <ReviewField
              label="Ano"
              value={formData.year_of_production}
            />

            <Separator className="bg-chronos-border my-3" />

            <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
              Características
            </h4>
            <ReviewField label="Mostrador" value={formData.dial_color} />
            <ReviewField
              label="Material"
              value={formData.case_material}
            />
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
            <ReviewField
              label="Acessórios"
              value={formData.accessories}
            />

            {formData.description && (
              <>
                <Separator className="bg-chronos-border my-3" />
                <h4 className="text-sm font-semibold text-chronos-text-muted uppercase tracking-wider mb-3">
                  Descrição
                </h4>
                <p className="text-sm text-chronos-text leading-relaxed">
                  {formData.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8 pt-6 border-t border-chronos-border">
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Dados
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Recomeçar
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar e Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
