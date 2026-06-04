"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "parse", label: "Parsing diff and file metadata" },
  { id: "static", label: "Running static heuristic checks" },
  { id: "claude", label: "Asking Claude for review" },
  { id: "rank", label: "Ranking findings by severity" },
  { id: "finalize", label: "Finalizing report" },
];

interface Props {
  onComplete: () => void;
}

export function ReviewProgress({ onComplete }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const DELAYS = [700, 1200, 2800, 600, 500];
    let step = 0;

    function advance() {
      if (step >= STEPS.length) {
        onComplete();
        return;
      }
      setActiveStep(step + 1);
      step++;
      setTimeout(advance, DELAYS[step - 1] ?? 500);
    }

    const t = setTimeout(advance, 300);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex flex-col gap-3 py-2">
      {STEPS.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep - 1 && !done;
        const waiting = i >= activeStep;

        return (
          <div key={step.id} className="flex items-center gap-3">
            {done ? (
              <CheckCircle2 size={16} className="text-[var(--teal)] flex-shrink-0" />
            ) : active ? (
              <Loader2 size={16} className="text-[var(--teal)] flex-shrink-0 animate-spin" />
            ) : (
              <Circle size={16} className="text-border flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-sm",
                done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
