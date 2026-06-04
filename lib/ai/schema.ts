import { z } from "zod";

export const reviewSchema = z.object({
  summary: z.string().describe("2-4 sentence summary of the PR and key concerns"),
  risk_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall risk score 0-100. 0=safe, 100=critical risk"),
  overall_verdict: z
    .enum(["approve", "request-changes", "needs-attention"])
    .describe("approve: looks good; needs-attention: minor issues; request-changes: significant issues"),
  findings: z.array(
    z.object({
      id: z.string().describe("Unique short ID like f-1, f-2"),
      title: z.string().describe("Short title of the issue, 5-12 words"),
      severity: z.enum(["critical", "high", "medium", "low", "info"]),
      category: z.enum([
        "bug-risk",
        "security",
        "performance",
        "maintainability",
        "testing",
        "architecture",
        "style",
      ]),
      file: z.string().describe("File path where the issue is found"),
      line_reference: z
        .string()
        .describe("Line reference like L42 or L10-L20. Use empty string if no specific line applies"),
      explanation: z
        .string()
        .describe("Clear explanation of the issue and why it's a problem, 2-4 sentences"),
      suggested_fix: z
        .string()
        .describe("Concrete, actionable fix suggestion, 2-4 sentences"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("Confidence in this finding 0.0-1.0"),
      source_type: z
        .enum(["heuristic", "llm", "combined"])
        .describe("heuristic: pattern-based; llm: reasoning-based; combined: both"),
    })
  ),
  test_recommendations: z
    .array(z.string())
    .describe("2-4 specific test cases that should be added or improved"),
  follow_up_questions: z
    .array(z.string())
    .describe("1-3 clarifying questions for the author"),
});

export type ReviewOutput = z.infer<typeof reviewSchema>;
