"use client";

import { RegulationList } from "@/components/regulations/regulation-list";
import { useLanguage } from "@/hooks/use-language";

export default function RegulationsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("Regulation Browser", "규제 브라우저")}</h1>
        <p className="text-muted-foreground">
          {t(
            "Search and browse Canadian food-related laws, regulations, and guidelines.",
            "캐나다 식품 관련 법률, 규정, 가이드라인을 검색하고 열람합니다.",
          )}
        </p>
      </div>
      <RegulationList />
    </div>
  );
}
