import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const CONFIG: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-500 border border-red-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
  },
  low: {
    label: "Low",
    className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  },
  info: {
    label: "Info",
    className: "bg-muted text-muted-foreground border border-border",
  },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const { label, className: base } = CONFIG[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        base,
        className
      )}
    >
      {label}
    </span>
  );
}
