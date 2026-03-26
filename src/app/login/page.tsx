"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Watch, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Credenciais inválidas", {
          description: "Verifique seu e-mail e senha.",
        });
        return;
      }

      toast.success("Bem-vindo ao Chronos!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Erro ao fazer login", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-chronos-navy px-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-chronos-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-chronos-gold/3 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-chronos-border bg-chronos-surface-raised/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-chronos-gold/10 mb-4">
              <Watch className="h-8 w-8 text-chronos-gold" />
            </div>
            <h1 className="text-2xl font-semibold tracking-[0.2em] text-chronos-text">
              CHRONOS
            </h1>
            <p className="mt-2 text-sm text-chronos-text-muted">
              Gestão Inteligente de Relógios de Luxo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-chronos-text-muted"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle focus-visible:ring-chronos-gold/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-chronos-text-muted"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-chronos-border bg-chronos-surface text-chronos-text placeholder:text-chronos-text-subtle focus-visible:ring-chronos-gold/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-chronos-text-subtle hover:text-chronos-text-muted transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-chronos-gold text-chronos-navy font-semibold hover:bg-chronos-gold-light transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-chronos-text-subtle">
            Plataforma exclusiva — acesso autorizado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
