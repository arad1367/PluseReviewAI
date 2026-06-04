"use client";

import { cn } from "@/lib/utils";

function getRiskColor(score: number) {
  if (score >= 75) return "text-red-500";
  if (score >= 50) return "text-orange-500";
  if (score >= 25) return "text-yellow-500";
  return "text-emerald-500";
}

function getRiskLabel(score: number) {
  if (score >= 75) return "High Risk";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Low Risk";
  return "Safe";
}

function getRiskStroke(score: number) {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 25) return "#eab308";
  return "#22c55e";
}

export function RiskScoreGauge({
  score,
  size = 80,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const r = (size - 12) / 2;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Track */}
        <path
          d={`M 6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-muted"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke={getRiskStroke(score)}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 5}
          fontWeight="700"
          fill="currentColor"
          className={getRiskColor(score)}
        >
          {score}
        </text>
      </svg>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", getRiskColor(score))}>
        {getRiskLabel(score)}
      </span>
    </div>
  );
}
