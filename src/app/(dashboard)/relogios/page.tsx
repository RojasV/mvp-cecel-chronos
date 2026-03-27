"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Watch,
  Plus,
  Send,
  Loader2,
  Search,
  X,
  Trash2,
  ImageOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WATCH_STATUS_LABELS, WATCH_CONDITION_LABELS } from "@/shared/constants";
import type { WatchStatus, WatchCondition } from "@/shared/constants";

type WatchImage = {
  id: string;
  url: string;
  is_primary: boolean;
};

type WatchItem = {
  id: string;
  brand: string;
  model: string;
  reference: string | null;
  asking_price: number | null;
  status: WatchStatus;
  condition: string | null;
  dial_color: string | null;
  case_material: string | null;
  year_of_production: number | null;
  watch_images: WatchImage[];
};

const TARGET_PHONES = ["5567981532222", "5567981167199"];

export default function EstoquePage() {
  const router = useRouter();
  const [watches, setWatches] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dispatching, setDispatching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchWatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/v1/watches?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWatches(data.watches ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  const filtered = watches.filter((w) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      w.brand?.toLowerCase().includes(term) ||
      w.model?.toLowerCase().includes(term) ||
      w.reference?.toLowerCase().includes(term)
    );
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((w) => w.id)));
    }
  }

  async function handleDelete() {
    if (selectedIds.size === 0) return;
    const confirmMsg = selectedIds.size === 1
      ? "Tem certeza que deseja excluir este relógio?"
      : `Tem certeza que deseja excluir ${selectedIds.size} relógios?`;
    if (!window.confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      const ids = Array.from(selectedIds).join(",");
      const res = await fetch(`/api/v1/watches?ids=${ids}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir");
      }
      toast.success("Excluído!", {
        description: `${selectedIds.size} relógio(s) removido(s) do estoque`,
      });
      setSelectedIds(new Set());
      fetchWatches();
    } catch (err) {
      toast.error("Erro ao excluir", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleDispatch() {
    if (selectedIds.size === 0) return;
    setDispatching(true);
    try {
      const res = await fetch("/api/v1/dispatch-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchIds: Array.from(selectedIds),
          phones: TARGET_PHONES,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao disparar");
      }

      const result = await res.json();
      toast.success("WhatsApp disparado!", {
        description: `${result.sent} mensagens enviadas, ${result.failed} falhas`,
      });
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Erro ao disparar WhatsApp", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setDispatching(false);
    }
  }

  function formatPrice(value: number | null) {
    if (!value) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function getStatusBadge(status: WatchStatus) {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-400",
      available: "bg-emerald-500/10 text-emerald-400",
      reserved: "bg-amber-500/10 text-amber-400",
      sold: "bg-blue-500/10 text-blue-400",
      consigned: "bg-purple-500/10 text-purple-400",
    };
    return (
      <Badge
        variant="outline"
        className={`border-0 ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
      >
        {WATCH_STATUS_LABELS[status] ?? status}
      </Badge>
    );
  }

  const primaryImage = (w: WatchItem) =>
    w.watch_images?.find((i) => i.is_primary)?.url ?? w.watch_images?.[0]?.url;

  return (
    <div className="space-y-6">
      <PageHeader title="Estoque" description="Gerencie seu inventário de relógios">
        <Link href="/relogios/novo">
          <Button className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light">
            <Plus className="mr-2 h-4 w-4" />
            Nova Aquisição
          </Button>
        </Link>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chronos-text-subtle" />
            <Input
              placeholder="Buscar marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-chronos-border bg-chronos-surface text-chronos-text">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-chronos-border bg-chronos-surface-raised">
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(WATCH_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-chronos-text-muted">
              {selectedIds.size} selecionado(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
            >
              <X className="mr-1 h-3 w-3" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-3 w-3" />
              )}
              Excluir
            </Button>
            <Button
              size="sm"
              onClick={handleDispatch}
              disabled={dispatching}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {dispatching ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Send className="mr-2 h-3 w-3" />
              )}
              Disparar WhatsApp
            </Button>
          </div>
        )}
      </div>

      {/* Select all */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onCheckedChange={selectAll}
            className="border-chronos-border data-[state=checked]:bg-chronos-gold data-[state=checked]:border-chronos-gold"
          />
          <span className="text-sm text-chronos-text-muted">
            Selecionar todos ({filtered.length})
          </span>
        </div>
      )}

      {/* Watch grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-chronos-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-chronos-border bg-chronos-surface-raised">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-chronos-text-muted">
              <Watch className="h-12 w-12 mb-4 text-chronos-text-subtle" />
              <p className="text-lg font-medium text-chronos-text mb-1">
                Nenhum relógio encontrado
              </p>
              <p className="text-sm mb-6">
                {watches.length === 0
                  ? "Cadastre seu primeiro relógio"
                  : "Nenhum resultado para o filtro atual"}
              </p>
              {watches.length === 0 && (
                <Link href="/relogios/novo">
                  <Button className="bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Aquisição
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((w) => {
            const img = primaryImage(w);
            const isSelected = selectedIds.has(w.id);
            return (
              <Card
                key={w.id}
                className={`border-chronos-border bg-chronos-surface-raised overflow-hidden transition-all cursor-pointer hover:border-chronos-gold/30 hover:shadow-lg hover:shadow-chronos-gold/5 ${
                  isSelected ? "ring-2 ring-chronos-gold border-chronos-gold" : ""
                }`}
                onClick={() => router.push(`/relogios/${w.id}`)}
              >
                <div className="relative aspect-square bg-chronos-surface">
                  {img ? (
                    <img
                      src={img}
                      alt={`${w.brand} ${w.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-12 w-12 text-chronos-text-subtle" />
                    </div>
                  )}
                  <div
                    className="absolute top-2 left-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(w.id)}
                      className="border-white/50 bg-black/30 data-[state=checked]:bg-chronos-gold data-[state=checked]:border-chronos-gold"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(w.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-chronos-text truncate">
                    {w.brand} {w.model}
                  </h3>
                  {w.reference && (
                    <p className="text-xs text-chronos-text-muted truncate">
                      Ref. {w.reference}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-chronos-gold">
                      {formatPrice(w.asking_price)}
                    </span>
                    {w.condition && (
                      <span className="text-xs text-chronos-text-subtle">
                        {WATCH_CONDITION_LABELS[w.condition as WatchCondition] ??
                          w.condition}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dispatch status bar */}
      {dispatching && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-xl bg-chronos-surface-raised border border-chronos-gold/30 px-6 py-3 shadow-2xl">
            <Loader2 className="h-5 w-5 text-chronos-gold animate-spin" />
            <span className="text-sm font-medium text-chronos-text">
              Disparando para {TARGET_PHONES.length} números...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
