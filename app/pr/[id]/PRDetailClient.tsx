"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  GitBranch,
  Files,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Zap,
  RotateCcw,
} from "lucide-react";
import { PRStatusPill } from "@/components/ui/PRStatusPill";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { RiskScoreGauge } from "@/components/ui/RiskScoreGauge";
import { FindingCard } from "@/components/pr/FindingCard";
import { FileChangeList } from "@/components/pr/FileChangeList";
import { ReviewProgress } from "@/components/pr/ReviewProgress";
import type { PullRequest, ReviewRun, Severity, Finding } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  pr: PullRequest;
  existingReview: ReviewRun | null;
}

const VERDICT_CONFIG = {
  "request-changes": {
    label: "Request Changes",
    className: "bg-red-500/10 text-red-500 border border-red-500/20",
  },
  "needs-attention": {
    label: "Needs Attention",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
  },
  approve: {
    label: "Approve",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
};

export function PRDetailClient({ pr, existingReview }: Props) {
  const [review, setReview] = useState<ReviewRun | null>(existingReview);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"findings" | "files" | "summary">("findings");

  const handleRunReview = useCallback(() => {
    setRunning(true);
  }, []);

  const handleProgressComplete = useCallback(() => {
    setRunning(false);
    setReview(existingReview);
  }, [existingReview]);

  const handleReset = useCallback(() => {
    setReview(null);
  }, []);

  const severityGroups: Record<Severity, Finding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: [],
  };

  if (review) {
    for (const f of review.findings) {
      severityGroups[f.severity].push(f);
    }
  }

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-border bg-background px-8 py-5">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/pr"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            Pull Requests
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs font-mono text-muted-foreground">
            {pr.repositoryName}
          </span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs font-mono text-muted-foreground">#{pr.number}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PRStatusPill status={pr.status} />
              <span className="text-xs text-muted-foreground font-mono">{pr.repositoryName}</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground leading-snug">
              #{pr.number} {pr.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded-full bg-[var(--teal)] flex items-center justify-center text-[8px] font-bold text-white">
                  {pr.author.avatar}
                </div>
                <span>{pr.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <GitBranch size={11} />
                {pr.headBranch} → {pr.baseBranch}
              </span>
              <span className="flex items-center gap-1">
                <Files size={11} />
                {pr.changedFiles} files
              </span>
              <span className="text-emerald-500">+{pr.additions}</span>
              <span className="text-red-500">−{pr.deletions}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {review && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                title="Reset review (demo)"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            )}
            {!review && !running && (
              <button
                onClick={handleRunReview}
                className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Play size={12} />
                Run AI Review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)]">
        {/* Left: Files panel */}
        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground">Changed Files</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {pr.files.length} files · {pr.additions + pr.deletions} total changes
            </p>
          </div>
          <div className="py-2">
            <FileChangeList files={pr.files} />
          </div>
          {pr.description && (
            <div className="px-4 py-4 border-t border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pr.description}
              </p>
            </div>
          )}
        </div>

        {/* Center: Review content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {running && (
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-md p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Zap size={16} className="text-[var(--teal)]" />
                  <p className="text-sm font-semibold text-foreground">
                    Running AI review...
                  </p>
                </div>
                <ReviewProgress onComplete={handleProgressComplete} />
                <p className="mt-5 text-[11px] text-muted-foreground">
                  Analyzing {pr.changedFiles} changed files · {pr.additions + pr.deletions} line changes
                </p>
              </div>
            </div>
          )}

          {/* No review yet */}
          {!review && !running && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Play size={20} className="text-muted-foreground ml-0.5" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No AI review yet
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                Click &ldquo;Run AI Review&rdquo; to analyze this pull request with Claude. The
                review takes about 3–5 seconds.
              </p>
              <button
                onClick={handleRunReview}
                className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Play size={12} />
                Run AI Review
              </button>
            </div>
          )}

          {/* Review results */}
          {review && !running && (
            <div>
              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-border">
                {(["findings", "files", "summary"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px",
                      activeTab === tab
                        ? "border-[var(--teal)] text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                    {tab === "findings" && (
                      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                        {review.findings.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "findings" && (
                  <div className="space-y-6">
                    {(["critical", "high", "medium", "low", "info"] as Severity[]).map(
                      (sev) =>
                        severityGroups[sev].length > 0 && (
                          <div key={sev}>
                            <div className="flex items-center gap-2 mb-3">
                              <SeverityBadge severity={sev} />
                              <span className="text-xs text-muted-foreground">
                                {severityGroups[sev].length} finding
                                {severityGroups[sev].length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {severityGroups[sev].map((f) => (
                                <FindingCard key={f.id} finding={f} />
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )}

                {activeTab === "summary" && (
                  <div className="max-w-2xl space-y-5">
                    <div className="rounded-lg border border-border bg-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        AI Summary
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {review.summary}
                      </p>
                      <p className="mt-3 text-[10px] text-muted-foreground italic">
                        AI-assisted review. Confidence is model-based. Human verification recommended for critical findings.
                      </p>
                    </div>

                    {review.testRecommendations.length > 0 && (
                      <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Test Recommendations
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {review.testRecommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="text-muted-foreground mt-0.5">→</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.followUpQuestions.length > 0 && (
                      <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <HelpCircle size={13} className="text-[var(--teal)]" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Follow-up Questions
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {review.followUpQuestions.map((q, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {i + 1}. {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "files" && (
                  <div className="max-w-2xl">
                    <p className="text-xs text-muted-foreground mb-4">
                      Files changed in this pull request. Click a file to view its diff.
                    </p>
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <FileChangeList files={pr.files} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Score panel */}
        {review && !running && (
          <div className="w-60 flex-shrink-0 border-l border-border overflow-y-auto p-5 space-y-5">
            {/* Risk score */}
            <div className="flex flex-col items-center pt-2">
              <RiskScoreGauge score={review.riskScore} size={100} />
            </div>

            {/* Verdict */}
            <div className="rounded-md border border-border bg-card p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Verdict
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
                  VERDICT_CONFIG[review.overallVerdict].className
                )}
              >
                {VERDICT_CONFIG[review.overallVerdict].label}
              </span>
            </div>

            {/* Finding breakdown */}
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Findings Breakdown
              </p>
              <div className="space-y-1.5">
                {(["critical", "high", "medium", "low", "info"] as Severity[]).map((sev) => {
                  const count = severityGroups[sev].length;
                  if (count === 0) return null;
                  return (
                    <div key={sev} className="flex items-center justify-between">
                      <SeverityBadge severity={sev} />
                      <span className="text-xs font-semibold tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eval stats */}
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Evaluation
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> Latency
                  </span>
                  <span className="font-medium">{((review.latencyMs ?? 0) / 1000).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap size={10} /> Tokens
                  </span>
                  <span className="font-medium">{review.tokenUsage?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High conf.</span>
                  <span className="font-medium text-emerald-500">
                    {review.confidenceDistribution.high}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Med conf.</span>
                  <span className="font-medium text-yellow-500">
                    {review.confidenceDistribution.medium}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
              AI-assisted review. Potential issues detected. Human verification recommended for
              critical findings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
