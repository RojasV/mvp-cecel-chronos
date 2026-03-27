"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  SkipForward,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WatchSuggestions } from "@/domain/ports/i-image-analyzer";

type StepAnalysisProps = {
  imageBase64: string;
  imageMimeType: string;
  imagePreview: string;
  onAnalysisComplete: (suggestions: WatchSuggestions) => void;
  onSkip: () => void;
};

type AnalysisState = "idle" | "analyzing" | "complete" | "error";

const SUGGESTION_LABELS: Record<string, string> = {
  brand: "Marca",
  model: "Modelo",
  reference: "Referência",
  dial_color: "Cor do Mostrador",
  case_material: "Material da Caixa",
  case_diameter_mm: "Diâmetro (mm)",
  movement: "Movimento",
  year_of_production: "Ano de Produção",
  condition: "Condição",
  accessories: "Acessórios",
  description: "Descrição",
};

function confidenceColor(score: number): string {
  if (score >= 0.9) return "bg-chronos-success/20 text-chronos-success";
  if (score >= 0.7) return "bg-chronos-gold/20 text-chronos-gold";
  if (score >= 0.5) return "bg-chronos-warning/20 text-chronos-warning";
  return "bg-chronos-error/20 text-chronos-error";
}

function confidenceLabel(score: number): string {
  if (score >= 0.9) return "Alta";
  if (score >= 0.7) return "Boa";
  if (score >= 0.5) return "Média";
  return "Baixa";
}

export function StepAnalysis({
  imageBase64,
  imageMimeType,
  imagePreview,
  onAnalysisComplete,
  onSkip,
}: StepAnalysisProps) {
  const [state, setState] = useState<AnalysisState>("idle");
  const [suggestions, setSuggestions] = useState<WatchSuggestions | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function startAnalysis() {
    setState("analyzing");
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const response = await fetch("/api/v1/analyze-watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageMimeType,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao analisar imagem");
      }

      const result: WatchSuggestions = await response.json();
      setSuggestions(result);
      setState("complete");
    } catch (err) {
      clearInterval(progressInterval);
      setState("error");
      setError(
        err instanceof Error ? err.message : "Erro desconhecido",
      );
    }
  }

  useEffect(() => {
    startAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-chronos-border bg-chronos-surface-raised">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Relógio em análise"
                className={cn(
                  "max-h-[400px] rounded-xl border border-chronos-border object-contain transition-all",
                  state === "analyzing" && "animate-pulse",
                )}
              />
              {state === "analyzing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chronos-gold/20 animate-spin-slow">
                      <Sparkles className="h-8 w-8 text-chronos-gold" />
                    </div>
                    <p className="text-white font-medium">
                      Analisando...
                    </p>
                  </div>
                </div>
              )}
              {state === "complete" && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-chronos-success/20 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 text-chronos-success" />
                    <span className="text-xs font-medium text-chronos-success">
                      Análise completa
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-chronos-text">
                {state === "analyzing" && "Analisando com IA..."}
                {state === "complete" && "Sugestões da IA"}
                {state === "error" && "Erro na análise"}
                {state === "idle" && "Preparando análise..."}
              </h2>
            </div>

            {state === "analyzing" && (
              <div className="space-y-4">
                <div className="w-full bg-chronos-surface rounded-full h-2">
                  <div
                    className="bg-chronos-gold h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-chronos-text-muted">
                  A inteligência artificial está identificando marca, modelo,
                  material e outras características do relógio...
                </p>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="h-4 w-24 rounded bg-chronos-surface-hover" />
                      <div
                        className="h-4 rounded bg-chronos-surface-hover"
                        style={{ width: `${40 + Math.random() * 40}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-chronos-error/10 border border-chronos-error/20 p-4">
                  <AlertTriangle className="h-5 w-5 text-chronos-error shrink-0" />
                  <p className="text-sm text-chronos-text">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={startAnalysis}
                    className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Preencher Manualmente
                  </Button>
                </div>
              </div>
            )}

            {state === "complete" && suggestions && (
              <div className="space-y-4">
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
                  {Object.entries(SUGGESTION_LABELS).map(([key, label]) => {
                    const value =
                      suggestions[key as keyof WatchSuggestions];
                    const confidence =
                      suggestions.confidence_scores?.[key] ?? 0;

                    if (
                      value === null ||
                      value === undefined ||
                      key === "confidence_scores"
                    )
                      return null;

                    const displayValue =
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value);

                    return (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3 rounded-lg bg-chronos-surface/50 border border-chronos-border/50 px-4 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-chronos-text-muted mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm text-chronos-text truncate">
                            {key === "description"
                              ? displayValue.slice(0, 80) + "..."
                              : displayValue}
                          </p>
                        </div>
                        {confidence > 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 text-[10px] border-0",
                              confidenceColor(confidence),
                            )}
                          >
                            {confidenceLabel(confidence)}{" "}
                            {Math.round(confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => onAnalysisComplete(suggestions)}
                    className="flex-1 bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aceitar e Editar Dados
                  </Button>
                </div>
                <p className="text-xs text-chronos-text-subtle text-center">
                  Você poderá editar todos os campos no próximo passo
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
