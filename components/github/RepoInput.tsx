"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, GitBranch, Star, Loader2 } from "lucide-react";
import { parseRepoInput, fetchRepo, fetchRepoPRs } from "@/lib/github/api";
import type { GitHubPR, GitHubRepo } from "@/lib/github/api";
import { PRStatusPill } from "@/components/ui/PRStatusPill";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RepoInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [prs, setPrs] = useState<GitHubPR[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError("Enter a GitHub repo in the format owner/repo or paste a GitHub URL.");
      return;
    }
    setError(null);
    setRepo(null);
    setPrs([]);

    startTransition(async () => {
      try {
        const [repoData, prsData] = await Promise.all([
          fetchRepo(parsed.owner, parsed.repo),
          fetchRepoPRs(parsed.owner, parsed.repo),
        ]);
        setRepo(repoData);
        setPrs(prsData);
        if (prsData.length === 0) {
          setError("No open pull requests found in this repository.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch repository.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="owner/repo or github.com/owner/repo"
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isPending || !input.trim()}
          className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          {isPending ? "Fetching..." : "Browse"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Repo info */}
      {repo && (
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-center gap-4">
          <GitBranch size={15} className="text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{repo.full_name}</p>
            {repo.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{repo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={10} />
              {repo.stargazers_count.toLocaleString()}
            </span>
            <span className="text-emerald-500 font-medium">{prs.length} open PRs</span>
          </div>
        </div>
      )}

      {/* PR list */}
      {prs.length > 0 && (
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          {prs.map((pr) => {
            const owner = repo!.full_name.split("/")[0];
            const repoName = repo!.full_name.split("/")[1];
            return (
              <button
                key={pr.number}
                onClick={() => router.push(`/github/${owner}/${repoName}/${pr.number}`)}
                className="flex items-center gap-4 px-4 py-3.5 w-full text-left hover:bg-accent transition-colors group"
              >
                <PRStatusPill status={pr.draft ? "draft" : (pr.state as any)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-[var(--teal)] transition-colors truncate">
                    #{pr.number} {pr.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                    <span>{pr.user.login}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <GitBranch size={9} />
                      {pr.head.ref}
                    </span>
                    <span>·</span>
                    <span>Updated {timeAgo(pr.updated_at)}</span>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Example repos hint */}
      {!repo && !isPending && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-muted-foreground">Try:</span>
          {["vercel/next.js", "facebook/react", "microsoft/vscode", "supabase/supabase"].map(
            (ex) => (
              <button
                key={ex}
                onClick={() => {
                  setInput(ex);
                }}
                className="text-[11px] font-mono text-[var(--teal)] hover:underline"
              >
                {ex}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
