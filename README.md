# PulseReview AI

> AI-powered pull request review and engineering intelligence platform

PulseReview AI brings structured, agentic AI code review into your engineering workflow. Paste any public GitHub repository, pick your preferred AI provider, and receive prioritised findings, risk scoring, and actionable suggestions in seconds — all without any server-side key storage.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What it does

| Feature | Description |
|---|---|
| **Real GitHub PR review** | Enter any public repo URL (`owner/repo`) to browse open PRs and run a live AI review |
| **Multi-provider AI** | Groq · Google Gemini · OpenRouter (free models) · Anthropic Claude · OpenAI — your key, your budget |
| **Structured findings** | Bugs, security issues, performance, maintainability, testing gaps — grouped by severity and annotated with confidence |
| **Risk scoring** | Every PR gets a 0–100 risk score with an approve / needs-attention / request-changes verdict |
| **Demo mode** | Three fictional engineering repos with pre-reviewed PRs — works with zero configuration |
| **Evaluation layer** | Per-run latency, token usage, confidence distribution, and source-type breakdown (heuristic vs LLM vs combined) |
| **Engineering insights** | Risk trends, issue category distribution, hotspot files, and weekly breakdown charts |
| **Privacy-first** | API keys live only in `sessionStorage` — never logged, never stored server-side |

---

## Screenshots

### PR Review — 3-panel layout
Files panel · AI findings grouped by severity · Risk score gauge + verdict

### Insights — Engineering analytics
Risk trend chart · Category distribution · Hotspot file list

### Evaluations — Trust center
Live review run log · Confidence distribution · Source-type breakdown

---

## Tech stack

```
Frontend          Next.js 16 · App Router · TypeScript · Tailwind CSS v4 · shadcn/ui
AI layer          Vercel AI SDK v6 · generateObject · Zod schemas
Providers         Groq · Google Gemini · OpenRouter · Anthropic · OpenAI
Charts            Recharts
Icons             Lucide React
Animation         Framer Motion
GitHub API        REST v3 (unauthenticated, public repos)
Storage           sessionStorage (API keys) · localStorage (review history)
Deployment        Vercel
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/arad1367/PluseReviewAI.git
cd PluseReviewAI
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully in demo mode — no API keys required to explore.

### 3. Run a real AI review

1. Go to **Pull Requests** in the sidebar
2. Enter any public GitHub repo (e.g. `vercel/next.js` or a full GitHub URL)
3. Pick a PR from the list
4. Click **Run AI Review**
5. Choose your provider and paste your API key — it is stored only in your browser session

---

## Supported AI providers

| Provider | Free tier | Recommended model |
|---|---|---|
| **Groq** | No (from $0.075/1M tokens) | GPT OSS 20B — fastest inference |
| **Google Gemini** | Yes | Gemini 2.5 Flash — best free option |
| **OpenRouter** | Yes (free models) | Llama 4 Scout, Qwen3 32B |
| **Anthropic** | No | Claude Sonnet 4.6 |
| **OpenAI** | No | GPT-4o |

> API keys are never sent to or stored on this server. They travel directly from your browser to the provider via the Next.js API route and are used only for that single request.

---

## Project structure

```
pulse-review-ai/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── dashboard/                      # Overview dashboard
│   ├── pr/                             # Demo PR list + detail
│   │   └── [id]/
│   ├── github/[owner]/[repo]/[prNumber]/ # Real GitHub PR review
│   ├── insights/                       # Engineering analytics
│   ├── evaluations/                    # AI trust & eval metrics
│   ├── settings/                       # Provider config
│   └── api/review/route.ts             # AI review endpoint
├── components/
│   ├── layout/                         # AppShell, Sidebar, ThemeToggle
│   ├── charts/                         # RiskTrendChart, CategoryDistributionChart
│   ├── pr/                             # FindingCard, ProviderModal, ReviewProgress
│   └── ui/                             # SeverityBadge, RiskScoreGauge, MetricCard, …
├── lib/
│   ├── ai/
│   │   ├── providers.ts                # Provider + model configuration
│   │   ├── schema.ts                   # Zod schema for structured AI output
│   │   └── prompt.ts                   # System + user prompt builders
│   ├── github/api.ts                   # GitHub REST API helpers
│   ├── demo/seed.ts                    # Seeded repos, PRs, and review runs
│   ├── store/reviewStore.ts            # localStorage persistence for live reviews
│   └── types/index.ts                  # Shared TypeScript types
```

---

## AI review pipeline

```
1. Ingest        PR title · description · changed files · additions/deletions · diff chunks
2. Heuristic     File count · churn size · risky file types · auth/config/migration flags
3. LLM review    generateObject() → structured JSON via Zod schema
4. Output        summary · risk_score · overall_verdict · findings[] · test_recommendations[]
5. Eval          Latency · token usage · confidence distribution · source type breakdown
```

The review prompt asks the model to act as a senior engineer reviewing under time pressure: concise, practical, no academic prose.

### Finding schema

Each finding includes:

```typescript
{
  id: string           // f-1, f-2, …
  title: string        // 5-12 word summary
  severity: "critical" | "high" | "medium" | "low" | "info"
  category: "bug-risk" | "security" | "performance" | "maintainability" | "testing" | "architecture" | "style"
  file: string         // affected file path
  line_reference: string  // e.g. "L42" or "L10-L20"
  explanation: string  // 2-4 sentences on why it's a problem
  suggested_fix: string   // concrete, actionable fix
  confidence: number   // 0.0–1.0
  source_type: "heuristic" | "llm" | "combined"
}
```

---

## Environment variables

This project requires **no environment variables** to run. API keys are supplied at runtime by the user and passed through the `/api/review` route for that request only.

For local development, no `.env` file is needed.

---

## Deployment

### Deploy to Vercel (one click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/arad1367/PluseReviewAI)

Or manually:

```bash
npm i -g vercel
vercel
```

No environment variables need to be configured on Vercel — the app is fully serverless and key-free by design.

---

## Demo scenarios

The built-in demo uses three fictional engineering repos:

| Repo | PR scenario | Key risk |
|---|---|---|
| `payments-service` | Stripe payment retry logic | Potential duplicate charge on network timeout |
| `auth-platform` | JWT sliding-window token validation | Edge case: token issued just before refresh cycle |
| `checkout-ui` | React dashboard with real-time WebSocket feed | Expensive re-renders on every tick |

Each demo PR has a full pre-computed AI review with findings, severity groups, confidence scores, and test recommendations.

---

## Built by

**Pejman Ebrahimi** — AI engineer & full-stack developer

> Built to demonstrate agentic AI integration, real-world developer tooling, structured LLM output, and production-grade UI design.

---

## License

MIT
