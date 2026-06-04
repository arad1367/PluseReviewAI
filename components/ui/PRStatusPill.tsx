import { cn } from "@/lib/utils";
import type { PRStatus } from "@/lib/types";
import { GitMerge, GitPullRequest, XCircle, FilePen } from "lucide-react";

const CONFIG: Record<PRStatus, { label: string; icon: React.ElementType; className: string }> = {
  open: {
    label: "Open",
    icon: GitPullRequest,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  merged: {
    label: "Merged",
    icon: GitMerge,
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border border-border",
  },
  draft: {
    label: "Draft",
    icon: FilePen,
    className: "bg-muted text-muted-foreground border border-border",
  },
};

export function PRStatusPill({
  status,
  className,
}: {
  status: PRStatus;
  className?: string;
}) {
  const { label, icon: Icon, className: base } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        base,
        className
      )}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}
