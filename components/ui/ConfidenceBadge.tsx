import { cn } from "@/lib/utils";

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: number;
  className?: string;
}) {
  const pct = Math.round(confidence * 100);
  const level = pct >= 85 ? "high" : pct >= 65 ? "medium" : "low";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        level === "high" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        level === "medium" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        level === "low" && "bg-muted text-muted-foreground",
        className
      )}
      title={`AI confidence: ${pct}%`}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "high" && "bg-emerald-500",
          level === "medium" && "bg-yellow-500",
          level === "low" && "bg-muted-foreground"
        )}
      />
      {pct}% confidence
    </span>
  );
}
