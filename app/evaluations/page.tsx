"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { DEMO_EVALS } from "@/lib/demo/seed";
import { loadLiveReviews, clearLiveReviews, type LiveReviewEntry } from "@/lib/store/reviewStore";
import {
  ShieldCheck,
  Clock,
  Zap,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Activity,
} from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EvaluationsPage() {
  const [liveRuns, setLiveRuns] = useState<LiveReviewEntry[]>([]);

  useEffect(() => {
    setLiveRuns(loadLiveReviews());
  }, []);

  const avgConfidence =
    DEMO_EVALS.reduce((s, e) => s + e.confidenceAvg, 0) / DEMO_EVALS.length;
  const avgLatency =
    DEMO_EVALS.reduce((s, e) => s + e.latencyMs, 0) / DEMO_EVALS.length;
  const totalTokens = DEMO_EVALS.reduce((s, e) => s + e.tokenUsage, 0);
  const totalRuns = DEMO_EVALS.length + liveRuns.length;

  function handleClear() {
    clearLiveReviews();
    setLiveRuns([]);
  }

  return (
    <div className="min-h-full">
      <div className="border-b border-border bg-background px-8 py-5">
        <h1 className="text-base font-semibold text-foreground">Evaluations</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI review run metrics, confidence signals, and trust indicators
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Trust banner */}
        <div className="rounded-lg border border-[var(--teal)]/20 bg-[var(--teal)]/5 p-4 flex items-start gap-3">
          <ShieldCheck size={16} className="text-[var(--teal)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              AI-assisted review — not a replacement for human judgment
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PulseReview AI is designed to surface potential issues, not to act as a final
              arbiter. Confidence scores indicate model certainty, not ground truth. Always
              verify critical findings before merging.
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Review Runs"
            value={totalRuns}
            icon={Brain}
            description={`${liveRuns.length} live · ${DEMO_EVALS.length} demo`}
          />
          <MetricCard
            title="Avg Confidence"
            value={`${(avgConfidence * 100).toFixed(0)}%`}
            deltaUp={true}
            delta="model certainty"
            icon={ShieldCheck}
            accent
          />
          <MetricCard
            title="Avg Latency"
            value={`${(avgLatency / 1000).toFixed(1)}s`}
            icon={Clock}
            description="API response time"
          />
          <MetricCard
            title="Total Tokens"
            value={totalTokens.toLocaleString()}
            icon={Zap}
            description="Across demo runs"
          />
        </div>

        {/* Live review runs */}
        {liveRuns.length > 0 && (
          <div className="rounded-lg border border-[var(--teal)]/20 bg-card">
            <div className="px-5 py-4 border-b border-[var(--teal)]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--teal)]" />
                <h2 className="text-sm font-semibold">Live Review Runs</h2>
                <span className="text-[10px] bg-[var(--teal)]/10 text-[var(--teal)] px-1.5 py-0.5 rounded-full font-medium">
                  {liveRuns.length} real
                </span>
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={11} />
                Clear
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">PR</th>
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Completed</th>
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Provider</th>
                    <th className="text-right px-5 py-3 text-muted-foreground font-medium">Risk</th>
                    <th className="text-right px-5 py-3 text-muted-foreground font-medium">Findings</th>
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Confidence</th>
                    <th className="text-right px-5 py-3 text-muted-foreground font-medium">Latency</th>
                    <th className="text-right px-5 py-3 text-muted-foreground font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {liveRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground truncate max-w-[180px]">
                          #{run.prNumber} {run.prTitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">{run.repoName}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(run.completedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {run.provider}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-bold tabular-nums ${
                            run.riskScore >= 75
                              ? "text-red-500"
                              : run.riskScore >= 50
                              ? "text-orange-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {run.riskScore}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">
                        {run.findingCount}
                      </td>
                      <td className="px-5 py-3">
                        <ConfidenceBadge confidence={run.confidenceAvg} />
                      </td>
                      <td className="px-5 py-3 text-right text-foreground">
                        {(run.latencyMs / 1000).toFixed(2)}s
                      </td>
                      <td className="px-5 py-3 text-right text-foreground">
                        {run.tokenUsage > 0 ? run.tokenUsage.toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Source breakdown */}
        <div className="grid lg:grid-cols-3 gap-4">
          {[
            {
              label: "Heuristic",
              icon: CheckCircle2,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              total: DEMO_EVALS.reduce((s, e) => s + e.heuristic, 0),
              desc: "Deterministic checks — high reliability",
            },
            {
              label: "LLM",
              icon: Brain,
              color: "text-[var(--teal)]",
              bg: "bg-[var(--teal)]/10",
              total: DEMO_EVALS.reduce((s, e) => s + e.llm, 0),
              desc: "AI-generated findings — context-aware",
            },
            {
              label: "Combined",
              icon: ShieldCheck,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              total: DEMO_EVALS.reduce((s, e) => s + e.combined, 0),
              desc: "Heuristic confirmed by LLM — highest signal",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-5">
              <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                <item.icon size={16} className={item.color} />
              </div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{item.total}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{item.label} findings</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo eval table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Demo Review Run Log</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pre-seeded evaluation data from fictional engineering scenarios
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Run</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Completed</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Findings</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Confidence</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Latency</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Tokens</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">H / L / C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEMO_EVALS.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-foreground">{e.reviewRunId}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(e.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {e.findingCount}
                    </td>
                    <td className="px-5 py-3">
                      <ConfidenceBadge confidence={e.confidenceAvg} />
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">
                      {(e.latencyMs / 1000).toFixed(2)}s
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">
                      {e.tokenUsage.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-emerald-500 font-medium">{e.heuristic}</span>
                      {" / "}
                      <span className="text-[var(--teal)] font-medium">{e.llm}</span>
                      {" / "}
                      <span className="text-purple-500 font-medium">{e.combined}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust principles */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Trust & Safety Principles</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: AlertTriangle,
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
                title: "Potential issue detected",
                desc: "Findings are probabilistic, not deterministic. The AI may flag false positives, especially for complex logic.",
              },
              {
                icon: Info,
                color: "text-[var(--teal)]",
                bg: "bg-[var(--teal)]/10",
                title: "Confidence is model-based",
                desc: "Confidence scores reflect how certain the model is, not whether the finding is truly a bug. Verify before acting.",
              },
              {
                icon: CheckCircle2,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                title: "Human verification recommended",
                desc: "For critical and high-severity findings, always have a human engineer confirm before rejecting or merging.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className={`h-7 w-7 rounded-md ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <item.icon size={13} className={item.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
