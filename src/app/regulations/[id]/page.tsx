"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isSafeUrl } from "@/lib/url";
import { useLanguage } from "@/hooks/use-language";

interface RegulationDetail {
  readonly regulation: {
    readonly id: string;
    readonly title_en: string;
    readonly title_ko: string | null;
    readonly short_name: string;
    readonly statute_type: string;
    readonly official_url: string;
    readonly gazette_citation: string | null;
    readonly effective_date: string | null;
    readonly last_amended: string | null;
    readonly applies_to: readonly string[];
    readonly agencies: {
      readonly name_en: string;
      readonly name_ko: string;
      readonly acronym: string;
    };
  };
  readonly sections: readonly {
    readonly id: string;
    readonly section_number: string;
    readonly title_en: string;
    readonly title_ko: string | null;
    readonly content_en: string;
    readonly content_ko: string | null;
    readonly section_url: string | null;
    readonly topics: readonly string[];
  }[];
}

function Breadcrumbs({ title }: { readonly title: string }) {
  const { t } = useLanguage();
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        {t("Home", "홈")}
      </Link>
      <span>/</span>
      <Link
        href="/regulations"
        className="hover:text-foreground transition-colors"
      >
        {t("Regulation Browser", "규제 브라우저")}
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium truncate max-w-[200px]">
        {title}
      </span>
    </nav>
  );
}

function CollapsibleSection({
  section,
  isOpen: controlledOpen,
  onToggle,
}: {
  readonly section: RegulationDetail["sections"][number];
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  const { language, t } = useLanguage();
  const isOpen = controlledOpen;
  const isEn = language === "en";

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-muted-foreground text-sm flex-shrink-0">
              {isOpen ? "\u25BC" : "\u25B6"}
            </span>
            <CardTitle className="text-base truncate">
              {section.section_number} -{" "}
              {isEn ? section.title_en : (section.title_ko ?? section.title_en)}
            </CardTitle>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {section.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0 border-t">
          <div className="pt-3 space-y-3">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {isEn ? section.content_en : (section.content_ko ?? section.content_en)}
            </div>
            {!isEn && section.content_ko && (
              <>
                <Separator />
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {section.content_en}
                </div>
              </>
            )}
            {isEn && section.content_ko && (
              <>
                <Separator />
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {section.content_ko}
                </div>
              </>
            )}
            <div className="flex items-center gap-2 pt-1">
              {isSafeUrl(section.section_url) && (
                <a
                  href={section.section_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  {t("View official source", "공식 출처 보기")}
                </a>
              )}
              <Link
                href={`/chat?q=${encodeURIComponent(
                  isEn
                    ? `Tell me more about ${section.section_number}`
                    : `${section.section_number}에 대해 자세히 알려주세요`,
                )}`}
                className="text-xs text-primary hover:underline"
              >
                {t("Ask about this section", "이 조항에 대해 질문하기")}
              </Link>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function RegulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [data, setData] = useState<RegulationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Reset state on id change (render-time state adjustment)
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setIsLoading(true);
    setError(null);
    setData(null);
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/regulations/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((loadedData) => {
        setData(loadedData);
        if (loadedData.sections?.length > 0) {
          setOpenSections(new Set([loadedData.sections[0].id]));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-muted-foreground">
          {t("Loading regulation...", "규제 정보 로딩 중...")}
        </p>
      </div>
    );
  }

  if (error || !data?.regulation) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">
          {error ?? t("Regulation not found.", "규제를 찾을 수 없습니다.")}
        </p>
        <Link href="/regulations">
          <Button variant="outline">
            {t("Back to Regulation Browser", "규제 브라우저로 돌아가기")}
          </Button>
        </Link>
      </div>
    );
  }

  const { regulation, sections } = data;

  return (
    <div className="space-y-6">
      <Breadcrumbs title={regulation.short_name} />

      {/* Regulation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-xl">
                {isEn ? regulation.title_en : (regulation.title_ko ?? regulation.title_en)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEn ? (regulation.title_ko ?? "") : regulation.title_en}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Badge variant="outline">{regulation.short_name}</Badge>
              <Badge>{regulation.statute_type}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {t("Agency", "기관")}
              </span>
              <p className="font-medium">
                {isEn ? regulation.agencies.name_en : regulation.agencies.name_ko} ({regulation.agencies.acronym})
              </p>
            </div>
            {regulation.gazette_citation && (
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("Gazette Citation", "관보 인용")}
                </span>
                <p className="font-medium">{regulation.gazette_citation}</p>
              </div>
            )}
            {regulation.effective_date && (
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("Effective Date", "시행일")}
                </span>
                <p className="font-medium">{regulation.effective_date}</p>
              </div>
            )}
            {regulation.last_amended && (
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("Last Amended", "최종 개정")}
                </span>
                <p className="font-medium">{regulation.last_amended}</p>
              </div>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {regulation.applies_to.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            {isSafeUrl(regulation.official_url) && (
            <a
              href={regulation.official_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                {t("View Official Source", "공식 출처 열기")}
              </Button>
            </a>
            )}
            <Link
              href={`/chat?q=${encodeURIComponent(
                isEn
                  ? `Tell me about ${regulation.short_name}`
                  : `${regulation.short_name}에 대해 알려주세요`,
              )}`}
            >
              <Button variant="secondary" size="sm">
                {t("Ask about this law", "이 법률에 대해 질문하기")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t(`Sections (${sections.length})`, `조항 목록 (${sections.length}개)`)}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allOpen = openSections.size === sections.length;
                if (allOpen) {
                  setOpenSections(new Set());
                } else {
                  setOpenSections(new Set(sections.map((s) => s.id)));
                }
              }}
            >
              {openSections.size === sections.length
                ? t("Collapse All", "모두 접기")
                : t("Expand All", "모두 펼치기")}
            </Button>
          </div>
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => {
                setOpenSections((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) {
                    next.delete(section.id);
                  } else {
                    next.add(section.id);
                  }
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
