"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";

interface OnboardingDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onComplete: () => void;
}

const FOOD_TYPES = [
  { value: "packaged_food", label_en: "Packaged Food", label_ko: "포장식품" },
  { value: "beverage", label_en: "Beverage", label_ko: "음료" },
  { value: "supplement_nhp", label_en: "Supplement / NHP", label_ko: "건강기능식품 / NHP" },
  { value: "fresh_produce", label_en: "Fresh Produce", label_ko: "신선식품" },
  { value: "frozen_food", label_en: "Frozen Food", label_ko: "냉동식품" },
  { value: "dairy", label_en: "Dairy", label_ko: "유제품" },
  { value: "snack_confection", label_en: "Snack / Confection", label_ko: "스낵 / 제과" },
  { value: "sauce_condiment", label_en: "Sauce / Condiment", label_ko: "소스 / 조미료" },
  { value: "other", label_en: "Other", label_ko: "기타" },
] as const;

export function OnboardingDialog({ open, onOpenChange, onComplete }: OnboardingDialogProps) {
  const { t } = useLanguage();
  const [businessName, setBusinessName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim() || undefined,
          food_type: foodType || undefined,
          website_url: websiteUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      onComplete();
      onOpenChange(false);
    } catch {
      setError(
        t(
          "Something went wrong. Please try again.",
          "문제가 발생했습니다. 다시 시도해주세요.",
        ) as string,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Save empty profile to mark onboarding as done
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // Continue even if save fails
    } finally {
      setLoading(false);
      onComplete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Welcome to ClearBite! 🍁", "ClearBite에 오신 걸 환영합니다! 🍁")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Tell us a bit about your business so we can better help you.",
              "비즈니스에 대해 간단히 알려주시면 더 나은 도움을 드릴 수 있습니다.",
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="onb-brand">
              {t("Brand / Business Name", "브랜드 / 사업체명")}
            </label>
            <Input
              id="onb-brand"
              placeholder={t("e.g. Maple Fresh Foods", "예: 메이플 프레시 푸드") as string}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              autoComplete="organization"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="onb-food-type">
              {t("Food Category", "식품 종류")}
            </label>
            <select
              id="onb-food-type"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">
                {t("Select a category...", "카테고리 선택...")}
              </option>
              {FOOD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {t(ft.label_en, ft.label_ko)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="onb-website">
              {t("Website (optional)", "웹사이트 (선택사항)")}
            </label>
            <Input
              id="onb-website"
              type="url"
              placeholder="https://"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              autoComplete="url"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={handleSkip}
              disabled={loading}
            >
              {t("Skip for now", "나중에 하기")}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? t("Saving...", "저장 중...")
                : t("Get Started", "시작하기")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
