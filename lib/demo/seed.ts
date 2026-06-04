import type {
  Repository,
  PullRequest,
  ReviewRun,
  MetricSnapshot,
  EvaluationRecord,
  HotspotModule,
} from "@/lib/types";

export const DEMO_REPOS: Repository[] = [
  {
    id: "repo-1",
    name: "payments-service",
    fullName: "acme-corp/payments-service",
    description: "Core payment processing and retry logic",
    language: "TypeScript",
    prCount: 12,
    avgRiskScore: 62,
    lastActivityAt: "2026-06-03T14:22:00Z",
  },
  {
    id: "repo-2",
    name: "auth-platform",
    fullName: "acme-corp/auth-platform",
    description: "JWT-based authentication and authorization service",
    language: "Go",
    prCount: 8,
    avgRiskScore: 55,
    lastActivityAt: "2026-06-04T09:11:00Z",
  },
  {
    id: "repo-3",
    name: "checkout-ui",
    fullName: "acme-corp/checkout-ui",
    description: "React-based checkout and cart experience",
    language: "TypeScript",
    prCount: 15,
    avgRiskScore: 38,
    lastActivityAt: "2026-06-04T07:45:00Z",
  },
];

export const DEMO_PRS: PullRequest[] = [
  {
    id: "pr-1",
    number: 847,
    title: "refactor: JWT token validation with sliding expiry window",
    description:
      "Replaces the static expiry check with a sliding window approach. This changes how we validate `iat` and `exp` claims — please review the edge case handling for tokens issued just before a refresh cycle.",
    author: {
      id: "user-1",
      name: "Pejman Ebrahimi",
      avatar: "PE",
      login: "pejman-e",
    },
    status: "open",
    repositoryId: "repo-2",
    repositoryName: "auth-platform",
    baseBranch: "main",
    headBranch: "feat/jwt-sliding-expiry",
    additions: 184,
    deletions: 67,
    changedFiles: 8,
    commits: 4,
    createdAt: "2026-06-03T11:30:00Z",
    updatedAt: "2026-06-04T08:15:00Z",
    riskScore: 78,
    reviewStatus: "completed",
    labels: ["security", "auth"],
    files: [
      {
        path: "internal/auth/jwt.go",
        additions: 94,
        deletions: 41,
        status: "modified",
        language: "Go",
        patch: `@@ -88,12 +88,28 @@ func ValidateToken(tokenStr string) (*Claims, error) {
-  if claims.ExpiresAt < time.Now().Unix() {
-    return nil, ErrTokenExpired
-  }
+  now := time.Now().Unix()
+  window := int64(cfg.SlidingWindowSeconds)
+  if claims.ExpiresAt+window < now {
+    return nil, ErrTokenExpired
+  }
+  // BUG: window allows tokens issued before IssuedAt baseline to pass
+  if claims.IssuedAt > now {
+    return nil, ErrFutureToken
+  }`,
      },
      {
        path: "internal/auth/middleware.go",
        additions: 32,
        deletions: 12,
        status: "modified",
        language: "Go",
      },
      {
        path: "internal/auth/refresh.go",
        additions: 28,
        deletions: 8,
        status: "modified",
        language: "Go",
      },
      {
        path: "config/auth.yaml",
        additions: 6,
        deletions: 2,
        status: "modified",
        language: "YAML",
        patch: `@@ -14,3 +14,7 @@ jwt:
+  sliding_window_seconds: 300
+  # WARNING: sliding_window_seconds should never exceed token TTL`,
      },
      {
        path: "tests/auth/jwt_test.go",
        additions: 12,
        deletions: 4,
        status: "modified",
        language: "Go",
      },
      {
        path: "docs/auth-flow.md",
        additions: 12,
        deletions: 0,
        status: "modified",
        language: "Markdown",
      },
    ],
  },
  {
    id: "pr-2",
    number: 621,
    title: "fix: prevent duplicate charge on payment retry after gateway timeout",
    description:
      "Our retry logic was re-submitting payments when the gateway returned a 504 but had already committed the charge. This introduces idempotency key validation before retry to prevent double-billing.",
    author: {
      id: "user-2",
      name: "Marcus Chen",
      avatar: "MC",
      login: "mchen",
    },
    status: "open",
    repositoryId: "repo-1",
    repositoryName: "payments-service",
    baseBranch: "main",
    headBranch: "fix/retry-idempotency",
    additions: 231,
    deletions: 89,
    changedFiles: 11,
    commits: 6,
    createdAt: "2026-06-02T15:00:00Z",
    updatedAt: "2026-06-04T06:40:00Z",
    riskScore: 85,
    reviewStatus: "completed",
    labels: ["critical", "payments", "bug"],
    files: [
      {
        path: "src/payments/retry.ts",
        additions: 88,
        deletions: 34,
        status: "modified",
        language: "TypeScript",
        patch: `@@ -41,8 +41,24 @@ export async function retryPayment(chargeId: string) {
-  await stripe.charges.create({ amount, currency, source })
+  const idempotencyKey = \`retry-\${chargeId}-\${attempt}\`
+  // TODO: validate idempotency key hasn't been used — missing check here
+  await stripe.charges.create(
+    { amount, currency, source },
+    { idempotencyKey }
+  )`,
      },
      {
        path: "src/payments/gateway.ts",
        additions: 56,
        deletions: 22,
        status: "modified",
        language: "TypeScript",
      },
      {
        path: "src/payments/idempotency.ts",
        additions: 64,
        deletions: 0,
        status: "added",
        language: "TypeScript",
      },
      {
        path: ".env.example",
        additions: 3,
        deletions: 1,
        status: "modified",
        language: "Shell",
        patch: `@@ -8,3 +8,4 @@ STRIPE_WEBHOOK_SECRET=whsec_...
+STRIPE_SECRET_KEY=sk_live_ACTUAL_KEY_LEAKED_HERE`,
      },
      {
        path: "tests/payments/retry.test.ts",
        additions: 20,
        deletions: 32,
        status: "modified",
        language: "TypeScript",
      },
    ],
  },
  {
    id: "pr-3",
    number: 394,
    title: "feat: real-time cart sync with WebSocket and optimistic updates",
    description:
      "Replaces polling with a WebSocket connection for cart state. Adds optimistic updates to reduce perceived latency. Cart component now re-renders on every socket message — needs profiling.",
    author: {
      id: "user-3",
      name: "Elena Okafor",
      avatar: "EO",
      login: "elena-ok",
    },
    status: "open",
    repositoryId: "repo-3",
    repositoryName: "checkout-ui",
    baseBranch: "main",
    headBranch: "feat/ws-cart-sync",
    additions: 312,
    deletions: 145,
    changedFiles: 14,
    commits: 8,
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-03T17:30:00Z",
    riskScore: 54,
    reviewStatus: "completed",
    labels: ["feature", "performance"],
    files: [
      {
        path: "src/components/Cart/CartProvider.tsx",
        additions: 112,
        deletions: 48,
        status: "modified",
        language: "TypeScript",
      },
      {
        path: "src/hooks/useCartSync.ts",
        additions: 78,
        deletions: 0,
        status: "added",
        language: "TypeScript",
      },
      {
        path: "src/components/Cart/CartItem.tsx",
        additions: 24,
        deletions: 18,
        status: "modified",
        language: "TypeScript",
      },
    ],
  },
  {
    id: "pr-4",
    number: 412,
    title: "chore: upgrade React to 19 and resolve breaking hook changes",
    description:
      "Upgrades from React 18 to 19. Several components used the deprecated `unstable_batchedUpdates` API — replaced with native concurrent features.",
    author: {
      id: "user-4",
      name: "David Kim",
      avatar: "DK",
      login: "dkim",
    },
    status: "merged",
    repositoryId: "repo-3",
    repositoryName: "checkout-ui",
    baseBranch: "main",
    headBranch: "chore/react-19-upgrade",
    additions: 89,
    deletions: 156,
    changedFiles: 22,
    commits: 3,
    createdAt: "2026-05-28T13:00:00Z",
    updatedAt: "2026-05-31T10:20:00Z",
    riskScore: 42,
    reviewStatus: "completed",
    labels: ["dependencies"],
    files: [],
  },
  {
    id: "pr-5",
    number: 856,
    title: "feat: add permissions middleware for role-based API access",
    description:
      "Introduces RBAC middleware for the admin API routes. Roles are defined in the DB — middleware fetches them on each request. No caching yet.",
    author: {
      id: "user-1",
      name: "Pejman Ebrahimi",
      avatar: "PE",
      login: "pejman-e",
    },
    status: "draft",
    repositoryId: "repo-2",
    repositoryName: "auth-platform",
    baseBranch: "main",
    headBranch: "feat/rbac-middleware",
    additions: 178,
    deletions: 12,
    changedFiles: 7,
    commits: 5,
    createdAt: "2026-06-04T07:00:00Z",
    updatedAt: "2026-06-04T08:45:00Z",
    riskScore: undefined,
    reviewStatus: "pending",
    labels: ["security", "wip"],
    files: [],
  },
];

export const DEMO_REVIEWS: Record<string, ReviewRun> = {
  "pr-1": {
    id: "run-1",
    prId: "pr-1",
    status: "completed",
    startedAt: "2026-06-04T08:00:00Z",
    completedAt: "2026-06-04T08:00:18Z",
    summary:
      "This PR introduces a sliding expiry window for JWT validation — a meaningful security change. The sliding window logic has a subtle edge case: tokens issued slightly before the configured window baseline may pass validation incorrectly when `IssuedAt` is close to `now`. The config value `sliding_window_seconds` lacks a guard against exceeding the token TTL. Tests cover the happy path but miss boundary conditions around the window edge. Overall risk is elevated due to the auth-critical nature of the change.",
    riskScore: 78,
    overallVerdict: "request-changes",
    findings: [
      {
        id: "f-1-1",
        prId: "pr-1",
        title: "JWT sliding window allows tokens past true expiry boundary",
        severity: "critical",
        category: "security",
        file: "internal/auth/jwt.go",
        lineReference: "L96-L103",
        explanation:
          "The window addition `claims.ExpiresAt + window` extends the effective lifetime of any token by up to `sliding_window_seconds`. If this value is misconfigured or exceeds the token TTL, expired tokens will still be accepted. This is a security regression from the previous strict check.",
        suggestedFix:
          "Add a hard cap: assert `window <= tokenTTL` at startup. Add a second check `claims.ExpiresAt+window <= claims.IssuedAt+tokenTTL` to prevent window from extending beyond the original intended lifetime.",
        confidence: 0.92,
        sourceType: "llm",
      },
      {
        id: "f-1-2",
        prId: "pr-1",
        title: "No guard against sliding_window_seconds exceeding token TTL",
        severity: "high",
        category: "security",
        file: "config/auth.yaml",
        lineReference: "L17",
        explanation:
          "The comment warns against this but provides no enforcement. A misconfigured deployment (e.g., `sliding_window_seconds: 86400` with a 1-hour TTL) would silently accept expired tokens for 24 hours.",
        suggestedFix:
          "Validate this in config loading: `if cfg.SlidingWindowSeconds > cfg.TokenTTL { return ErrInvalidConfig }`.",
        confidence: 0.88,
        sourceType: "llm",
      },
      {
        id: "f-1-3",
        prId: "pr-1",
        title: "Missing boundary tests for sliding window edge cases",
        severity: "high",
        category: "testing",
        file: "tests/auth/jwt_test.go",
        lineReference: "L1-L120",
        explanation:
          "Tests cover normal expiry and future tokens but miss the boundary where `now == ExpiresAt + window - 1` and `now == ExpiresAt + window`. Without these, the window edge behavior is unverified.",
        suggestedFix:
          "Add table-driven tests for: token at exact expiry, token at window boundary, token past window, token issued in the future.",
        confidence: 0.95,
        sourceType: "combined",
      },
      {
        id: "f-1-4",
        prId: "pr-1",
        title: "Middleware doesn't propagate new token TTL to client",
        severity: "medium",
        category: "bug-risk",
        file: "internal/auth/middleware.go",
        lineReference: "L44-L58",
        explanation:
          "When the sliding window grants extra time, the response doesn't include a new `expires_in` value. Clients may log out early because they still use the original expiry time.",
        suggestedFix:
          "Include a refreshed `X-Token-Expires-At` header when the window extension is applied.",
        confidence: 0.75,
        sourceType: "llm",
      },
      {
        id: "f-1-5",
        prId: "pr-1",
        title: "config.yaml loaded without schema validation",
        severity: "medium",
        category: "architecture",
        file: "config/auth.yaml",
        lineReference: "L1-L20",
        explanation:
          "The auth config is parsed at startup without a validation schema. Invalid or missing `sliding_window_seconds` will cause a nil dereference at runtime rather than a clean startup error.",
        suggestedFix:
          "Use a config validation library (e.g., go-validator) or add manual bounds checks with meaningful error messages during initialization.",
        confidence: 0.82,
        sourceType: "heuristic",
      },
    ],
    testRecommendations: [
      "Add boundary-condition unit tests for the sliding window: at-exact-expiry, at-window-edge, and post-window",
      "Add an integration test that issues a token, waits for base expiry, and verifies it's still accepted within the window",
      "Test config validation: startup should fail with a clear error if sliding_window_seconds > token_ttl",
    ],
    followUpQuestions: [
      "Should the sliding window be opt-in per client or applied globally?",
      "Is there a revocation mechanism if a token needs to be invalidated before the extended window ends?",
      "What is the intended use case — mobile clients with flaky connections?",
    ],
    tokenUsage: 4218,
    latencyMs: 3420,
    confidenceDistribution: { high: 3, medium: 2, low: 0 },
  },
  "pr-2": {
    id: "run-2",
    prId: "pr-2",
    status: "completed",
    startedAt: "2026-06-04T06:30:00Z",
    completedAt: "2026-06-04T06:30:22Z",
    summary:
      "This PR addresses a real and critical bug — duplicate charges on gateway timeout. The idempotency key approach is correct but the implementation has a gap: the key is generated but not validated against prior usage before the charge is submitted. More critically, `.env.example` contains what appears to be a live Stripe secret key rather than a placeholder. This should be treated as a potential credential leak. Test coverage was reduced compared to the previous version, which is concerning for payment logic.",
    riskScore: 85,
    overallVerdict: "request-changes",
    findings: [
      {
        id: "f-2-1",
        prId: "pr-2",
        title: "Live Stripe secret key committed to .env.example",
        severity: "critical",
        category: "security",
        file: ".env.example",
        lineReference: "L11",
        explanation:
          "The value `sk_live_ACTUAL_KEY_LEAKED_HERE` in .env.example looks like a real Stripe live-mode key rather than a placeholder. If this is an actual key, it should be revoked immediately and replaced with a placeholder like `sk_live_...`.",
        suggestedFix:
          "Revoke the key immediately via the Stripe dashboard. Replace the value with a descriptive placeholder. Add `.env` to .gitignore if not already present. Consider adding a pre-commit hook to detect secret patterns.",
        confidence: 0.97,
        sourceType: "heuristic",
      },
      {
        id: "f-2-2",
        prId: "pr-2",
        title: "Idempotency key not validated before charge submission",
        severity: "high",
        category: "bug-risk",
        file: "src/payments/retry.ts",
        lineReference: "L48-L56",
        explanation:
          "The idempotency key is generated correctly but the TODO comment reveals it is not checked against prior usage. If the same key was already used for a successful charge, Stripe will return the cached response — but if it was used for a different amount or currency, Stripe will return a 400 error that isn't handled.",
        suggestedFix:
          "Before calling `stripe.charges.create`, call `idempotency.validate(key)` from the new module. Handle the case where the key exists but belongs to a different charge parameters set.",
        confidence: 0.91,
        sourceType: "llm",
      },
      {
        id: "f-2-3",
        prId: "pr-2",
        title: "Test coverage reduced: 32 test lines deleted, 20 added",
        severity: "high",
        category: "testing",
        file: "tests/payments/retry.test.ts",
        lineReference: "L1-L200",
        explanation:
          "The diff shows more test lines removed than added. For payment retry logic, this is a significant regression. The tests removed may have covered the original retry scenarios that this PR modifies.",
        suggestedFix:
          "Restore coverage for all previous retry scenarios. Add new tests specifically for: idempotency key collision, gateway 504 followed by successful charge, and the new validation path.",
        confidence: 0.88,
        sourceType: "combined",
      },
      {
        id: "f-2-4",
        prId: "pr-2",
        title: "No error handling for Stripe idempotency conflict (409)",
        severity: "medium",
        category: "bug-risk",
        file: "src/payments/gateway.ts",
        lineReference: "L67-L89",
        explanation:
          "Stripe returns a 409 when an idempotency key is reused with different request body parameters. The current error handling doesn't distinguish this case, and it would surface as a generic payment failure to the user.",
        suggestedFix:
          "Catch `error.code === 'idempotency_key_in_use'` specifically and return an appropriate error to the caller with enough context to either retry with a new key or surface a meaningful error.",
        confidence: 0.79,
        sourceType: "llm",
      },
      {
        id: "f-2-5",
        prId: "pr-2",
        title: "Retry count not bounded in new path",
        severity: "low",
        category: "architecture",
        file: "src/payments/retry.ts",
        lineReference: "L29-L41",
        explanation:
          "The new retry path doesn't check a maximum retry count before attempting. In the old code this was enforced. A runaway retry loop could generate many idempotency keys for the same original charge.",
        suggestedFix:
          "Add `if (attempt >= MAX_RETRY_COUNT) throw new MaxRetriesExceededError()` before the new idempotency key generation.",
        confidence: 0.72,
        sourceType: "heuristic",
      },
    ],
    testRecommendations: [
      "Add tests for idempotency key collision — same key, different parameters",
      "Add an end-to-end test simulating gateway 504 followed by a charge already committed",
      "Restore deleted test coverage for all original retry scenarios",
    ],
    followUpQuestions: [
      "How long are idempotency keys retained? Does the store need TTL management?",
      "Should idempotency keys be scoped to user+charge or globally unique?",
    ],
    tokenUsage: 4891,
    latencyMs: 3980,
    confidenceDistribution: { high: 3, medium: 1, low: 1 },
  },
  "pr-3": {
    id: "run-3",
    prId: "pr-3",
    status: "completed",
    startedAt: "2026-06-03T17:00:00Z",
    completedAt: "2026-06-03T17:00:14Z",
    summary:
      "The WebSocket cart sync adds a useful real-time feature but introduces performance concerns. CartProvider re-renders on every socket message regardless of whether the relevant cart data changed. With high-frequency updates this could degrade checkout performance. The useCartSync hook doesn't clean up the WebSocket connection on unmount, which is a memory leak. Overall risk is moderate — the feature works but needs optimization before high-traffic release.",
    riskScore: 54,
    overallVerdict: "needs-attention",
    findings: [
      {
        id: "f-3-1",
        prId: "pr-3",
        title: "CartProvider re-renders on every WebSocket message",
        severity: "high",
        category: "performance",
        file: "src/components/Cart/CartProvider.tsx",
        lineReference: "L78-L95",
        explanation:
          "The socket message handler calls `setState` unconditionally. Any message — including heartbeats or unrelated events — triggers a full CartProvider re-render and propagates to all consumers.",
        suggestedFix:
          "Filter messages by type before updating state: `if (msg.type !== 'cart_update') return`. Use `useReducer` with a stable dispatch reference to avoid child re-renders when state shape hasn't changed.",
        confidence: 0.93,
        sourceType: "llm",
      },
      {
        id: "f-3-2",
        prId: "pr-3",
        title: "WebSocket connection not closed on component unmount",
        severity: "medium",
        category: "bug-risk",
        file: "src/hooks/useCartSync.ts",
        lineReference: "L34-L58",
        explanation:
          "The `useEffect` that establishes the WebSocket connection returns no cleanup function. When the component unmounts (e.g., navigating away from checkout), the connection stays open and event listeners accumulate.",
        suggestedFix:
          "Return a cleanup from the effect: `return () => { ws.removeEventListener('message', handler); ws.close(); }`",
        confidence: 0.96,
        sourceType: "combined",
      },
      {
        id: "f-3-3",
        prId: "pr-3",
        title: "No reconnection logic for dropped WebSocket connections",
        severity: "medium",
        category: "architecture",
        file: "src/hooks/useCartSync.ts",
        lineReference: "L20-L35",
        explanation:
          "WebSocket connections drop in production due to load balancer timeouts, mobile network changes, and server restarts. Without reconnection logic, users silently lose real-time sync and don't know their cart view is stale.",
        suggestedFix:
          "Implement exponential backoff reconnection: on `ws.onclose`, schedule a reconnect with `setTimeout(connect, backoff)` up to a max of 30s.",
        confidence: 0.87,
        sourceType: "llm",
      },
    ],
    testRecommendations: [
      "Add a test for WebSocket cleanup on unmount using a mock WebSocket",
      "Performance test: measure CartProvider renders per second under simulated high-frequency socket messages",
    ],
    followUpQuestions: [
      "What is the expected message frequency? Is the server rate-limiting updates?",
      "Should the WebSocket fall back to polling if the connection fails to establish?",
    ],
    tokenUsage: 3112,
    latencyMs: 2890,
    confidenceDistribution: { high: 2, medium: 1, low: 0 },
  },
};

export const DEMO_METRICS: MetricSnapshot[] = [
  { date: "2026-05-01", avgRiskScore: 52, prCount: 8, reviewCount: 6, criticalFindings: 1, highFindings: 4 },
  { date: "2026-05-05", avgRiskScore: 48, prCount: 11, reviewCount: 9, criticalFindings: 0, highFindings: 3 },
  { date: "2026-05-10", avgRiskScore: 61, prCount: 9, reviewCount: 8, criticalFindings: 2, highFindings: 5 },
  { date: "2026-05-15", avgRiskScore: 55, prCount: 13, reviewCount: 11, criticalFindings: 1, highFindings: 4 },
  { date: "2026-05-20", avgRiskScore: 67, prCount: 10, reviewCount: 9, criticalFindings: 3, highFindings: 6 },
  { date: "2026-05-25", avgRiskScore: 58, prCount: 14, reviewCount: 13, criticalFindings: 1, highFindings: 5 },
  { date: "2026-05-29", avgRiskScore: 72, prCount: 7, reviewCount: 7, criticalFindings: 2, highFindings: 7 },
  { date: "2026-06-02", avgRiskScore: 69, prCount: 12, reviewCount: 10, criticalFindings: 3, highFindings: 8 },
  { date: "2026-06-04", avgRiskScore: 74, prCount: 5, reviewCount: 4, criticalFindings: 2, highFindings: 5 },
];

export const DEMO_HOTSPOTS: HotspotModule[] = [
  { path: "internal/auth/jwt.go", findingCount: 11, avgSeverity: 3.8, categories: ["security", "bug-risk", "testing"] },
  { path: "src/payments/retry.ts", findingCount: 9, avgSeverity: 3.4, categories: ["bug-risk", "testing", "architecture"] },
  { path: "src/components/Cart/CartProvider.tsx", findingCount: 6, avgSeverity: 2.8, categories: ["performance", "bug-risk"] },
  { path: "internal/auth/middleware.go", findingCount: 5, avgSeverity: 2.6, categories: ["security", "architecture"] },
  { path: "src/payments/gateway.ts", findingCount: 4, avgSeverity: 2.4, categories: ["bug-risk", "maintainability"] },
  { path: "config/auth.yaml", findingCount: 3, avgSeverity: 3.2, categories: ["security", "architecture"] },
];

export const DEMO_EVALS: EvaluationRecord[] = [
  { id: "eval-1", reviewRunId: "run-1", findingCount: 5, confidenceAvg: 0.86, latencyMs: 3420, tokenUsage: 4218, heuristic: 1, llm: 3, combined: 1, createdAt: "2026-06-04T08:00:18Z" },
  { id: "eval-2", reviewRunId: "run-2", findingCount: 5, confidenceAvg: 0.85, latencyMs: 3980, tokenUsage: 4891, heuristic: 2, llm: 2, combined: 1, createdAt: "2026-06-04T06:30:22Z" },
  { id: "eval-3", reviewRunId: "run-3", findingCount: 3, confidenceAvg: 0.92, latencyMs: 2890, tokenUsage: 3112, heuristic: 0, llm: 2, combined: 1, createdAt: "2026-06-03T17:00:14Z" },
];

export const CATEGORY_DISTRIBUTION = [
  { name: "Security", value: 7, fill: "var(--critical)" },
  { name: "Bug Risk", value: 9, fill: "var(--chart-4)" },
  { name: "Performance", value: 4, fill: "var(--chart-3)" },
  { name: "Testing", value: 6, fill: "var(--chart-2)" },
  { name: "Architecture", value: 3, fill: "var(--chart-5)" },
  { name: "Maintainability", value: 2, fill: "var(--chart-1)" },
];
