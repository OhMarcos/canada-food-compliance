"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComplianceReport } from "@/types/product-check";

interface ActionChecklistProps {
  readonly report: ComplianceReport;
  readonly regulationRefs: readonly {
    readonly regulation_name: string;
    readonly section_number: string;
    readonly official_url: string;
  }[];
}

const PRIORITY_CONFIG = {
  high: { label: "HIGH", className: "bg-red-100 text-red-800 border-red-300" },
  medium: { label: "MED", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  low: { label: "LOW", className: "bg-blue-100 text-blue-800 border-blue-300" },
} as const;

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function ActionChecklist({ report, regulationRefs }: ActionChecklistProps) {
  if (report.action_items.length === 0) return null;

  const sorted = [...report.action_items].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sorted.map((item, i) => {
              const priorityConfig = PRIORITY_CONFIG[item.priority];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <Badge className={`text-xs ${priorityConfig.className}`}>
                    {priorityConfig.label}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{item.action}</p>
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referenced Regulations */}
      {regulationRefs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referenced Regulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {regulationRefs.map((ref, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {ref.section_number}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {ref.regulation_name}
                  </span>
                  {ref.official_url && isSafeUrl(ref.official_url) && (
                    <a
                      href={ref.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex-shrink-0"
                    >
                      Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
