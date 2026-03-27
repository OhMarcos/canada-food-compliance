"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface RegulationItem {
  readonly id: string;
  readonly title_en: string;
  readonly title_ko: string | null;
  readonly short_name: string;
  readonly statute_type: string;
  readonly official_url: string;
  readonly applies_to: readonly string[];
  readonly agencies: {
    readonly acronym: string;
    readonly name_en?: string;
    readonly name_ko: string;
  } | null;
}

const STATUTE_TYPE_COLORS: Record<string, string> = {
  act: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  regulation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  guideline: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  policy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  standard: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const TOPIC_FILTERS = [
  { value: "import", label_en: "Import", label_ko: "수입" },
  { value: "production", label_en: "Production", label_ko: "생산" },
  { value: "labeling", label_en: "Labelling", label_ko: "라벨링" },
  { value: "licensing", label_en: "Licensing", label_ko: "라이선스" },
  { value: "safety", label_en: "Safety", label_ko: "안전" },
  { value: "tariff", label_en: "Tariff", label_ko: "관세" },
] as const;

export function RegulationList() {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [regulations, setRegulations] = useState<readonly RegulationItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const fetchRegulations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (topicFilter) params.set("topic", topicFilter);

      const response = await fetch(`/api/regulations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch regulations");
      const data = await response.json();
      setRegulations(data.regulations ?? []);
    } catch (err) {
      console.error("Failed to fetch regulations:", err);
      setError(t(
        "Failed to load regulations. Please try again.",
        "규제 목록을 불러오는데 실패했습니다. 다시 시도해주세요.",
      ));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, topicFilter, t]);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t(
              "Search regulations... (e.g. labelling, import, SFCR)",
              "규제 검색... (예: labelling, import, SFCR)",
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={topicFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTopicFilter(null)}
          >
            {t("All", "전체")}
          </Badge>
          {TOPIC_FILTERS.map((filter) => (
            <Badge
              key={filter.value}
              variant={topicFilter === filter.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTopicFilter(filter.value)}
            >
              {t(filter.label_en, filter.label_ko)}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="size-4 flex-shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t(
              `${regulations.length} regulation document(s)`,
              `${regulations.length}개의 규제 문서`,
            )}
            {(debouncedSearch || topicFilter) && t(" (filtered)", " (필터 적용됨)")}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="py-3 px-4">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-16" />
                  <div className="h-5 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {regulations.map((reg) => (
            <Card key={reg.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <Link
                        href={`/regulations/${reg.id}`}
                        className="hover:text-primary"
                      >
                        {isEn ? reg.title_en : (reg.title_ko ?? reg.title_en)}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isEn ? (reg.title_ko ?? "") : reg.title_en}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {reg.short_name}
                    </Badge>
                    <Badge
                      className={`text-xs ${STATUTE_TYPE_COLORS[reg.statute_type] ?? ""}`}
                    >
                      {reg.statute_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {reg.applies_to.slice(0, 5).map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isEn
                      ? (reg.agencies?.name_en ?? reg.agencies?.acronym)
                      : (reg.agencies?.name_ko ?? reg.agencies?.acronym)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {regulations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t("No results found.", "검색 결과가 없습니다.")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
