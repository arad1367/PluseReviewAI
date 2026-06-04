import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const CONFIG: Record<Category, string> = {
  "bug-risk": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  security: "bg-red-500/10 text-red-600 dark:text-red-400",
  performance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  maintainability: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  testing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  architecture: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  style: "bg-muted text-muted-foreground",
};

const LABELS: Record<Category, string> = {
  "bug-risk": "Bug Risk",
  security: "Security",
  performance: "Performance",
  maintainability: "Maintainability",
  testing: "Testing",
  architecture: "Architecture",
  style: "Style",
};

export function CategoryBadge({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
        CONFIG[category],
        className
      )}
    >
      {LABELS[category]}
    </span>
  );
}
