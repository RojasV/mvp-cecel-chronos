"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WATCH_CONDITION_LABELS,
} from "@/shared/constants";
import type { WatchFormData } from "../watch-wizard";
import type { WatchSuggestions } from "@/domain/ports/i-image-analyzer";

type StepFormProps = {
  formData: WatchFormData;
  suggestions: WatchSuggestions | null;
  onComplete: (data: WatchFormData) => void;
  onBack: () => void;
};

function AiFieldBadge({ confidence }: { confidence: number }) {
  if (confidence <= 0) return null;
  return (
    <Badge
      variant="outline"
      className="ml-2 border-0 bg-chronos-gold/10 text-chronos-gold text-[10px] gap-1"
    >
      <Sparkles className="h-2.5 w-2.5" />
      IA {Math.round(confidence * 100)}%
    </Badge>
  );
}

export function StepForm({
  formData,
  suggestions,
  onComplete,
  onBack,
}: StepFormProps) {
  const [data, setData] = useState<WatchFormData>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(field: keyof WatchFormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function getConfidence(field: string): number {
    return suggestions?.confidence_scores?.[field] ?? 0;
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!data.brand.trim()) newErrors.brand = "Marca é obrigatória";
    if (!data.model.trim()) newErrors.model = "Modelo é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onComplete(data);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identification */}
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-chronos-text">
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Marca *
              <AiFieldBadge confidence={getConfidence("brand")} />
            </Label>
            <Input
              value={data.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              placeholder="Ex: Rolex, Patek Philippe"
              className={cn(
                "border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle",
                errors.brand && "border-chronos-error",
              )}
            />
            {errors.brand && (
              <p className="text-xs text-chronos-error">{errors.brand}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Modelo *
              <AiFieldBadge confidence={getConfidence("model")} />
            </Label>
            <Input
              value={data.model}
              onChange={(e) => updateField("model", e.target.value)}
              placeholder="Ex: Submariner Date"
              className={cn(
                "border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle",
                errors.model && "border-chronos-error",
              )}
            />
            {errors.model && (
              <p className="text-xs text-chronos-error">{errors.model}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Referência
              <AiFieldBadge confidence={getConfidence("reference")} />
            </Label>
            <Input
              value={data.reference}
              onChange={(e) => updateField("reference", e.target.value)}
              placeholder="Ex: 126610LN"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Ano de Produção
              <AiFieldBadge
                confidence={getConfidence("year_of_production")}
              />
            </Label>
            <Input
              value={data.year_of_production}
              onChange={(e) =>
                updateField("year_of_production", e.target.value)
              }
              placeholder="Ex: 2023"
              type="number"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-chronos-text">
            Características
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Cor do Mostrador
              <AiFieldBadge confidence={getConfidence("dial_color")} />
            </Label>
            <Input
              value={data.dial_color}
              onChange={(e) => updateField("dial_color", e.target.value)}
              placeholder="Ex: Preto, Azul, Champagne"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Material da Caixa
              <AiFieldBadge confidence={getConfidence("case_material")} />
            </Label>
            <Input
              value={data.case_material}
              onChange={(e) =>
                updateField("case_material", e.target.value)
              }
              placeholder="Ex: Aço Inoxidável, Ouro 18k"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Diâmetro (mm)
              <AiFieldBadge
                confidence={getConfidence("case_diameter_mm")}
              />
            </Label>
            <Input
              value={data.case_diameter_mm}
              onChange={(e) =>
                updateField("case_diameter_mm", e.target.value)
              }
              placeholder="Ex: 41"
              type="number"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Movimento
              <AiFieldBadge confidence={getConfidence("movement")} />
            </Label>
            <Input
              value={data.movement}
              onChange={(e) => updateField("movement", e.target.value)}
              placeholder="Ex: Automático, Quartzo"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Condição
              <AiFieldBadge confidence={getConfidence("condition")} />
            </Label>
            <Select
              value={data.condition}
              onValueChange={(v) => updateField("condition", v)}
            >
              <SelectTrigger className="border-chronos-border bg-chronos-surface text-chronos-text">
                <SelectValue placeholder="Selecione a condição" />
              </SelectTrigger>
              <SelectContent className="border-chronos-border bg-chronos-surface-raised">
                {Object.entries(WATCH_CONDITION_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted">Acessórios</Label>
            <Input
              value={data.accessories}
              onChange={(e) =>
                updateField("accessories", e.target.value)
              }
              placeholder="Ex: Caixa, Documentos, Certificado"
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Price + description */}
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-chronos-text">
            Preço e Descrição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-chronos-text-muted">
                Preço de Venda (R$)
              </Label>
              <Input
                value={data.asking_price}
                onChange={(e) =>
                  updateField("asking_price", e.target.value)
                }
                placeholder="Ex: 45000"
                type="number"
                className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted flex items-center">
              Descrição
              {suggestions?.description && (
                <Badge
                  variant="outline"
                  className="ml-2 border-0 bg-chronos-gold/10 text-chronos-gold text-[10px] gap-1"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Gerada por IA
                </Badge>
              )}
            </Label>
            <Textarea
              value={data.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Descrição do relógio para uso em marketing..."
              rows={4}
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-chronos-text-muted">
              Notas Internas
            </Label>
            <Textarea
              value={data.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Notas internas (não visíveis ao público)..."
              rows={2}
              className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
        >
          Revisar e Confirmar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
