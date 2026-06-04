import Link from "next/link";
import {
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  Activity,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskTrendChart } from "@/components/charts/RiskTrendChart";
import { CategoryDistributionChart } from "@/components/charts/CategoryDistributionChart";
import { PRStatusPill } from "@/components/ui/PRStatusPill";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  DEMO_PRS,
  DEMO_METRICS,
  DEMO_HOTSPOTS,
  CATEGORY_DISTRIBUTION,
} from "@/lib/demo/seed";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const openPRs = DEMO_PRS.filter((p) => p.status === "open" || p.status === "draft");
  const recentPRs = DEMO_PRS.slice(0, 4);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-border bg-background px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Overview</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              acme-corp / payments-service · Last 30 days
            </p>
          </div>
          <Link
            href="/pr/pr-2"
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Run AI Review <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Open PRs"
            value={openPRs.length}
            delta="2 awaiting review"
            icon={GitPullRequest}
            accent
          />
          <MetricCard
            title="Avg Risk Score"
            value="69"
            delta="+7 vs last week"
            deltaUp={false}
            icon={TrendingUp}
          />
          <MetricCard
            title="Critical Findings"
            value="5"
            delta="2 unresolved"
            deltaUp={false}
            icon={AlertTriangle}
          />
          <MetricCard
            title="Reviews Run"
            value="12"
            delta="↑ 3 this week"
            deltaUp={true}
            icon={Shield}
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Risk Score Trend</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average across all reviewed PRs
                </p>
              </div>
              <Activity size={15} className="text-muted-foreground" />
            </div>
            <RiskTrendChart data={DEMO_METRICS} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Finding Categories</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distribution across all review runs
                </p>
              </div>
              <AlertTriangle size={15} className="text-muted-foreground" />
            </div>
            <CategoryDistributionChart data={CATEGORY_DISTRIBUTION} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent PRs */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Pull Requests</h2>
              <Link
                href="/pr"
                className="text-xs text-[var(--teal)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentPRs.map((pr) => (
                <Link
                  key={pr.id}
                  href={`/pr/${pr.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent transition-colors"
                >
                  <PRStatusPill status={pr.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      #{pr.number} {pr.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pr.repositoryName} · {pr.author.name} · {timeAgo(pr.updatedAt)}
                    </p>
                  </div>
                  {pr.riskScore !== undefined && (
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        pr.riskScore >= 75
                          ? "text-red-500"
                          : pr.riskScore >= 50
                          ? "text-orange-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {pr.riskScore}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Hotspots */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">High-Risk Hotspots</h2>
              <SeverityBadge severity="critical" />
            </div>
            <div className="divide-y divide-border">
              {DEMO_HOTSPOTS.slice(0, 5).map((h) => (
                <div key={h.path} className="px-5 py-3">
                  <p className="text-xs font-mono text-foreground truncate">{h.path}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {h.findingCount} findings
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {h.categories.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full capitalize"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Repo health strip */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Repository Health</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "payments-service", prs: 12, risk: 62, status: "moderate" },
              { name: "auth-platform", prs: 8, risk: 55, status: "moderate" },
              { name: "checkout-ui", prs: 15, risk: 38, status: "healthy" },
            ].map((repo) => (
              <div key={repo.name} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-medium text-foreground">
                    {repo.name}
                  </span>
                  <span
                    className={`flex h-1.5 w-1.5 rounded-full ${
                      repo.status === "healthy" ? "bg-emerald-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitPullRequest size={10} />
                    {repo.prs} PRs
                  </span>
                  <span
                    className={`font-semibold ${
                      repo.risk >= 60 ? "text-orange-500" : "text-emerald-500"
                    }`}
                  >
                    Risk {repo.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
