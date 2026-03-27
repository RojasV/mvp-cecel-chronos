"use client";

import { useState } from "react";
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
  MessageCircle,
  Loader2,
  Send,
  AlertTriangle,
} from "lucide-react";
import {
  WATCH_CONDITION_LABELS,
  type WatchCondition,
} from "@/shared/constants";
import { toast } from "sonner";
import type { WatchFormData } from "../watch-wizard";

type StepReviewProps = {
  formData: WatchFormData;
  imagePreview: string | null;
  imageBase64: string | null;
  isComplete: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onReset: () => void;
};

type WhatsAppStatus = "idle" | "sending" | "sent" | "error";

const TARGET_PHONE = "5567981532222";

function formatWhatsAppMessage(data: WatchFormData): string {
  const price = data.asking_price
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(data.asking_price))
    : "Sob consulta";

  const conditionLabel = data.condition
    ? WATCH_CONDITION_LABELS[data.condition as WatchCondition] ?? data.condition
    : "";

  const lines = [
    `⌚ *${data.brand} ${data.model}*`,
    "",
  ];

  if (data.reference) lines.push(`📋 Ref: ${data.reference}`);
  if (conditionLabel) lines.push(`✨ Condição: ${conditionLabel}`);
  if (data.case_material) lines.push(`🔩 Material: ${data.case_material}`);
  if (data.dial_color) lines.push(`🎨 Mostrador: ${data.dial_color}`);
  if (data.case_diameter_mm) lines.push(`📏 Diâmetro: ${data.case_diameter_mm}mm`);
  if (data.movement) lines.push(`⚙️ Movimento: ${data.movement}`);
  if (data.year_of_production) lines.push(`📅 Ano: ${data.year_of_production}`);
  if (data.accessories) lines.push(`📦 Acessórios: ${data.accessories}`);

  lines.push("");
  lines.push(`💰 *${price}*`);

  if (data.description) {
    lines.push("");
    lines.push(data.description);
  }

  return lines.join("\n");
}

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
  imageBase64,
  isComplete,
  onConfirm,
  onEdit,
  onReset,
}: StepReviewProps) {
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>("idle");
  const [sending, setSending] = useState(false);

  async function handleConfirmAndSend() {
    setSending(true);
    onConfirm();

    setWhatsappStatus("sending");

    try {
      const message = formatWhatsAppMessage(formData);

      const response = await fetch("/api/v1/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: TARGET_PHONE,
          text: message,
          imageBase64: imageBase64 ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar WhatsApp");
      }

      setWhatsappStatus("sent");
      toast.success("WhatsApp enviado!", {
        description: `Mensagem enviada para ${TARGET_PHONE}`,
      });
    } catch (err) {
      setWhatsappStatus("error");
      toast.error("Erro ao enviar WhatsApp", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setSending(false);
    }
  }

  async function retrySend() {
    setWhatsappStatus("sending");
    setSending(true);

    try {
      const message = formatWhatsAppMessage(formData);
      const response = await fetch("/api/v1/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: TARGET_PHONE,
          text: message,
          imageBase64: imageBase64 ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar WhatsApp");
      }

      setWhatsappStatus("sent");
      toast.success("WhatsApp enviado!", {
        description: `Mensagem reenviada para ${TARGET_PHONE}`,
      });
    } catch (err) {
      setWhatsappStatus("error");
      toast.error("Erro ao enviar WhatsApp", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setSending(false);
    }
  }

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
            <p className="text-chronos-text-muted text-center max-w-md mb-4">
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

            {/* WhatsApp status */}
            <div className="w-full max-w-sm mt-2 mb-6">
              {whatsappStatus === "sending" && (
                <div className="flex items-center gap-3 rounded-lg bg-chronos-gold/10 border border-chronos-gold/20 p-4">
                  <Loader2 className="h-5 w-5 text-chronos-gold animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-chronos-text">
                      Enviando via WhatsApp...
                    </p>
                    <p className="text-xs text-chronos-text-muted">
                      Disparando para {TARGET_PHONE}
                    </p>
                  </div>
                </div>
              )}

              {whatsappStatus === "sent" && (
                <div className="flex items-center gap-3 rounded-lg bg-chronos-success/10 border border-chronos-success/20 p-4">
                  <CheckCircle2 className="h-5 w-5 text-chronos-success shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-chronos-text">
                      WhatsApp enviado com sucesso!
                    </p>
                    <p className="text-xs text-chronos-text-muted">
                      Mensagem com foto + dados entregue para {TARGET_PHONE}
                    </p>
                  </div>
                </div>
              )}

              {whatsappStatus === "error" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg bg-chronos-error/10 border border-chronos-error/20 p-4">
                    <AlertTriangle className="h-5 w-5 text-chronos-error shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chronos-text">
                        Erro ao enviar WhatsApp
                      </p>
                      <p className="text-xs text-chronos-text-muted">
                        Verifique a conexão da Evolution API
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={retrySend}
                    disabled={sending}
                    variant="outline"
                    size="sm"
                    className="w-full border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-3 w-3" />
                    )}
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>

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
            Confira os dados antes de salvar e disparar no WhatsApp
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

        {/* WhatsApp preview */}
        <div className="mt-6 rounded-lg bg-emerald-950/30 border border-emerald-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Preview WhatsApp
            </span>
          </div>
          <p className="text-xs text-chronos-text-muted">
            Ao confirmar, uma mensagem com foto e dados do relógio será enviada
            automaticamente para <strong className="text-chronos-text">{TARGET_PHONE}</strong>
          </p>
        </div>

        {/* Actions */}
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
              onClick={handleConfirmAndSend}
              disabled={sending}
              className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirmar e Enviar WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
