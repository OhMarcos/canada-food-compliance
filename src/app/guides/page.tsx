"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Scale,
  DollarSign,
  Store,
  Ship,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const GUIDES = [
  {
    href: "/guides/product-launch",
    icon: Rocket,
    title_en: "How to Launch a Food Product",
    title_ko: "식품 제품 런칭 전략",
    desc_en:
      "Three proven approaches to launching a food product in Canada — product-first, consumer-insight-first, and data-driven. Includes success rates and capital requirements.",
    desc_ko:
      "캐나다에서 식품 제품을 런칭하는 3가지 검증된 접근법 — 제품 우선, 소비자 인사이트 우선, 데이터 기반. 성공률과 자본 요건 포함.",
    badge: "Strategy",
    readTime: "12 min",
    borderColor: "border-l-primary",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    href: "/guides/regulations",
    icon: Scale,
    title_en: "Food Regulations: Small Scale → Large Scale",
    title_ko: "식품 규제: 소규모 → 대규모",
    desc_en:
      "What you actually need at each stage — from kitchen-based startups to national distribution. CFIA licensing, provincial permits, and preventive controls.",
    desc_ko:
      "각 단계에서 실제로 필요한 것 — 주방 기반 스타트업부터 전국 유통까지. CFIA 라이선스, 주정부 허가, 예방 통제.",
    badge: "Compliance",
    readTime: "15 min",
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
  },
  {
    href: "/guides/margins",
    icon: DollarSign,
    title_en: "Margin Structure & Pricing",
    title_ko: "마진 구조 & 가격 전략",
    desc_en:
      "The real numbers behind food pricing in Canada. Distributor, broker, and retailer margins — plus the 4x COGS rule and hidden costs most founders miss.",
    desc_ko:
      "캐나다 식품 가격의 실제 숫자. 유통업체, 브로커, 소매업체 마진 — 4x 원가 법칙과 대부분의 창업자가 놓치는 숨겨진 비용.",
    badge: "Finance",
    readTime: "10 min",
    borderColor: "border-l-green-500",
    iconBg: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
  },
  {
    href: "/guides/retail-landscape",
    icon: Store,
    title_en: "Canadian Retail Grocery Landscape",
    title_ko: "캐나다 식품 소매 시장 분석",
    desc_en:
      "Market share data, store counts, and retailer profiles for 2026. Loblaw, Sobeys, Metro, Costco — who controls what, and how to get on their shelves.",
    desc_ko:
      "2026년 시장 점유율 데이터, 매장 수, 유통사 프로필. Loblaw, Sobeys, Metro, Costco — 누가 무엇을 지배하고, 어떻게 입점하는지.",
    badge: "Market Research",
    readTime: "12 min",
    borderColor: "border-l-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300",
  },
  {
    href: "/guides/import",
    icon: Ship,
    title_en: "Importing Food Products to Canada",
    title_ko: "캐나다 식품 수입 가이드",
    desc_en:
      "CBSA customs, CFIA import licensing, tariff classification, labelling requirements, and border inspection — step by step.",
    desc_ko:
      "CBSA 통관, CFIA 수입 라이선스, 관세 분류, 라벨링 요건, 국경 검사 — 단계별 가이드.",
    badge: "Import/Export",
    readTime: "14 min",
    borderColor: "border-l-sky-500",
    iconBg: "bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300",
  },
] as const;

export default function GuidesPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black tracking-tight">
          {t("Food Business Guides", "식품 비즈니스 가이드")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {t(
            "Practical, data-backed guides for launching and scaling a food business in Canada. Based on real industry data, regulatory research, and operator experience.",
            "캐나다에서 식품 비즈니스를 시작하고 성장시키기 위한 실용적, 데이터 기반 가이드. 실제 업계 데이터, 규제 리서치, 운영 경험에 기반.",
          )}
        </p>
      </div>

      {/* Guide Cards */}
      <div className="space-y-4">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <Link key={guide.href} href={guide.href}>
              <Card className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${guide.borderColor} mb-4`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${guide.iconBg}`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg leading-snug">
                          {t(guide.title_en, guide.title_ko)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {guide.badge}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-15">
                    {t(guide.desc_en, guide.desc_ko)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Data Sources Note */}
      <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">
          {t("About Our Research", "리서치 소개")}
        </p>
        <p className="leading-relaxed">
          {t(
            "These guides combine data from Statistics Canada, CFIA, Agriculture and Agri-Food Canada, IBISWorld, and Statista with practical insights from CPG operators. All regulatory information is cross-referenced with primary legislation.",
            "이 가이드는 Statistics Canada, CFIA, Agriculture and Agri-Food Canada, IBISWorld, Statista의 데이터와 CPG 운영자의 실무 인사이트를 결합합니다. 모든 규제 정보는 1차 법률과 교차 검증됩니다.",
          )}
        </p>
      </div>
    </div>
  );
}
