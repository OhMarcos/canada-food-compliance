"use client";

import Link from "next/link";
import { ArrowRight, Apple, Leaf } from "lucide-react";
import type { CrossDomainInfo } from "./chat-constants";

export function CrossDomainAlert({
  crossDomain,
  language,
  t,
}: {
  readonly crossDomain: CrossDomainInfo;
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
}) {
  const isNhp = crossDomain.suggestedDomain === "nhp";
  const href = isNhp ? "/chat/nhp" : "/chat/food";
  const Icon = isNhp ? Leaf : Apple;
  const iconColor = isNhp ? "text-green-600" : "text-orange-500";
  const borderColor = isNhp
    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
    : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30";
  const domainLabel = isNhp
    ? t("NHP (Natural Health Products)", "NHP (천연건강제품)")
    : t("Food", "식품");

  return (
    <div className={`mt-2 rounded-lg border p-3 ${borderColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`size-4 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/80">
            {t("This may fall under a different regulatory domain:", "다른 규제 도메인에 해당할 수 있습니다:")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
            {crossDomain.reason}
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            {t(<>Ask in {domainLabel} domain</>, <>{domainLabel} 도메인에서 질문하기</>)}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
