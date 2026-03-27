"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ShoppingCart,
  Repeat2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcquisitionData } from "../watch-wizard";

type StepAcquisitionProps = {
  data: AcquisitionData;
  onComplete: (data: AcquisitionData) => void;
};

export function StepAcquisition({ data, onComplete }: StepAcquisitionProps) {
  const [form, setForm] = useState<AcquisitionData>(data);

  const types = [
    {
      id: "direct_purchase" as const,
      label: "Compra",
      description: "Comprou de um fornecedor ou particular",
      icon: ShoppingCart,
    },
    {
      id: "trade" as const,
      label: "Permuta",
      description: "Trocou por outro relógio",
      icon: Repeat2,
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-chronos-border bg-chronos-surface-raised">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-chronos-text mb-2">
              Tipo de Aquisição
            </h2>
            <p className="text-sm text-chronos-text-muted">
              Como esse relógio chegou ao seu inventário?
            </p>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t.id }))}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                  form.type === t.id
                    ? "border-chronos-gold bg-chronos-gold/5"
                    : "border-chronos-border bg-chronos-surface/50 hover:border-chronos-gold/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                    form.type === t.id
                      ? "bg-chronos-gold/20"
                      : "bg-chronos-surface-hover",
                  )}
                >
                  <t.icon
                    className={cn(
                      "h-7 w-7",
                      form.type === t.id
                        ? "text-chronos-gold"
                        : "text-chronos-text-muted",
                    )}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "font-semibold",
                      form.type === t.id
                        ? "text-chronos-gold"
                        : "text-chronos-text",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs text-chronos-text-muted mt-1">
                    {t.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Acquisition details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-chronos-text-muted">
                {form.type === "trade"
                  ? "Valor da Torna (R$)"
                  : "Valor de Compra (R$)"}
              </Label>
              <Input
                value={form.purchase_cost}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    purchase_cost: e.target.value,
                  }))
                }
                placeholder="Ex: 35000"
                type="number"
                className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-chronos-text-muted">
                Data da Aquisição
              </Label>
              <Input
                value={form.acquired_at}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    acquired_at: e.target.value,
                  }))
                }
                type="date"
                className="border-chronos-border bg-chronos-surface text-chronos-text"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-chronos-text-muted">
                {form.type === "trade"
                  ? "Nome de quem fez a troca"
                  : "Fornecedor / Vendedor"}
              </Label>
              <Input
                value={form.supplier_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    supplier_name: e.target.value,
                  }))
                }
                placeholder="Nome do fornecedor ou vendedor"
                className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
            >
              Continuar para Foto
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
