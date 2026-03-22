"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExtractedProductInfo } from "@/types/product-check";

interface ProductInfoCardProps {
  readonly info: ExtractedProductInfo;
}

export function ProductInfoCard({ info }: ProductInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Product Information
          <Badge variant="secondary" className="text-xs">
            {info.original_language.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow label="Product Name" value={info.product_name_translated} />
          <InfoRow label="Original Name" value={info.product_name} />
          <InfoRow label="Category" value={info.product_category} />
          <InfoRow label="Manufacturer" value={info.manufacturer} />
          <InfoRow label="Origin Country" value={info.origin_country} />
          <InfoRow label="Net Weight" value={info.net_weight} />
        </div>

        {/* Ingredients */}
        {info.ingredients_translated.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Ingredients (Translated)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {info.ingredients_translated.join(", ")}
            </p>
          </div>
        )}

        {/* Allergens */}
        {info.allergens.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Allergens</h4>
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
            <h4 className="text-sm font-semibold mb-1">Nutrition Facts</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {info.nutrition_facts.serving_size && (
                <NutrientRow label="Serving Size" value={info.nutrition_facts.serving_size} />
              )}
              {info.nutrition_facts.calories && (
                <NutrientRow label="Calories" value={info.nutrition_facts.calories} />
              )}
              {info.nutrition_facts.total_fat && (
                <NutrientRow label="Total Fat" value={info.nutrition_facts.total_fat} />
              )}
              {info.nutrition_facts.sodium && (
                <NutrientRow label="Sodium" value={info.nutrition_facts.sodium} />
              )}
              {info.nutrition_facts.total_carbohydrate && (
                <NutrientRow label="Carbs" value={info.nutrition_facts.total_carbohydrate} />
              )}
              {info.nutrition_facts.protein && (
                <NutrientRow label="Protein" value={info.nutrition_facts.protein} />
              )}
            </div>
          </div>
        )}

        {/* Claims & Certifications */}
        {(info.health_claims.length > 0 || info.certifications.length > 0) && (
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
