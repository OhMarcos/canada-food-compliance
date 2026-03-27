"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { ComplianceReport, ComplianceItem } from "@/types/product-check";

interface ComplianceReportCardProps {
  readonly report: ComplianceReport;
}

const FEASIBILITY_CONFIG = {
  likely: {
    label_en: "Import Likely Feasible",
    label_ko: "수입 가능성 높음",
    className: "bg-accent/10 text-accent border-accent/30",
  },
  conditional: {
    label_en: "Conditional — Action Required",
    label_ko: "조건부 — 조치 필요",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  unlikely: {
    label_en: "Import Unlikely",
    label_ko: "수입 가능성 낮음",
    className: "bg-red-100 text-red-800 border-red-300",
  },
} as const;

const STATUS_ICON = {
  pass: <CheckCircle2 className="size-4 text-accent flex-shrink-0" />,
  fail: <XCircle className="size-4 text-red-600 flex-shrink-0" />,
  needs_action: <AlertTriangle className="size-4 text-yellow-600 flex-shrink-0" />,
  unknown: <HelpCircle className="size-4 text-muted-foreground flex-shrink-0" />,
} as const;

const CATEGORY_LABELS: Record<ComplianceItem["category"], { en: string; ko: string }> = {
  licensing: { en: "Import Licensing", ko: "수입 라이선스" },
  labelling: { en: "Labelling", ko: "라벨링" },
  allergens: { en: "Allergens", ko: "알레르겐" },
  additives: { en: "Food Additives", ko: "식품 첨가물" },
  nutrition: { en: "Nutrition Facts", ko: "영양성분" },
  safety: { en: "Product Safety", ko: "제품 안전" },
  packaging: { en: "Packaging", ko: "포장" },
  claims: { en: "Health Claims", ko: "건강 표시" },
  certification: { en: "Certifications", ko: "인증" },
  other: { en: "Other", ko: "기타" },
};

export function ComplianceReportCard({ report }: ComplianceReportCardProps) {
  const { t } = useLanguage();
  const feasibilityConfig = FEASIBILITY_CONFIG[report.feasibility];

  // Group items by category
  const grouped = report.items.reduce<Record<string, readonly ComplianceItem[]>>(
    (acc, item) => ({
      ...acc,
      [item.category]: [...(acc[item.category] ?? []), item],
    }),
    {},
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t("Compliance Assessment", "컴플라이언스 평가")}
          </CardTitle>
          <Badge className={feasibilityConfig.className}>
            {t(feasibilityConfig.label_en, feasibilityConfig.label_ko)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{report.summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => {
          const labels = CATEGORY_LABELS[category as ComplianceItem["category"]];
          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {labels ? t(labels.en, labels.ko) : category}
              </h4>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  {STATUS_ICON[item.status]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.requirement}</span>
                      {item.regulation_reference && (
                        <span className="text-xs text-muted-foreground">
                          [{item.regulation_reference}]
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                    {item.action_required && (
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 font-medium">
                        {t("Action", "조치")}: {item.action_required}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
