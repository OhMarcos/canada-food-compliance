"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/use-language";

interface VerificationBadgeProps {
  readonly confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  readonly notes?: string;
  readonly verifiedCount?: number;
  readonly totalCount?: number;
}

const BADGE_CONFIG = {
  HIGH: {
    variant: "default" as const,
    className: "bg-accent hover:bg-accent/90",
    label_ko: "법령 확인 완료",
    label_en: "Fully Verified",
    icon: "\u2713",
  },
  MEDIUM: {
    variant: "default" as const,
    className: "bg-yellow-600 hover:bg-yellow-700",
    label_ko: "일부 직접 확인 권장",
    label_en: "Partially Verified",
    icon: "~",
  },
  LOW: {
    variant: "default" as const,
    className: "bg-red-600 hover:bg-red-700",
    label_ko: "직접 확인 필요",
    label_en: "Double-Check Recommended",
    icon: "!",
  },
  UNVERIFIED: {
    variant: "outline" as const,
    className: "border-gray-400 text-gray-500",
    label_ko: "검증 전",
    label_en: "Pending Review",
    icon: "?",
  },
} as const;

export function VerificationBadge({
  confidence,
  notes,
  verifiedCount,
  totalCount,
}: VerificationBadgeProps) {
  const config = BADGE_CONFIG[confidence];
  const { t } = useLanguage();

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={config.variant} className={config.className}>
          <span className="mr-1">{config.icon}</span>
          {t(config.label_en, config.label_ko)}
          {verifiedCount !== undefined && totalCount !== undefined && (
            <span className="ml-1 text-xs opacity-80">
              ({verifiedCount}/{totalCount})
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">{t(config.label_en, config.label_ko)}</p>
        {notes && <p className="text-xs mt-1">{notes}</p>}
        {confidence === "HIGH" && (
          <p className="text-xs mt-1">
            {t(
              "All citations matched against our regulation database and cross-checked by AI.",
              "모든 인용이 규제 데이터베이스와 대조 확인되었고, AI가 교차 검증했습니다.",
            )}
          </p>
        )}
        {confidence === "MEDIUM" && (
          <p className="text-xs mt-1">
            {t(
              "Most citations verified. We recommend confirming a few details with the original regulation text.",
              "대부분의 인용이 검증되었습니다. 일부 세부 사항은 원문 규정에서 직접 확인하시면 더 정확합니다.",
            )}
          </p>
        )}
        {confidence === "LOW" && (
          <p className="text-xs mt-1">
            {t(
              "This answer may need your review. We recommend checking the cited regulations directly before relying on it.",
              "이 답변은 직접 확인이 필요합니다. 인용된 규정 원문을 직접 확인하신 후 활용하시기를 권장합니다.",
            )}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
