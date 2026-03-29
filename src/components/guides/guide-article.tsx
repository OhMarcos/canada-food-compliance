"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import type { ReactNode } from "react";

interface GuideArticleProps {
  readonly title_en: string;
  readonly title_ko: string;
  readonly subtitle_en: string;
  readonly subtitle_ko: string;
  readonly readTime: string;
  readonly date: string;
  readonly badges: readonly string[];
  readonly children: ReactNode;
}

export function GuideArticle({
  title_en,
  title_ko,
  subtitle_en,
  subtitle_ko,
  readTime,
  date,
  badges,
  children,
}: GuideArticleProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t("Home", "홈")}
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-foreground transition-colors">
          {t("Guides", "가이드")}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {t(title_en, title_ko)}
        </span>
      </nav>

      {/* Back link */}
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {t("All Guides", "전체 가이드")}
      </Link>

      {/* Header */}
      <header className="space-y-4 border-b pb-8">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black tracking-tight leading-tight">
          {t(title_en, title_ko)}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t(subtitle_en, subtitle_ko)}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {readTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {t("OHMAZE Research", "OHMAZE 리서치")}
          </span>
        </div>
      </header>

      {/* Article Body */}
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-table:text-sm">
        {children}
      </article>

      {/* CTA */}
      <div className="rounded-xl border bg-primary/5 p-6 text-center space-y-3">
        <p className="font-semibold">
          {t(
            "Have specific compliance questions?",
            "구체적인 규제 질문이 있으신가요?",
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(
            "Our AI consultant answers based on actual Canadian legislation.",
            "실제 캐나다 법 조항에 기반하여 AI 컨설턴트가 답변합니다.",
          )}
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          {t("Start Q&A Chat", "Q&A 상담 시작")}
        </Link>
      </div>
    </div>
  );
}
