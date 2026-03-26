import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  lines?: number;
  className?: string;
};

export function LoadingState({ lines = 4, className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full bg-chronos-surface-hover" />
          <Skeleton className="h-4 w-3/4 bg-chronos-surface-hover" />
        </div>
      ))}
    </div>
  );
}

export function LoadingCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-chronos-border bg-chronos-surface-raised p-4 space-y-3"
        >
          <Skeleton className="h-40 w-full rounded-lg bg-chronos-surface-hover" />
          <Skeleton className="h-4 w-2/3 bg-chronos-surface-hover" />
          <Skeleton className="h-4 w-1/2 bg-chronos-surface-hover" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20 bg-chronos-surface-hover" />
            <Skeleton className="h-6 w-16 bg-chronos-surface-hover" />
          </div>
        </div>
      ))}
    </div>
  );
}
