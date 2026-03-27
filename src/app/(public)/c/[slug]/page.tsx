import { Watch } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicStorefrontPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-chronos-navy">
      {/* Header */}
      <header className="border-b border-chronos-border bg-chronos-navy/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chronos-gold/10">
              <Watch className="h-5 w-5 text-chronos-gold" />
            </div>
            <span className="text-lg font-semibold tracking-wider text-chronos-text">
              MARCELO MIRANDA
            </span>
          </div>
          <span className="text-sm text-chronos-text-muted capitalize">
            {slug.replace(/-/g, " ")}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-chronos-gold/10 mb-6">
            <Watch className="h-10 w-10 text-chronos-gold" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-chronos-text mb-2">
            Vitrine em breve
          </h1>
          <p className="text-chronos-text-muted max-w-md text-center">
            A vitrine pública de relógios estará disponível em breve. 
            Aqui serão exibidos os relógios disponíveis para venda.
          </p>
        </div>
      </main>
    </div>
  );
}
