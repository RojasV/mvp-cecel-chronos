import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-chronos-error/20 bg-chronos-error/5 px-6 py-16",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chronos-error/10">
        <AlertTriangle className="h-7 w-7 text-chronos-error" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-chronos-text">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-center text-sm text-chronos-text-muted">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
