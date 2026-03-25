"use client";

import { LOADING_STEPS_EN, LOADING_STEPS_KO } from "./chat-constants";

export function LoadingSteps({
  currentStep,
  language,
}: {
  readonly currentStep: number;
  readonly language: string;
}) {
  const steps = language === "en" ? LOADING_STEPS_EN : LOADING_STEPS_KO;
  return (
    <div className="space-y-2 p-3">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            {isDone ? (
              <span className="text-green-600 text-xs">&#10003;</span>
            ) : isActive ? (
              <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <span className="text-muted-foreground text-xs opacity-50">&#9679;</span>
            )}
            <span
              className={
                isDone
                  ? "text-muted-foreground line-through"
                  : isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground opacity-50"
              }
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
