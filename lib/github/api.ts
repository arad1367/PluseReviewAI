const GH = "https://api.github.com";

const HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string };
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  created_at: string;
  updated_at: string;
  labels: { name: string }[];
  html_url: string;
}

export interface GitHubFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}

export interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  private: boolean;
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`${GH}/repos/${owner}/${repo}`, { headers: HEADERS });
  if (res.status === 404) throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
  if (res.status === 403) throw new Error("GitHub rate limit exceeded. Try again in a minute.");
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

export async function fetchRepoPRs(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
): Promise<GitHubPR[]> {
  const res = await fetch(
    `${GH}/repos/${owner}/${repo}/pulls?state=${state}&per_page=30&sort=updated`,
    { headers: HEADERS }
  );
  if (res.status === 404) throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
  if (res.status === 403) throw new Error("GitHub rate limit exceeded. Try again in a minute.");
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

export async function fetchPR(owner: string, repo: string, prNumber: number): Promise<GitHubPR> {
  const res = await fetch(`${GH}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

export async function fetchPRFiles(
  owner: string,
  repo: string,
  prNumber: number
): Promise<GitHubFile[]> {
  const res = await fetch(
    `${GH}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=50`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  // Full URL: https://github.com/owner/repo or https://github.com/owner/repo/...
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };

  // owner/repo shorthand
  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  return null;
}

export function buildDiffContext(files: GitHubFile[], maxChars = 24000): string {
  const lines: string[] = [];
  let chars = 0;

  for (const f of files) {
    const header = `\n--- File: ${f.filename} (${f.status}, +${f.additions} -${f.deletions}) ---\n`;
    lines.push(header);
    chars += header.length;

    if (f.patch) {
      const patch = f.patch.slice(0, 3000);
      lines.push(patch);
      chars += patch.length;
    }

    if (chars > maxChars) {
      lines.push("\n[...diff truncated to stay within token limit...]");
      break;
    }
  }

  return lines.join("");
}
