export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Category =
  | "bug-risk"
  | "security"
  | "performance"
  | "maintainability"
  | "testing"
  | "architecture"
  | "style";
export type PRStatus = "open" | "merged" | "closed" | "draft";
export type SourceType = "heuristic" | "llm" | "combined";
export type ReviewStatus = "pending" | "running" | "completed" | "failed";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  prCount: number;
  avgRiskScore: number;
  lastActivityAt: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  author: Author;
  status: PRStatus;
  repositoryId: string;
  repositoryName: string;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  createdAt: string;
  updatedAt: string;
  riskScore?: number;
  reviewStatus?: ReviewStatus;
  labels: string[];
  files: FileChange[];
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  login: string;
}

export interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  status: "added" | "modified" | "deleted" | "renamed";
  language?: string;
  patch?: string;
}

export interface Finding {
  id: string;
  prId: string;
  title: string;
  severity: Severity;
  category: Category;
  file: string;
  lineReference?: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  sourceType: SourceType;
}

export interface ReviewRun {
  id: string;
  prId: string;
  status: ReviewStatus;
  startedAt: string;
  completedAt?: string;
  summary: string;
  riskScore: number;
  overallVerdict: "approve" | "request-changes" | "needs-attention";
  findings: Finding[];
  testRecommendations: string[];
  followUpQuestions: string[];
  tokenUsage?: number;
  latencyMs?: number;
  confidenceDistribution: { high: number; medium: number; low: number };
}

export interface MetricSnapshot {
  date: string;
  avgRiskScore: number;
  prCount: number;
  reviewCount: number;
  criticalFindings: number;
  highFindings: number;
}

export interface EvaluationRecord {
  id: string;
  reviewRunId: string;
  findingCount: number;
  confidenceAvg: number;
  latencyMs: number;
  tokenUsage: number;
  heuristic: number;
  llm: number;
  combined: number;
  createdAt: string;
}

export interface HotspotModule {
  path: string;
  findingCount: number;
  avgSeverity: number;
  categories: Category[];
}

export interface ReviewProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}
