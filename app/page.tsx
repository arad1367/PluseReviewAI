import Link from "next/link";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart3,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Code2,
  Lock,
  Cpu,
  TestTube,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Security-first analysis",
    description:
      "Detects credential leaks, auth logic flaws, injection risks, and misconfigured access controls — before they reach production.",
  },
  {
    icon: GitPullRequest,
    title: "Structured findings by severity",
    description:
      "Each finding includes a title, explanation, suggested fix, and confidence score. No noise, no filler — only actionable engineering insight.",
  },
  {
    icon: BarChart3,
    title: "Team-level code quality trends",
    description:
      "Track average risk scores, recurring hotspots, and finding patterns across repositories and sprints.",
  },
  {
    icon: TrendingUp,
    title: "Evaluation and trust signals",
    description:
      "Every review run captures token usage, latency, confidence distribution, and heuristic vs LLM agreement — so you can trust the system.",
  },
];

const FINDING_PREVIEW = [
  {
    label: "Critical",
    color: "text-red-500 bg-red-500/10 border-red-500/20",
    title: "Live Stripe secret key committed to .env.example",
    file: ".env.example · L11",
    detail: "The value matches a live-mode key pattern. Revoke immediately.",
  },
  {
    label: "High",
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    title: "Idempotency key not validated before charge submission",
    file: "src/payments/retry.ts · L48",
    detail: "Key generated but not checked against prior usage — risk of duplicate charges.",
  },
  {
    label: "High",
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    title: "Test coverage reduced: 32 lines deleted, 20 added",
    file: "tests/payments/retry.test.ts",
    detail: "Regression in payment retry test coverage for a critical flow.",
  },
];

const ARCHITECTURE_STEPS = [
  { step: "01", title: "Ingest PR metadata", detail: "Title, description, diff chunks, file types, commit info" },
  { step: "02", title: "Heuristic pre-check", detail: "File count, churn size, secrets, test presence, risky patterns" },
  { step: "03", title: "Claude review", detail: "Structured JSON output: findings, risk score, verdict, recommendations" },
  { step: "04", title: "Post-processing", detail: "Normalize severities, deduplicate, rank by confidence" },
  { step: "05", title: "Render + evaluate", detail: "Display findings, capture latency, token usage, confidence signals" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--teal)]">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">
              PulseReview <span className="text-[var(--teal)]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Built for modern engineering teams
            </span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Open demo <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--teal)]/30 bg-[var(--teal)]/8 px-3 py-1 text-xs font-medium text-[var(--teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
            AI-assisted PR review — demo available
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] text-foreground mb-6">
            Review pull requests
            <br />
            <span className="text-[var(--teal)]">before they become incidents.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
            Catch risky changes earlier with structured AI review. Turn noisy diffs into
            prioritized engineering insight — security, bugs, performance, and test gaps, ranked
            by confidence.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Open demo app <ArrowRight size={14} />
            </Link>
            <Link
              href="/pr/pr-2"
              className="flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <GitPullRequest size={14} />
              See a live AI review
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-8 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Built for teams shipping fast:</span>
            {[
              "Payments & Fintech",
              "Auth & Identity",
              "Frontend Product",
              "Platform Engineering",
              "Security-conscious orgs",
            ].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[var(--teal)]" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PR finding preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--teal)] mb-3">
              Structured findings
            </p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Not just comments.
              <br />
              Prioritized intelligence.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Each finding comes with severity, category, file location, explanation, and a
              concrete fix. Confidence scores tell you how certain the AI is — so you focus on
              what matters.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { icon: Lock, text: "Secrets and credential leak detection" },
                { icon: AlertTriangle, text: "Logic bugs and edge case analysis" },
                { icon: Cpu, text: "Performance regression signals" },
                { icon: TestTube, text: "Test coverage gaps flagged" },
                { icon: Code2, text: "Architecture and maintainability insights" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-muted-foreground">
                  <Icon size={14} className="text-[var(--teal)] flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock finding cards */}
          <div className="space-y-3">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <GitPullRequest size={12} />
              <span className="font-mono">
                acme-corp/payments-service · PR #621 — payment retry idempotency
              </span>
            </div>
            {FINDING_PREVIEW.map((f, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${f.color}`}
                  >
                    {f.label}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{f.file}</span>
                </div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            ))}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Risk score</span>
              <span className="text-sm font-bold text-red-500">85 / 100 — High Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--teal)] mb-3">
              Platform
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              More than a code linter.
              <br />
              An engineering intelligence layer.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6 space-y-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--teal)]/10">
                  <Icon size={17} className="text-[var(--teal)]" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--teal)] mb-3">
            Architecture
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Deterministic first. LLM second.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Heuristic checks run before any LLM call — reducing hallucinations, lowering cost,
            and improving accuracy for known patterns.
          </p>
        </div>
        <div className="grid sm:grid-cols-5 gap-2">
          {ARCHITECTURE_STEPS.map(({ step, title, detail }, i) => (
            <div key={step} className="relative">
              <div className="rounded-lg border border-border bg-card p-4 h-full">
                <span className="text-[10px] font-mono font-bold text-[var(--teal)] mb-2 block">
                  {step}
                </span>
                <h4 className="text-xs font-semibold text-foreground mb-1">{title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
              </div>
              {i < ARCHITECTURE_STEPS.length - 1 && (
                <div className="hidden sm:flex absolute -right-1 top-1/2 -translate-y-1/2 z-10 h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  <ArrowRight size={8} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            See where code quality is drifting
            <br />
            <span className="text-[var(--teal)]">before velocity slows.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            No setup required. The demo uses realistic engineering scenarios from a fictional
            startup with three active repositories.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
          >
            Explore the demo <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap size={11} className="text-[var(--teal)]" />
            <span>PulseReview AI — demo project</span>
          </div>
          <span>© 2026 Built by Pejman Ebrahimi</span>
        </div>
      </footer>
    </div>
  );
}
