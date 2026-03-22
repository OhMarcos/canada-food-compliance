"use client";

import { ChecklistView } from "@/components/checklist/checklist-view";
import { useLanguage } from "@/hooks/use-language";

export default function ChecklistPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {t("Compliance Checklist", "컴플라이언스 체크리스트")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Generate and manage compliance checklists by product category.",
            "제품 카테고리별 규제 준수 체크리스트를 생성하고 관리합니다.",
          )}
        </p>
      </div>
      <ChecklistView />
    </div>
  );
}
