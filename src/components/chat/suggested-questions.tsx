"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SUGGESTED_QUESTIONS } from "./chat-constants";

export function SuggestedQuestions({
  language,
  t,
  onSelect,
}: {
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
  readonly onSelect: (question: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {t("ClearBite Q&A", "ClearBite Q&A")}
        </h2>
        <p className="text-muted-foreground">
          {t(
            <>A regulatory consultation system based on Canadian food law.<br />Cites actual legislation and verifies through a 3-step process.</>,
            <>캐나다 식품법에 기반한 규제 상담 시스템입니다.<br />실제 법 조항을 인용하고, 3단계 검증을 거쳐 답변합니다.</>,
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <Card
            key={i}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelect(language === "en" ? q.en : q.ko)}
          >
            <CardContent className="p-3 text-sm">
              {language === "en" ? q.en : q.ko}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
