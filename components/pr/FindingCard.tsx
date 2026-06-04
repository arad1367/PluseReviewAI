"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import type { Finding } from "@/lib/types";

export function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card transition-all",
        finding.severity === "critical" && "border-red-500/30",
        finding.severity === "high" && "border-orange-500/20"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="mt-0.5 flex-shrink-0">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <SeverityBadge severity={finding.severity} />
            <CategoryBadge category={finding.category} />
            <ConfidenceBadge confidence={finding.confidence} />
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">
            {finding.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <FileCode size={11} className="text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground font-mono truncate">
              {finding.file}
              {finding.lineReference && (
                <span className="text-[var(--teal)]"> {finding.lineReference}</span>
              )}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {finding.explanation}
            </p>
          </div>
          <div className="rounded-md bg-[var(--teal)]/5 border border-[var(--teal)]/15 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={12} className="text-[var(--teal)]" />
              <p className="text-xs font-semibold text-[var(--teal)] uppercase tracking-wider">
                Suggested Fix
              </p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {finding.suggestedFix}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              Source:{" "}
              <span className="font-medium capitalize text-foreground">
                {finding.sourceType}
              </span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground italic">
              AI-assisted review — human verification recommended for critical issues
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
