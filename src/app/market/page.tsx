"use client";

import { ProductSearch } from "@/components/market/product-search";
import { useLanguage } from "@/hooks/use-language";

export default function MarketPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("Market Cross-Check", "시장 크로스체크")}</h1>
        <p className="text-muted-foreground">
          {t(
            "Check if similar food products are already sold in the Canadian market.",
            "캐나다 시장에서 유사한 식품이 이미 판매되고 있는지 확인합니다.",
          )}
        </p>
      </div>
      <ProductSearch />
    </div>
  );
}
