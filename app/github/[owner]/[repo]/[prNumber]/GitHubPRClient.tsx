"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  GitBranch,
  Files,
  Clock,
  Zap,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { PRStatusPill } from "@/components/ui/PRStatusPill";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { RiskScoreGauge } from "@/components/ui/RiskScoreGauge";
import { FindingCard } from "@/components/pr/FindingCard";
import { ReviewProgress } from "@/components/pr/ReviewProgress";
import { ProviderModal } from "@/components/pr/ProviderModal";
import { buildDiffContext } from "@/lib/github/api";
import { loadProviderSelection, type ProviderSelection } from "@/lib/ai/providers";
import { saveLiveReview } from "@/lib/store/reviewStore";
import type { GitHubPR, GitHubFile } from "@/lib/github/api";
import type { ReviewRun, Finding, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  owner: string;
  repo: string;
  pr: GitHubPR;
  files: GitHubFile[];
}

const VERDICT_CONFIG = {
  "request-changes": {
    label: "Request Changes",
    className: "bg-red-500/10 text-red-500 border border-red-500/20",
  },
  "needs-attention": {
    label: "Needs Attention",
    className:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
  },
  approve: {
    label: "Looks Good",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
};

export function GitHubPRClient({ owner, repo, pr, files }: Props) {
  const [review, setReview] = useState<ReviewRun | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "files" | "summary">("findings");
  const [usedProvider, setUsedProvider] = useState<string>("");
  const pendingSelRef = useRef<ProviderSelection | null>(null);

  function handleRunClick() {
    setShowModal(true);
  }

  function handleProviderConfirm(sel: ProviderSelection) {
    setShowModal(false);
    pendingSelRef.current = sel;
    startReview(sel);
  }

  const startReview = useCallback(
    async (sel: ProviderSelection) => {
      setRunning(true);
      setError(null);
      setReview(null);
      setUsedProvider(`${sel.providerId} / ${sel.model}`);
    },
    []
  );

  const handleProgressComplete = useCallback(
    async () => {
      const sel = pendingSelRef.current ?? loadProviderSelection();
      if (!sel) {
        setRunning(false);
        setError("Provider selection lost. Please try again.");
        return;
      }

      const diffContext = buildDiffContext(files);

      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: sel.providerId,
            model: sel.model,
            apiKey: sel.apiKey,
            prContext: {
              title: pr.title,
              description: pr.body ?? "",
              headBranch: pr.head.ref,
              baseBranch: pr.base.ref,
              additions: pr.additions,
              deletions: pr.deletions,
              changedFiles: pr.changed_files,
              files,
              diffContext,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Review failed.");
          setRunning(false);
          return;
        }

        const { review: output, meta } = data;

        const reviewRun: ReviewRun = {
          id: `run-gh-${pr.number}`,
          prId: `gh-${pr.number}`,
          status: "completed",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          summary: output.summary,
          riskScore: output.risk_score,
          overallVerdict: output.overall_verdict,
          findings: output.findings.map((f: any) => ({
            id: f.id,
            prId: `gh-${pr.number}`,
            title: f.title,
            severity: f.severity,
            category: f.category,
            file: f.file,
            lineReference: f.line_reference,
            explanation: f.explanation,
            suggestedFix: f.suggested_fix,
            confidence: f.confidence,
            sourceType: f.source_type,
          })) as Finding[],
          testRecommendations: output.test_recommendations,
          followUpQuestions: output.follow_up_questions,
          tokenUsage: meta.tokenUsage,
          latencyMs: meta.latencyMs,
          confidenceDistribution: {
            high: output.findings.filter((f: any) => f.confidence >= 0.85).length,
            medium: output.findings.filter(
              (f: any) => f.confidence >= 0.65 && f.confidence < 0.85
            ).length,
            low: output.findings.filter((f: any) => f.confidence < 0.65).length,
          },
        };

        setReview(reviewRun);

        const findings = output.findings as any[];
        const confidenceAvg =
          findings.length > 0
            ? findings.reduce((s: number, f: any) => s + f.confidence, 0) / findings.length
            : 0;
        saveLiveReview({
          id: reviewRun.id,
          prTitle: pr.title,
          repoName: `${owner}/${repo}`,
          prNumber: pr.number,
          provider: sel.providerId,
          model: sel.model,
          completedAt: reviewRun.completedAt ?? new Date().toISOString(),
          riskScore: output.risk_score,
          overallVerdict: output.overall_verdict,
          findingCount: findings.length,
          confidenceAvg,
          latencyMs: meta.latencyMs ?? 0,
          tokenUsage: meta.tokenUsage ?? 0,
          heuristic: findings.filter((f: any) => f.source_type === "heuristic").length,
          llm: findings.filter((f: any) => f.source_type === "llm").length,
          combined: findings.filter((f: any) => f.source_type === "combined").length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setRunning(false);
      }
    },
    [pr, files]
  );

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
    <>
      {showModal && (
        <ProviderModal
          onConfirm={handleProviderConfirm}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="min-h-full">
        {/* Header */}
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
              {owner}/{repo}
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-mono text-muted-foreground">#{pr.number}</span>
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-[var(--teal)] hover:underline"
            >
              GitHub <ExternalLink size={9} />
            </a>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PRStatusPill status={pr.draft ? "draft" : (pr.state as any)} />
                <span className="text-xs text-muted-foreground font-mono">
                  {owner}/{repo}
                </span>
              </div>
              <h1 className="text-lg font-semibold text-foreground leading-snug">
                #{pr.number} {pr.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{pr.user.login}</span>
                <span className="flex items-center gap-1">
                  <GitBranch size={11} />
                  {pr.head.ref} → {pr.base.ref}
                </span>
                <span className="flex items-center gap-1">
                  <Files size={11} />
                  {pr.changed_files} files
                </span>
                <span className="text-emerald-500">+{pr.additions}</span>
                <span className="text-red-500">−{pr.deletions}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {review && (
                <button
                  onClick={() => { setReview(null); setError(null); }}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                >
                  <RotateCcw size={11} />
                  Re-run
                </button>
              )}
              {!running && (
                <button
                  onClick={handleRunClick}
                  className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Play size={12} />
                  {review ? "Run Again" : "Run AI Review"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-160px)]">
          {/* Left: Files */}
          <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Changed Files</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {files.length} files · {pr.additions + pr.deletions} total changes
              </p>
            </div>
            <div className="py-2">
              {files.map((f) => (
                <div
                  key={f.filename}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent text-xs group"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full flex-shrink-0",
                      f.status === "added"
                        ? "bg-emerald-500"
                        : f.status === "removed"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    )}
                  />
                  <span className="font-mono text-foreground truncate flex-1">{f.filename}</span>
                  <span className="text-emerald-500 flex-shrink-0">+{f.additions}</span>
                  <span className="text-red-500 flex-shrink-0">−{f.deletions}</span>
                </div>
              ))}
            </div>
            {pr.body && (
              <div className="px-4 py-4 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
                  {pr.body}
                </p>
              </div>
            )}
          </div>

          {/* Center: Review */}
          <div className="flex-1 overflow-y-auto">
            {/* Error state */}
            {error && !running && (
              <div className="flex items-start gap-3 m-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Review failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-2 text-xs text-[var(--teal)] hover:underline"
                  >
                    Change provider or API key →
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {running && (
              <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-md p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={16} className="text-[var(--teal)]" />
                    <p className="text-sm font-semibold text-foreground">Running AI review...</p>
                  </div>
                  {usedProvider && (
                    <p className="text-[11px] text-muted-foreground mb-5">
                      Using {usedProvider}
                    </p>
                  )}
                  <ReviewProgress onComplete={handleProgressComplete} />
                  <p className="mt-5 text-[11px] text-muted-foreground">
                    Analyzing {pr.changed_files} changed files · {pr.additions + pr.deletions} line changes
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!review && !running && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Play size={20} className="text-muted-foreground ml-0.5" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No AI review yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                  Click &ldquo;Run AI Review&rdquo; to analyze this real pull request. You&apos;ll
                  choose your AI provider and supply your API key.
                </p>
                <button
                  onClick={handleRunClick}
                  className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Play size={12} />
                  Run AI Review
                </button>
              </div>
            )}

            {/* Results */}
            {review && !running && (
              <div>
                <div className="flex items-center gap-1 px-6 pt-5 border-b border-border">
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
                      {review.findings.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <p className="text-sm font-medium">No significant issues found</p>
                          <p className="text-xs mt-1">
                            The AI review did not identify significant concerns in this PR.
                          </p>
                        </div>
                      )}
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
                        <p className="text-sm text-foreground leading-relaxed">{review.summary}</p>
                        <p className="mt-3 text-[10px] text-muted-foreground italic">
                          Reviewed by {usedProvider} · AI-assisted · Human verification recommended
                        </p>
                      </div>

                      {review.testRecommendations.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Test Recommendations
                          </p>
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
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Follow-up Questions
                          </p>
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
                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        {files.map((f) => (
                          <div
                            key={f.filename}
                            className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full flex-shrink-0",
                                f.status === "added"
                                  ? "bg-emerald-500"
                                  : f.status === "removed"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              )}
                            />
                            <span className="text-xs font-mono text-foreground flex-1 truncate">
                              {f.filename}
                            </span>
                            <span className="text-[10px] text-emerald-500">+{f.additions}</span>
                            <span className="text-[10px] text-red-500">−{f.deletions}</span>
                          </div>
                        ))}
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
              <div className="flex flex-col items-center pt-2">
                <RiskScoreGauge score={review.riskScore} size={100} />
              </div>

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

              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Findings
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

              {(review.latencyMs || review.tokenUsage) && (
                <div className="rounded-md border border-border bg-card p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Evaluation
                  </p>
                  <div className="space-y-2 text-xs">
                    {review.latencyMs && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> Latency
                        </span>
                        <span className="font-medium">
                          {(review.latencyMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    )}
                    {review.tokenUsage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Zap size={10} /> Tokens
                        </span>
                        <span className="font-medium">{review.tokenUsage.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium text-[10px] truncate max-w-[80px] text-right">
                        {usedProvider.split(" / ")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
                AI-assisted review. Human verification recommended for critical findings.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
