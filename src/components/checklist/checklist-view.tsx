"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCopy, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { ChecklistResult } from "@/lib/checklist/generator";

const ACTIVITY_TYPES = [
  { value: "import", label_en: "Import", label_ko: "수입" },
  { value: "production", label_en: "Production", label_ko: "생산" },
  { value: "labeling", label_en: "Labelling", label_ko: "라벨링" },
  { value: "general", label_en: "General", label_ko: "일반" },
] as const;

const PRODUCT_CATEGORIES = [
  { value: "processed_food", label_en: "Processed Food", label_ko: "가공식품" },
  { value: "fermented_food", label_en: "Fermented Food", label_ko: "발효식품 (김치, 장류)" },
  { value: "beverages", label_en: "Beverages", label_ko: "음료" },
  { value: "health_food", label_en: "Health Food", label_ko: "건강식품" },
  { value: "frozen_food", label_en: "Frozen Food", label_ko: "냉동식품" },
  { value: "snacks", label_en: "Snacks", label_ko: "과자/스낵" },
  { value: "seafood", label_en: "Seafood", label_ko: "수산물" },
  { value: "dairy", label_en: "Dairy", label_ko: "유제품" },
] as const;

function buildStorageKey(activity: string, category: string): string {
  return `cfc-checklist-${activity}-${category}`;
}

interface SavedChecklistState {
  readonly checklist: ChecklistResult;
  readonly completedItems: readonly number[];
  readonly savedAt: string;
}

export function ChecklistView() {
  const { language, t } = useLanguage();
  const [activityType, setActivityType] = useState<string>("import");
  const [productCategory, setProductCategory] =
    useState<string>("processed_food");
  const [checklist, setChecklist] = useState<ChecklistResult | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuthError, authDialog } = useAuthGuard();

  // Load saved state when activity/category changes
  useEffect(() => {
    try {
      const key = buildStorageKey(activityType, productCategory);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: SavedChecklistState = JSON.parse(saved);
        setChecklist(parsed.checklist);
        setCompletedItems(new Set(parsed.completedItems));
      } else {
        setChecklist(null);
        setCompletedItems(new Set());
      }
    } catch {
      // localStorage unavailable
    }
  }, [activityType, productCategory]);

  // Save state when completedItems or checklist changes
  const saveState = useCallback(() => {
    if (!checklist) return;
    try {
      const key = buildStorageKey(activityType, productCategory);
      const state: SavedChecklistState = {
        checklist,
        completedItems: Array.from(completedItems),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage full
    }
  }, [checklist, completedItems, activityType, productCategory]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  const generateChecklist = async () => {
    setIsLoading(true);
    setError(null);
    setCompletedItems(new Set());

    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_category: productCategory,
          activity_type: activityType,
          origin_country: "KR",
        }),
      });

      if (!response.ok) {
        const authError = checkAuthError(response);
        if (authError) throw new Error(authError);
        if (response.status === 429) {
          throw new Error(t(
            "Too many requests. Please try again shortly.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ));
        }
        throw new Error(t(
          "Failed to generate checklist.",
          "체크리스트 생성에 실패했습니다.",
        ));
      }

      const data = await response.json();
      setChecklist(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t(
              "An error occurred while generating the checklist. Please try again.",
              "체크리스트 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
            );
      setError(message);
      console.error("Checklist error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (order: number) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  const resetProgress = () => {
    setCompletedItems(new Set());
  };

  const isEn = language === "en";

  const exportChecklist = async () => {
    if (!checklist) return;

    const lines: string[] = [
      `=== ${checklist.template_name} ===`,
      `${isEn ? "Date" : "생성일"}: ${new Date().toLocaleDateString(isEn ? "en-US" : "ko-KR")}`,
      `${isEn ? "Progress" : "진행률"}: ${completedItems.size}/${checklist.items.length}`,
      `${isEn ? "Status" : "상태"}: ${checklist.is_verified ? t("Verified", "검증됨") : t("AI Generated", "AI 생성")}`,
      "",
      `--- ${t("Checklist", "체크리스트")} ---`,
      "",
    ];

    for (const item of checklist.items) {
      const status = completedItems.has(item.order) ? "[x]" : "[ ]";
      const mandatory = item.is_mandatory ? (isEn ? "(Required)" : "(필수)") : "";
      const text = isEn ? item.requirement_en : (item.requirement_ko || item.requirement_en);
      lines.push(`${status} ${item.order}. ${text} ${mandatory}`);
      if (item.regulation_reference) {
        lines.push(`   ${t("Legal basis", "법적 근거")}: ${item.regulation_reference}`);
      }
      if (item.verification_method) {
        lines.push(`   ${t("Verification method", "확인 방법")}: ${item.verification_method}`);
      }
      lines.push("");
    }

    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: create download
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checklist-${activityType}-${productCategory}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const progress = checklist && checklist.items.length > 0
    ? (completedItems.size / checklist.items.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Generate Compliance Checklist", "컴플라이언스 체크리스트 생성")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              "Select a product category and activity type to generate a regulatory compliance checklist.",
              "제품 카테고리와 활동 유형을 선택하면 해당 규제 요건의 체크리스트를 생성합니다.",
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("Activity Type", "활동 유형")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACTIVITY_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={
                    activityType === type.value ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => setActivityType(type.value)}
                >
                  {t(type.label_en, type.label_ko)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("Product Category", "제품 카테고리")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRODUCT_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={
                    productCategory === cat.value ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => setProductCategory(cat.value)}
                >
                  {t(cat.label_en, cat.label_ko)}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={generateChecklist} disabled={isLoading}>
            {isLoading
              ? t("Generating...", "생성 중...")
              : t("Generate Checklist", "체크리스트 생성")}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <span className="flex-shrink-0">&#9888;</span>
            {error}
          </CardContent>
        </Card>
      )}

      {/* Checklist Display */}
      {checklist && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">
                {checklist.template_name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {checklist.is_verified ? (
                  <Badge className="bg-green-600">{t("Verified", "검증됨")}</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-400"
                  >
                    {t("AI Generated (review needed)", "AI 생성 (검토 필요)")}
                  </Badge>
                )}
                <Badge variant="outline">
                  {completedItems.size}/{checklist.items.length} {t("done", "완료")}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="mt-2" />
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={resetProgress}>
                <RotateCcw className="size-3 mr-1" />
                {t("Reset Progress", "진행률 초기화")}
              </Button>
              <Button variant="outline" size="sm" onClick={exportChecklist}>
                {copied ? (
                  <>{t("Copied!", "복사됨!")}</>
                ) : (
                  <>
                    <ClipboardCopy className="size-3 mr-1" />
                    {t("Export Checklist", "체크리스트 내보내기")}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.items.map((item) => (
              <div
                key={item.order}
                className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                  completedItems.has(item.order)
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-background border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedItems.has(item.order)}
                  onChange={() => toggleItem(item.order)}
                  className="mt-1 h-4 w-4 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={`text-sm ${
                          completedItems.has(item.order)
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {isEn ? item.requirement_en : (item.requirement_ko || item.requirement_en)}
                      </p>
                      {!isEn && item.requirement_ko && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.requirement_en}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">
                          {t("Required", "필수")}
                        </Badge>
                      )}
                      {item.regulation_reference && (
                        <Badge variant="outline" className="text-xs">
                          {item.regulation_reference}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.verification_method && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("Verification method", "확인 방법")}: {item.verification_method}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {authDialog}
    </div>
  );
}
