"use client";

import { AlertTriangle, Lightbulb, Info, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";

type CalloutType = "warning" | "tip" | "info" | "success";

const CALLOUT_STYLES: Record<CalloutType, { icon: typeof Info; bg: string; border: string; iconColor: string }> = {
  warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", iconColor: "text-amber-600" },
  tip: { icon: Lightbulb, bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", iconColor: "text-blue-600" },
  info: { icon: Info, bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-200 dark:border-slate-800", iconColor: "text-slate-600" },
  success: { icon: CheckCircle, bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", iconColor: "text-green-600" },
};

interface CalloutProps {
  readonly type: CalloutType;
  readonly title?: string;
  readonly children: ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border ${style.border} ${style.bg} p-4 my-6 not-prose`}>
      <div className="flex gap-3">
        <Icon className={`size-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
        <div className="space-y-1">
          {title && <p className="font-semibold text-sm">{title}</p>}
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
