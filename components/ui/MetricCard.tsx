import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon?: LucideIcon;
  description?: string;
  className?: string;
  accent?: boolean;
}

export function MetricCard({
  title,
  value,
  delta,
  deltaUp,
  icon: Icon,
  description,
  className,
  accent,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 flex flex-col gap-3",
        accent && "border-[var(--teal)]/30 bg-[var(--teal)]/5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            accent ? "bg-[var(--teal)]/20 text-[var(--teal)]" : "bg-muted text-muted-foreground"
          )}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "mb-0.5 text-xs font-medium",
              deltaUp === undefined
                ? "text-muted-foreground"
                : deltaUp
                ? "text-emerald-500"
                : "text-red-500"
            )}
          >
            {deltaUp ? "▲" : deltaUp === false ? "▼" : ""} {delta}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
