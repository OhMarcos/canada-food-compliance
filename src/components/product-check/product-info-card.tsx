"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import type { ExtractedProductInfo } from "@/types/product-check";

interface ProductInfoCardProps {
  readonly info: ExtractedProductInfo;
}

export function ProductInfoCard({ info }: ProductInfoCardProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {t("Product Information", "제품 정보")}
          <Badge variant="secondary" className="text-xs">
            {info.original_language.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow label={t("Product Name", "제품명")} value={info.product_name_translated} />
          <InfoRow label={t("Original Name", "원래 이름")} value={info.product_name} />
          <InfoRow label={t("Category", "카테고리")} value={info.product_category} />
          <InfoRow label={t("Manufacturer", "제조사")} value={info.manufacturer} />
          <InfoRow label={t("Origin Country", "원산지")} value={info.origin_country} />
          <InfoRow label={t("Net Weight", "순중량")} value={info.net_weight} />
        </div>

        {/* Ingredients */}
        {info.ingredients_translated.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">
              {t("Ingredients (Translated)", "성분 (번역)")}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {info.ingredients_translated.join(", ")}
            </p>
          </div>
        )}

        {/* Allergens */}
        {info.allergens.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">
              {t("Allergens", "알레르겐")}
            </h4>
            <div className="flex flex-wrap gap-1">
              {info.allergens.map((a) => (
                <Badge key={a} variant="destructive" className="text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Facts */}
        {info.nutrition_facts && (
          <div>
            <h4 className="text-sm font-semibold mb-1">
              {t("Nutrition Facts", "영양성분")}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {info.nutrition_facts.serving_size && (
                <NutrientRow label={t("Serving Size", "1회 제공량")} value={info.nutrition_facts.serving_size} />
              )}
              {info.nutrition_facts.calories && (
                <NutrientRow label={t("Calories", "칼로리")} value={info.nutrition_facts.calories} />
              )}
              {info.nutrition_facts.total_fat && (
                <NutrientRow label={t("Total Fat", "총 지방")} value={info.nutrition_facts.total_fat} />
              )}
              {info.nutrition_facts.sodium && (
                <NutrientRow label={t("Sodium", "나트륨")} value={info.nutrition_facts.sodium} />
              )}
              {info.nutrition_facts.total_carbohydrate && (
                <NutrientRow label={t("Carbs", "탄수화물")} value={info.nutrition_facts.total_carbohydrate} />
              )}
              {info.nutrition_facts.protein && (
                <NutrientRow label={t("Protein", "단백질")} value={info.nutrition_facts.protein} />
              )}
            </div>
          </div>
        )}

        {/* Claims & Certifications */}
        {(info.health_claims.length > 0 || info.certifications.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold mb-1">
              {t("Claims & Certifications", "인증 및 표시")}
            </h4>
            <div className="flex flex-wrap gap-1">
              {info.certifications.map((c) => (
                <Badge key={c} variant="outline" className="text-xs">
                  {c}
                </Badge>
              ))}
              {info.health_claims.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { readonly label: string; readonly value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function NutrientRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="bg-muted/50 rounded px-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
