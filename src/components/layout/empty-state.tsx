import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-chronos-border bg-chronos-surface-raised/50 px-6 py-16",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chronos-gold/10">
        <Icon className="h-7 w-7 text-chronos-gold" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-chronos-text">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-center text-sm text-chronos-text-muted">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
