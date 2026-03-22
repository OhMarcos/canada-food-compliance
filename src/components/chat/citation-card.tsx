"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSafeUrl } from "@/lib/url";
import { useLanguage } from "@/hooks/use-language";
import type { Citation } from "@/types/chat";

interface CitationCardProps {
  readonly citation: Citation;
  readonly index: number;
  readonly isVerified?: boolean;
}

export function CitationCard({ citation, index, isVerified }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-blue-500"
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={expanded}
      aria-label={t(
        `Citation ${index + 1}: ${citation.regulation_name} ${citation.section_number}`,
        `인용 ${index + 1}: ${citation.regulation_name} ${citation.section_number}`,
      )}
    >
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <span className="truncate">{citation.regulation_name}</span>
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {citation.section_number}
            </Badge>
            {isVerified !== undefined && (
              <Badge
                variant={isVerified ? "default" : "destructive"}
                className="text-xs"
              >
                {isVerified ? t("Verified", "검증됨") : t("Unverified", "미검증")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 px-3 pb-3">
          <p className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap">
            {citation.excerpt}
          </p>
          {isSafeUrl(citation.official_url) && (
            <a
              href={citation.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t("View official source", "공식 출처 보기")}
            </a>
          )}
        </CardContent>
      )}
    </Card>
  );
}
