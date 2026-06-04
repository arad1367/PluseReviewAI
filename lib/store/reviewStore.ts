const STORE_KEY = "pulse_live_reviews";
const MAX_ENTRIES = 20;

export interface LiveReviewEntry {
  id: string;
  prTitle: string;
  repoName: string;
  prNumber: number;
  provider: string;
  model: string;
  completedAt: string;
  riskScore: number;
  overallVerdict: string;
  findingCount: number;
  confidenceAvg: number;
  latencyMs: number;
  tokenUsage: number;
  heuristic: number;
  llm: number;
  combined: number;
}

export function saveLiveReview(entry: LiveReviewEntry): void {
  try {
    const existing = loadLiveReviews();
    const deduped = existing.filter((e) => e.id !== entry.id);
    const updated = [entry, ...deduped].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (SSR, private mode)
  }
}

export function loadLiveReviews(): LiveReviewEntry[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LiveReviewEntry[];
  } catch {
    return [];
  }
}

export function clearLiveReviews(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {}
}
