"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SUGGESTED_QUESTIONS_FOOD, SUGGESTED_QUESTIONS_NHP } from "./chat-constants";
import type { ProductDomain } from "@/lib/rag/domain-classifier";

export function SuggestedQuestions({
  language,
  t,
  onSelect,
  domain = "food",
}: {
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
  readonly onSelect: (question: string) => void;
  readonly domain?: ProductDomain;
}) {
  const questions = domain === "nhp" ? SUGGESTED_QUESTIONS_NHP : SUGGESTED_QUESTIONS_FOOD;
  const title = domain === "nhp" ? "OHMAZE NHP Q&A" : "OHMAZE Food Q&A";
  const subtitle = domain === "nhp"
    ? t(
        <>A regulatory consultation system for Canadian Natural Health Products (NHP).<br />Cites NHPR, GMP guides, and verifies through a 3-step process.</>,
        <>캐나다 천연건강제품(NHP) 규제 상담 시스템입니다.<br />NHPR, GMP 가이드를 인용하고, 3단계 검증을 거쳐 답변합니다.</>,
      )
    : t(
        <>A regulatory consultation system based on Canadian food law.<br />Cites actual legislation and verifies through a 3-step process.</>,
        <>캐나다 식품법에 기반한 규제 상담 시스템입니다.<br />실제 법 조항을 인용하고, 3단계 검증을 거쳐 답변합니다.</>,
      );

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
        {questions.map((q, i) => (
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
