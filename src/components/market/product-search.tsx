"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, MessageSquare } from "lucide-react";
import { isSafeUrl } from "@/lib/url";
import { useLanguage } from "@/hooks/use-language";
import type { MarketSearchResult } from "@/types/market";

const PRODUCT_CATEGORIES = [
  { value: "kimchi", label_en: "Kimchi", label_ko: "김치류" },
  { value: "sauce", label_en: "Sauces (Gochujang, Doenjang)", label_ko: "장류 (고추장, 된장, 쌈장)" },
  { value: "noodles", label_en: "Noodles (Ramen, Guksu)", label_ko: "면류 (라면, 국수)" },
  { value: "snacks", label_en: "Snacks", label_ko: "과자/스낵" },
  { value: "beverages", label_en: "Beverages", label_ko: "음료 (소주, 막걸리, 차)" },
  { value: "seafood", label_en: "Seafood", label_ko: "수산물/해산물" },
  { value: "health_food", label_en: "Health Food (Red Ginseng, Supplements)", label_ko: "건강식품 (홍삼, 보충제)" },
  { value: "frozen", label_en: "Frozen Food (Dumplings, Rice Cake)", label_ko: "냉동식품 (만두, 떡)" },
  { value: "seasoning", label_en: "Seasonings (Chili Flakes, Sesame Oil)", label_ko: "양념류 (고춧가루, 참기름)" },
  { value: "dairy", label_en: "Dairy", label_ko: "유제품" },
] as const;

export function ProductSearch() {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<MarketSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!productName.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName,
          category: category || undefined,
          origin_country: "KR",
          include_web_search: true,
        }),
      });

      if (!response.ok) {
        throw new Error(t(
          `Search failed (${response.status})`,
          `검색에 실패했습니다 (${response.status})`,
        ));
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              "An error occurred during search. Please try again.",
              "검색 중 오류가 발생했습니다. 다시 시도해주세요.",
            ),
      );
      console.error("Market search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Market Cross-Check", "시장 크로스체크")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              "Check if similar food products are already sold in the Canadian market. The existence of similar products can serve as a compliance reference.",
              "식품이 이미 캐나다 시장에서 판매되고 있는지 확인합니다. 유사 제품의 존재는 규제 준수의 참고자료가 됩니다.",
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder={t(
                "Product name (e.g. Shin Ramyun, CJ Gochujang)",
                "제품명 (예: 종가집 김치, 신라면, CJ 고추장)",
              )}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <Button
              onClick={search}
              disabled={isLoading || !productName.trim()}
            >
              {isLoading ? t("Searching...", "검색 중...") : t("Search", "검색")}
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setCategory(category === cat.value ? "" : cat.value)
                }
              >
                {t(cat.label_en, cat.label_ko)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="size-4 flex-shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {t(
                  `${result.total_similar} similar product(s) found`,
                  `${result.total_similar}개 유사 제품 발견`,
                )}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t(`Search time: ${result.search_time_ms}ms`, `검색 시간: ${result.search_time_ms}ms`)}
              </span>
            </div>
            <Link
              href={`/chat?q=${encodeURIComponent(
                isEn
                  ? `What regulations apply when importing ${productName} to Canada?`
                  : `${productName}을(를) 캐나다로 수입할 때 필요한 규제 요건은?`,
              )}`}
            >
              <Button variant="outline" size="sm">
                <MessageSquare className="size-3 mr-1" />
                {t("Check Regulations", "규제 확인하기")}
              </Button>
            </Link>
          </div>

          {/* Web Products */}
          {result.web_products.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  {t("Similar Products in Canadian Market", "캐나다 시장 내 유사 제품")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.web_products.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium">
                        {product.name}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({product.brand})
                        </span>
                      )}
                      {product.snippet && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.snippet}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {product.retailer && (
                        <Badge variant="secondary" className="text-xs">
                          {product.retailer}
                        </Badge>
                      )}
                      {isSafeUrl(product.url) && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* DB Products */}
          {result.db_products.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  {t("Products in Database", "데이터베이스 내 제품")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.db_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {product.product_name}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({product.brand})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {product.retailer && (
                        <Badge variant="secondary" className="text-xs">
                          {product.retailer}
                        </Badge>
                      )}
                      {product.is_recalled && (
                        <Badge variant="destructive" className="text-xs">
                          {t("Recall", "리콜")}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recalls */}
          {result.recalls.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="py-3">
                <CardTitle className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {t(`Recall History (${result.recalls.length})`, `리콜 이력 (${result.recalls.length}건)`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.recalls.map((recall, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950 text-sm"
                  >
                    <div className="font-medium">{recall.product}</div>
                    <div className="text-xs text-muted-foreground">
                      {recall.reason} ({recall.date})
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.total_similar === 0 && (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <p>{t("No similar products found.", "유사 제품을 찾지 못했습니다.")}</p>
                <p className="text-sm mt-1">
                  {t(
                    "This product may be new to the Canadian market.",
                    "이 제품은 캐나다 시장에서 새로운 제품일 수 있습니다.",
                  )}
                </p>
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    isEn
                      ? `What is the process for importing ${productName} to Canada for the first time?`
                      : `${productName}을(를) 캐나다에 처음 수입할 때 필요한 절차는?`,
                  )}`}
                  className="mt-3 inline-block"
                >
                  <Button variant="outline" size="sm">
                    {t("Learn Import Procedures", "수입 절차 알아보기")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
