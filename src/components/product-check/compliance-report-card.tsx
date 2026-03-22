"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import type { ComplianceReport, ComplianceItem } from "@/types/product-check";

interface ComplianceReportCardProps {
  readonly report: ComplianceReport;
}

const FEASIBILITY_CONFIG = {
  likely: { label: "Import Likely Feasible", variant: "default" as const, className: "bg-green-100 text-green-800 border-green-300" },
  conditional: { label: "Conditional — Action Required", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  unlikely: { label: "Import Unlikely", variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-300" },
} as const;

const STATUS_ICON = {
  pass: <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />,
  fail: <XCircle className="size-4 text-red-600 flex-shrink-0" />,
  needs_action: <AlertTriangle className="size-4 text-yellow-600 flex-shrink-0" />,
  unknown: <HelpCircle className="size-4 text-muted-foreground flex-shrink-0" />,
} as const;

const CATEGORY_LABELS: Record<ComplianceItem["category"], string> = {
  licensing: "Import Licensing",
  labelling: "Labelling",
  allergens: "Allergens",
  additives: "Food Additives",
  nutrition: "Nutrition Facts",
  safety: "Product Safety",
  packaging: "Packaging",
  claims: "Health Claims",
  certification: "Certifications",
  other: "Other",
};

export function ComplianceReportCard({ report }: ComplianceReportCardProps) {
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
          <CardTitle className="text-lg">Compliance Assessment</CardTitle>
          <Badge className={feasibilityConfig.className}>
            {feasibilityConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{report.summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {CATEGORY_LABELS[category as ComplianceItem["category"]] ?? category}
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
                      Action: {item.action_required}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
