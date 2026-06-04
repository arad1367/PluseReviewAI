import type { GitHubFile } from "@/lib/github/api";

export interface PRContext {
  title: string;
  description: string;
  headBranch: string;
  baseBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  files: GitHubFile[];
  diffContext: string;
}

export function buildSystemPrompt(): string {
  return `You are a senior software engineer performing a structured pull request review. Your goal is to identify real engineering issues — not stylistic opinions.

Focus on:
- Security vulnerabilities (credential leaks, injection risks, auth bypasses)
- Logic bugs and edge cases that could cause incorrect behavior
- Performance regressions (N+1 queries, missing caching, expensive re-renders)
- Missing or insufficient test coverage for changed code
- Architectural concerns (coupling, missing error handling, unsafe patterns)

Rules:
- Only flag real issues with clear evidence in the diff
- Do not flag stylistic issues unless they indicate a real problem
- Be specific: reference the actual file and line when possible
- Confidence should reflect how certain you are this is actually a problem
- Severity: critical=would cause production incidents, high=significant risk, medium=should fix, low=nice to fix, info=FYI
- Source type: use "heuristic" for pattern matches (leaked secrets, missing null checks), "llm" for reasoning-based findings
- Return 0 findings if the PR looks genuinely safe — do not invent issues
- Do not return more than 8 findings`;
}

export function buildUserPrompt(ctx: PRContext): string {
  return `Review this pull request:

**Title:** ${ctx.title}
**Description:** ${ctx.description || "No description provided"}
**Branch:** ${ctx.headBranch} → ${ctx.baseBranch}
**Size:** ${ctx.changedFiles} files changed, +${ctx.additions} −${ctx.deletions}

**File list:**
${ctx.files.map((f) => `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`).join("\n")}

**Diff:**
${ctx.diffContext}

Analyze this PR and return a structured review JSON. Be a helpful but honest senior engineer — not overly critical, not too lenient.`;
}
