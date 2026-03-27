"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ClipboardCheck,
  Camera,
  Scale,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Building2,
  Apple,
  Leaf,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const FEATURES = [
  {
    title_en: "Q&A Chat",
    title_ko: "Q&A 상담",
    desc_en: "Ask questions about Canadian food regulations. Get answers based on actual legislation.",
    desc_ko: "캐나다 식품 규제에 대해 질문하세요. 실제 법 조항에 기반한 답변을 제공합니다.",
    href: "/chat",
    badge_en: "AI Powered",
    badge_ko: "AI 기반",
    icon: MessageSquare,
    borderColor: "border-l-primary",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    title_en: "Product Label Analysis",
    title_ko: "제품 라벨 분석",
    desc_en: "Upload a foreign food label photo to analyze Canadian import eligibility and regulatory requirements.",
    desc_ko: "외국 식품 라벨 사진을 업로드하면 캐나다 수입 가능성과 규제 요건을 분석합니다.",
    href: "/product-check",
    badge_en: "Vision AI",
    badge_ko: "Vision AI",
    icon: Camera,
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
  },
  {
    title_en: "Compliance Checklist",
    title_ko: "컴플라이언스 체크리스트",
    desc_en: "Generate and manage compliance checklists by product category.",
    desc_ko: "제품 카테고리별 규제 준수 체크리스트를 생성하고 관리합니다.",
    href: "/checklist",
    badge_en: "Custom",
    badge_ko: "맞춤형",
    icon: ClipboardCheck,
    borderColor: "border-l-accent",
    iconBg: "bg-accent/10 text-accent",
  },
] as const;

const STATS = [
  {
    icon: Scale,
    label_en: "15+ Laws Analyzed",
    label_ko: "15+ 법률 분석",
    desc_en: "Canadian food-related legislation",
    desc_ko: "캐나다 식품 관련 법률",
  },
  {
    icon: ShieldCheck,
    label_en: "3-Step Verification",
    label_ko: "3단계 검증",
    desc_en: "Citation check + AI re-verification + confidence",
    desc_ko: "인용 확인 + AI 재검증 + 신뢰도",
  },
  {
    icon: TrendingUp,
    label_en: "Confidence Score",
    label_ko: "신뢰도 평가",
    desc_en: "Automatic answer confidence assessment",
    desc_ko: "답변 신뢰도 자동 평가",
  },
] as const;

const FOOD_REGULATIONS = [
  {
    name: "SFCA",
    full: "Safe Food for Canadians Act",
    desc_en: "Import/export licensing, core requirements",
    desc_ko: "캐나다 안전식품법 - 수입/수출 라이선스, 기본 요건",
  },
  {
    name: "SFCR",
    full: "Safe Food for Canadians Regulations",
    desc_en: "PCP, traceability, detailed labelling",
    desc_ko: "안전식품 규정 - PCP, 추적성, 라벨링 상세",
  },
  {
    name: "FDA",
    full: "Food and Drugs Act",
    desc_en: "Safety standards, advertising regulations",
    desc_ko: "식품의약품법 - 안전 기준, 광고 규제",
  },
  {
    name: "FDR",
    full: "Food and Drug Regulations",
    desc_en: "Nutrition facts, allergens, additives",
    desc_ko: "식품의약품 규정 - 영양성분표, 알레르겐, 첨가물",
  },
  {
    name: "CPLA",
    full: "Consumer Packaging and Labelling Act",
    desc_en: "Bilingual labelling (EN/FR), net weight",
    desc_ko: "소비자 포장법 - 이중 언어(영/불), 순중량",
  },
  {
    name: "CTA",
    full: "Customs Tariff Act",
    desc_en: "HS code classification, tariff rates, FTA preferences",
    desc_ko: "관세법 - HS 코드 분류, 관세율, FTA 특혜 관세",
  },
] as const;

const NHP_REGULATIONS = [
  {
    name: "NHPR",
    full: "Natural Health Products Regulations (SOR/2003-196)",
    desc_en: "NPN licensing, site licensing, GMP, labelling",
    desc_ko: "천연건강제품 규정 - NPN 허가, 사이트 라이선스, GMP, 라벨링",
  },
  {
    name: "GMP",
    full: "NHP GMP Guide (GUI-0158)",
    desc_en: "Manufacturing standards, quality control, stability testing",
    desc_ko: "NHP 제조기준 - 제조 표준, 품질 관리, 안정성 시험",
  },
  {
    name: "NHPL",
    full: "NHP Labelling Guidance",
    desc_en: "Product Facts table, dosage, cautions, claims",
    desc_ko: "NHP 라벨링 가이드 - Product Facts 표, 용량, 주의사항, 효능 표시",
  },
  {
    name: "Monographs",
    full: "Compendium of Monographs",
    desc_en: "Pre-approved ingredients, claims, dosage ranges",
    desc_ko: "모노그래프 - 사전 승인 원료, 효능 표시, 용량 범위",
  },
  {
    name: "FNHP",
    full: "Food–NHP Classification Guidance",
    desc_en: "Boundary products, therapeutic claims, domain rules",
    desc_ko: "식품-NHP 분류 기준 - 경계 제품, 치료적 표현, 도메인 규칙",
  },
] as const;

const FOOD_AGENCIES = [
  {
    acronym: "CFIA",
    name_en: "Canadian Food Inspection Agency",
    name_ko: "캐나다 식품검사청",
    role_en: "Food safety, licensing, import inspections",
    role_ko: "식품 안전, 라이선스, 수입 검사",
  },
  {
    acronym: "HC",
    name_en: "Health Canada",
    name_ko: "캐나다 보건부",
    role_en: "Safety standards, additive approvals, nutrition labelling",
    role_ko: "안전 기준, 첨가물 승인, 영양 표시",
  },
  {
    acronym: "CBSA",
    name_en: "Canada Border Services Agency",
    name_ko: "캐나다 국경서비스청",
    role_en: "Customs, tariffs, import inspections",
    role_ko: "통관, 관세, 수입 검사",
  },
] as const;

const NHP_AGENCIES = [
  {
    acronym: "NNHPD",
    name_en: "Natural & Non-prescription Health Products Directorate",
    name_ko: "천연·비처방 건강제품국",
    role_en: "NPN licensing, monograph reviews, product classification",
    role_ko: "NPN 허가, 모노그래프 심사, 제품 분류",
  },
  {
    acronym: "HPFBI",
    name_en: "Health Products & Food Branch Inspectorate",
    name_ko: "건강제품·식품 감사국",
    role_en: "GMP inspections, site licensing, enforcement",
    role_ko: "GMP 검사, 사이트 라이선스, 집행·시정",
  },
  {
    acronym: "MHPD",
    name_en: "Marketed Health Products Directorate",
    name_ko: "시판 건강제품국",
    role_en: "Adverse reaction monitoring, post-market surveillance",
    role_ko: "부작용 모니터링, 시판 후 감시",
  },
] as const;

export default function DashboardPage() {
  const { t } = useLanguage();
  const [regTab, setRegTab] = useState<"food" | "nhp">("food");

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-blue-400 px-6 py-14 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
        <div className="relative text-center space-y-5 max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-black tracking-wider leading-tight">
            <span className="text-white">OH</span>
            <span className="text-blue-200">MAZE</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t(
              <>Navigate food compliance with clarity — guided by <strong className="text-white">actual legislation</strong>.</>,
              <>식품 규제를 명확하게 — <strong className="text-white">실제 법 조항</strong>에 기반한 규제 안내.</>,
            )}
          </p>
          <div className="pt-2">
            <Link href="/chat">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold px-6 h-11 text-base font-[family-name:var(--font-display)]">
                {t("Start Consultation", "상담 시작하기")}
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label_en}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2.5">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{t(stat.label_en, stat.label_ko)}</p>
                <p className="text-xs text-muted-foreground">{t(stat.desc_en, stat.desc_ko)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className={`h-full hover:shadow-lg transition-all cursor-pointer border-l-4 ${feature.borderColor}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${feature.iconBg}`}>
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t(feature.badge_en, feature.badge_ko)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{t(feature.title_en, feature.title_ko)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.desc_en, feature.desc_ko)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 3-Step Verification Explanation */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/50">
          <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-display)]">
            <ShieldCheck className="size-5 text-primary" />
            {t("3-Step Verification System", "3단계 검증 시스템")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2 font-[family-name:var(--font-display)]">{t("Legislation-Based Answers", "법적 근거 기반 답변")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "Uses RAG search to find relevant legal provisions and cites actual legislation. Provides specific section numbers and URLs, not general advice.",
                  "RAG 검색으로 관련 법 조항을 찾고, 실제 법문을 인용하여 답변합니다. 일반적인 조언이 아닌 구체적인 법 조항 번호와 URL을 제공합니다.",
                )}
              </p>
            </div>
            <div className="text-center p-5 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white text-lg font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2 font-[family-name:var(--font-display)]">{t("AI Re-Verification", "AI 재검증")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "After generating an answer, a separate AI verifier cross-checks the cited provisions for accuracy. Detects over-interpretation or missing regulations.",
                  "답변 생성 후, 별도의 AI 검증자가 인용된 법 조항과 답변의 정확성을 교차 검증합니다. 과대 해석이나 누락된 규제를 탐지합니다.",
                )}
              </p>
            </div>
            <div className="text-center p-5 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white text-lg font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2 font-[family-name:var(--font-display)]">{t("Confidence Score", "신뢰도 평가")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "Combines verification results to rate answer confidence as HIGH/MEDIUM/LOW. Low-confidence answers are flagged with a warning.",
                  "검증 결과를 종합하여 답변의 신뢰도를 HIGH/MEDIUM/LOW로 평가합니다. 신뢰도가 낮은 답변에는 주의 표시를 합니다.",
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Regulations & Agencies */}
      <div className="space-y-4">
        {/* Domain Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setRegTab("food")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              regTab === "food"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Apple className="size-4" />
            {t("Food", "식품")}
          </button>
          <button
            onClick={() => setRegTab("nhp")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              regTab === "nhp"
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Leaf className="size-4" />
            {t("NHP", "NHP (천연건강제품)")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className={`size-4 ${regTab === "food" ? "text-primary" : "text-accent"}`} />
                {regTab === "food"
                  ? t("Food Laws & Regulations", "식품 법률 및 규정")
                  : t("NHP Laws & Regulations", "NHP 법률 및 규정")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(regTab === "food" ? FOOD_REGULATIONS : NHP_REGULATIONS).map((reg) => (
                <div key={reg.name} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className={`mt-0.5 whitespace-nowrap ${regTab === "nhp" ? "border-accent/50 text-accent" : ""}`}>
                    {reg.name}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{t(reg.desc_en, reg.desc_ko)}</p>
                    <p className="text-xs text-muted-foreground">{reg.full}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className={`size-4 ${regTab === "food" ? "text-primary" : "text-accent"}`} />
                {regTab === "food"
                  ? t("Food Regulatory Agencies", "식품 규제 기관")
                  : t("NHP Regulatory Agencies", "NHP 규제 기관")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(regTab === "food" ? FOOD_AGENCIES : NHP_AGENCIES).map((agency) => (
                <div key={agency.acronym} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className={`mt-0.5 whitespace-nowrap ${regTab === "nhp" ? "border-accent/50 text-accent" : ""}`}>
                    {agency.acronym}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{t(agency.name_en, agency.name_ko)}</p>
                    <p className="text-xs text-muted-foreground">{t(agency.role_en, agency.role_ko)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
