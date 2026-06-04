import Link from "next/link";
import { ArrowRight, GitPullRequest } from "lucide-react";
import { PRStatusPill } from "@/components/ui/PRStatusPill";
import { RepoInput } from "@/components/github/RepoInput";
import { DEMO_PRS } from "@/lib/demo/seed";
import type { PRStatus } from "@/lib/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_ORDER: PRStatus[] = ["open", "draft", "merged", "closed"];

const sorted = [...DEMO_PRS].sort(
  (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
);

export default function PRListPage() {
  return (
    <div className="min-h-full">
      <div className="border-b border-border bg-background px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Pull Requests</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              acme-corp demo · {DEMO_PRS.length} pull requests — or browse any public GitHub repo below
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Real GitHub repo section */}
        <div className="rounded-lg border border-[var(--teal)]/20 bg-[var(--teal)]/5 p-5">
          <div className="flex items-center gap-2 mb-1">
            <GitPullRequest size={14} className="text-[var(--teal)]" />
            <h2 className="text-sm font-semibold text-foreground">Review any public GitHub repository</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Enter a GitHub repo to browse its open pull requests and run a real AI review using your own API key.
          </p>
          <RepoInput />
        </div>

        {/* Demo PRs section */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1">Demo pull requests</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Pre-reviewed fictional engineering scenarios — no API key needed.
          </p>
        {/* Filters (static for demo) */}
        <div className="flex items-center gap-2 mb-5">
          {["All", "Open", "Draft", "Merged"].map((f) => (
            <button
              key={f}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                f === "All"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sort by: Updated</span>
          </div>
        </div>

        {/* PR list */}
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          {sorted.map((pr) => (
            <Link
              key={pr.id}
              href={`/pr/${pr.id}`}
              className="flex items-start gap-4 px-5 py-4 hover:bg-accent transition-colors group"
            >
              <div className="mt-0.5 flex-shrink-0">
                <GitPullRequest
                  size={16}
                  className={
                    pr.status === "open"
                      ? "text-emerald-500"
                      : pr.status === "merged"
                      ? "text-purple-500"
                      : "text-muted-foreground"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PRStatusPill status={pr.status} />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {pr.repositoryName}
                  </span>
                  {pr.labels.map((l) => (
                    <span
                      key={l}
                      className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full"
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-[var(--teal)] transition-colors">
                  #{pr.number} {pr.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-[var(--teal)] flex items-center justify-center text-[8px] font-bold text-white">
                      {pr.author.avatar}
                    </div>
                    <span>{pr.author.name}</span>
                  </div>
                  <span>·</span>
                  <span>{pr.changedFiles} files changed</span>
                  <span className="text-emerald-500">+{pr.additions}</span>
                  <span className="text-red-500">−{pr.deletions}</span>
                  <span>·</span>
                  <span>Updated {timeAgo(pr.updatedAt)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {pr.riskScore !== undefined ? (
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        pr.riskScore >= 75
                          ? "text-red-500"
                          : pr.riskScore >= 50
                          ? "text-orange-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {pr.riskScore}
                    </div>
                    <div className="text-[10px] text-muted-foreground">risk</div>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    not reviewed
                  </span>
                )}
                <ArrowRight
                  size={14}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
