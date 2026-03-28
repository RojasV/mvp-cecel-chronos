"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  WATCH_STATUS_LABELS,
  WATCH_CONDITION_LABELS,
} from "@/shared/constants";
import type { WatchStatus, WatchCondition } from "@/shared/constants";

type FormState = {
  brand: string;
  model: string;
  reference: string;
  year_of_production: string;
  dial_color: string;
  case_material: string;
  case_diameter_mm: string;
  movement: string;
  condition: string;
  accessories: string;
  asking_price: string;
  description: string;
  notes: string;
  status: string;
  acquisition_type: string;
  purchase_cost: string;
  acquired_at: string;
  supplier_name: string;
};

const EMPTY_FORM: FormState = {
  brand: "",
  model: "",
  reference: "",
  year_of_production: "",
  dial_color: "",
  case_material: "",
  case_diameter_mm: "",
  movement: "",
  condition: "",
  accessories: "",
  asking_price: "",
  description: "",
  notes: "",
  status: "available",
  acquisition_type: "",
  purchase_cost: "",
  acquired_at: "",
  supplier_name: "",
};

export default function EditWatchPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [watchName, setWatchName] = useState("");

  useEffect(() => {
    fetch(`/api/v1/watches/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const w = d.watch;
        if (!w) return;
        setWatchName(`${w.brand} ${w.model}`);
        const primaryImg =
          w.watch_images?.find((i: { is_primary: boolean }) => i.is_primary)
            ?.url ?? w.watch_images?.[0]?.url;
        setImageUrl(primaryImg ?? null);
        setForm({
          brand: w.brand ?? "",
          model: w.model ?? "",
          reference: w.reference ?? "",
          year_of_production: w.year_of_production?.toString() ?? "",
          dial_color: w.dial_color ?? "",
          case_material: w.case_material ?? "",
          case_diameter_mm: w.case_diameter_mm?.toString() ?? "",
          movement: w.movement ?? "",
          condition: w.condition ?? "",
          accessories: w.accessories ?? "",
          asking_price: w.asking_price?.toString() ?? "",
          description: w.description ?? "",
          notes: w.notes ?? "",
          status: w.status ?? "available",
          acquisition_type: w.acquisition?.type ?? "",
          purchase_cost: w.acquisition?.cost?.toString() ?? "",
          acquired_at: w.acquisition?.acquired_at ?? "",
          supplier_name: w.acquisition?.supplier_name ?? "",
        });
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [params.id]);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.brand.trim()) newErrors.brand = "Marca é obrigatória";
    if (!form.model.trim()) newErrors.model = "Modelo é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/watches/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }
      toast.success("Relógio atualizado com sucesso");
      router.push(`/relogios/${params.id}`);
    } catch (err) {
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/relogios/${params.id}`)}
          className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-chronos-text">
            Editar {watchName}
          </h1>
          <p className="text-sm text-chronos-text-muted">
            Altere os dados e clique em Salvar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image preview + status */}
          <div className="space-y-4">
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardContent className="p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={watchName}
                    className="w-full rounded-lg object-contain max-h-[300px]"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-chronos-surface flex items-center justify-center">
                    <ImageOff className="h-16 w-16 text-chronos-text-subtle" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-chronos-text">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v)}
                >
                  <SelectTrigger className="border-chronos-border bg-chronos-surface text-chronos-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-chronos-border bg-chronos-surface-raised">
                    {Object.entries(WATCH_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identification */}
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-chronos-text">
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Marca *</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="Ex: Rolex"
                    className={cn(
                      "border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle",
                      errors.brand && "border-red-500",
                    )}
                  />
                  {errors.brand && (
                    <p className="text-xs text-red-400">{errors.brand}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Modelo *</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => updateField("model", e.target.value)}
                    placeholder="Ex: Submariner Date"
                    className={cn(
                      "border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle",
                      errors.model && "border-red-500",
                    )}
                  />
                  {errors.model && (
                    <p className="text-xs text-red-400">{errors.model}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Referência</Label>
                  <Input
                    value={form.reference}
                    onChange={(e) => updateField("reference", e.target.value)}
                    placeholder="Ex: 126610LN"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Ano de Produção
                  </Label>
                  <Input
                    value={form.year_of_production}
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
                  <Label className="text-chronos-text-muted">
                    Cor do Mostrador
                  </Label>
                  <Input
                    value={form.dial_color}
                    onChange={(e) => updateField("dial_color", e.target.value)}
                    placeholder="Ex: Preto, Azul"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Material da Caixa
                  </Label>
                  <Input
                    value={form.case_material}
                    onChange={(e) =>
                      updateField("case_material", e.target.value)
                    }
                    placeholder="Ex: Aço Inoxidável"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Diâmetro (mm)
                  </Label>
                  <Input
                    value={form.case_diameter_mm}
                    onChange={(e) =>
                      updateField("case_diameter_mm", e.target.value)
                    }
                    placeholder="Ex: 41"
                    type="number"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Movimento</Label>
                  <Input
                    value={form.movement}
                    onChange={(e) => updateField("movement", e.target.value)}
                    placeholder="Ex: Automático"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Condição</Label>
                  <Select
                    value={form.condition}
                    onValueChange={(v) => updateField("condition", v)}
                  >
                    <SelectTrigger className="border-chronos-border bg-chronos-surface text-chronos-text">
                      <SelectValue placeholder="Selecione" />
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
                    value={form.accessories}
                    onChange={(e) =>
                      updateField("accessories", e.target.value)
                    }
                    placeholder="Ex: Caixa, Documentos"
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
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Preço de Venda (R$)
                  </Label>
                  <Input
                    value={form.asking_price}
                    onChange={(e) =>
                      updateField("asking_price", e.target.value)
                    }
                    placeholder="Ex: 45000"
                    type="number"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Descrição do relógio..."
                    rows={4}
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Notas Internas
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Notas internas..."
                    rows={2}
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Acquisition */}
            <Card className="border-chronos-border bg-chronos-surface-raised">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-chronos-text">
                  Dados da Aquisição
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Tipo de Aquisição
                  </Label>
                  <Select
                    value={form.acquisition_type}
                    onValueChange={(v) => updateField("acquisition_type", v)}
                  >
                    <SelectTrigger className="border-chronos-border bg-chronos-surface text-chronos-text">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="border-chronos-border bg-chronos-surface-raised">
                      <SelectItem value="direct_purchase">Compra Direta</SelectItem>
                      <SelectItem value="trade">Permuta</SelectItem>
                      <SelectItem value="consignment">Consignação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Custo de Aquisição (R$)
                  </Label>
                  <Input
                    value={form.purchase_cost}
                    onChange={(e) =>
                      updateField("purchase_cost", e.target.value)
                    }
                    placeholder="Ex: 30000"
                    type="number"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">
                    Data da Aquisição
                  </Label>
                  <Input
                    type="date"
                    value={form.acquired_at}
                    onChange={(e) => updateField("acquired_at", e.target.value)}
                    className="border-chronos-border bg-chronos-surface text-chronos-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-chronos-text-muted">Fornecedor</Label>
                  <Input
                    value={form.supplier_name}
                    onChange={(e) =>
                      updateField("supplier_name", e.target.value)
                    }
                    placeholder="Nome do fornecedor"
                    className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
                  />
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-chronos-border" />

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/relogios/${params.id}`)}
                className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
