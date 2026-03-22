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
    className: "bg-green-600 hover:bg-green-700",
    label_ko: "높은 신뢰도",
    label_en: "High Confidence",
    icon: "\u2713",
  },
  MEDIUM: {
    variant: "default" as const,
    className: "bg-yellow-600 hover:bg-yellow-700",
    label_ko: "보통 신뢰도",
    label_en: "Medium Confidence",
    icon: "~",
  },
  LOW: {
    variant: "default" as const,
    className: "bg-red-600 hover:bg-red-700",
    label_ko: "낮은 신뢰도",
    label_en: "Low Confidence",
    icon: "!",
  },
  UNVERIFIED: {
    variant: "outline" as const,
    className: "border-gray-400 text-gray-500",
    label_ko: "미검증",
    label_en: "Unverified",
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
              "All citations verified in the database and confirmed by AI verifier.",
              "모든 인용이 데이터베이스에서 확인되었고, AI 검증자가 정확성을 확인했습니다.",
            )}
          </p>
        )}
        {confidence === "MEDIUM" && (
          <p className="text-xs mt-1">
            {t(
              "Some citations verified, but additional confirmation may be needed.",
              "일부 인용이 검증되었지만, 추가 확인이 필요한 부분이 있습니다.",
            )}
          </p>
        )}
        {confidence === "LOW" && (
          <p className="text-xs mt-1">
            {t(
              "Issues found during verification. Please check the actual legislation directly.",
              "검증 과정에서 문제가 발견되었습니다. 실제 법 조항을 직접 확인하세요.",
            )}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
