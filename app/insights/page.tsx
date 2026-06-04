import { MetricCard } from "@/components/ui/MetricCard";
import { RiskTrendChart } from "@/components/charts/RiskTrendChart";
import { CategoryDistributionChart } from "@/components/charts/CategoryDistributionChart";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  DEMO_METRICS,
  DEMO_HOTSPOTS,
  CATEGORY_DISTRIBUTION,
} from "@/lib/demo/seed";
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  BarChart3,
} from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="min-h-full">
      <div className="border-b border-border bg-background px-8 py-5">
        <h1 className="text-base font-semibold text-foreground">Engineering Insights</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Code quality trends across repositories · Last 30 days
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Avg Risk Score"
            value="63"
            delta="▲ 8 vs prev period"
            deltaUp={false}
            icon={TrendingUp}
            description="Trending upward — review critical PRs"
          />
          <MetricCard
            title="Mean Review Time"
            value="3.6s"
            delta="AI latency"
            icon={Clock}
            description="Average Claude review latency"
          />
          <MetricCard
            title="Finding Accuracy"
            value="86%"
            delta="high-confidence avg"
            deltaUp={true}
            icon={Target}
            description="Based on confidence distribution"
          />
          <MetricCard
            title="Hotspot Files"
            value={DEMO_HOTSPOTS.length}
            delta="recurring issues"
            icon={Flame}
            description="Files with 3+ findings"
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Risk Score Over Time</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average risk score per review cycle
                </p>
              </div>
              <TrendingUp size={15} className="text-muted-foreground" />
            </div>
            <RiskTrendChart data={DEMO_METRICS} />
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Issue Category Distribution</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Count of findings by category
                </p>
              </div>
              <BarChart3 size={15} className="text-muted-foreground" />
            </div>
            <CategoryDistributionChart data={CATEGORY_DISTRIBUTION} />
          </div>
        </div>

        {/* Findings trend table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Weekly Finding Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Critical and high-severity findings per review cycle
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">PRs</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Reviews</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Avg Risk</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Critical</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">High</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEMO_METRICS.map((m) => (
                  <tr key={m.date} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-foreground">
                      {new Date(m.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">{m.prCount}</td>
                    <td className="px-5 py-3 text-right text-foreground">{m.reviewCount}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          m.avgRiskScore >= 70
                            ? "text-red-500"
                            : m.avgRiskScore >= 50
                            ? "text-orange-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {m.avgRiskScore}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={m.criticalFindings > 0 ? "text-red-500 font-semibold" : "text-muted-foreground"}>
                        {m.criticalFindings}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={m.highFindings > 3 ? "text-orange-500 font-semibold" : "text-foreground"}>
                        {m.highFindings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hotspots */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">High-Risk Hotspots</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Files with recurring findings across review runs
            </p>
          </div>
          <div className="divide-y divide-border">
            {DEMO_HOTSPOTS.map((h, i) => (
              <div key={h.path} className="flex items-center gap-5 px-5 py-4">
                <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{h.path}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {h.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full capitalize"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">{h.findingCount}</span>
                  <p className="text-[10px] text-muted-foreground">findings</p>
                </div>
                <div className="flex-shrink-0">
                  <SeverityBadge
                    severity={
                      h.avgSeverity >= 3.5
                        ? "critical"
                        : h.avgSeverity >= 2.5
                        ? "high"
                        : "medium"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
