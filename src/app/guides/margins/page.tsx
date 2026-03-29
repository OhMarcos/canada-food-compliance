"use client";

import { GuideArticle } from "@/components/guides/guide-article";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { Callout } from "@/components/guides/callout";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";

const TOC_ITEMS = [
  { id: "margin-stack", label_en: "The Margin Stack", label_ko: "마진 스택" },
  { id: "distributor", label_en: "Distributor Margins (20-30%)", label_ko: "유통업체 마진 (20-30%)" },
  { id: "retailer", label_en: "Retailer Margins (35-40%)", label_ko: "소매업체 마진 (35-40%)" },
  { id: "broker", label_en: "Broker Commissions (5-10%)", label_ko: "브로커 수수료 (5-10%)" },
  { id: "4x-rule", label_en: "The 4x COGS Rule", label_ko: "4x 원가 법칙" },
  { id: "hidden-costs", label_en: "Hidden Costs Most Founders Miss", label_ko: "대부분의 창업자가 놓치는 숨겨진 비용" },
  { id: "walkthrough", label_en: "Pricing Walkthrough: $2 COGS → RSP", label_ko: "가격 산정 예시: $2 원가 → RSP" },
  { id: "strategy", label_en: "Pricing Strategy by Channel", label_ko: "채널별 가격 전략" },
] as const;

export default function MarginsGuidePage() {
  const { t } = useLanguage();

  return (
    <GuideArticle
      title_en="Margin Structure & Pricing for Canadian Food Products"
      title_ko="캐나다 식품 마진 구조 & 가격 전략"
      subtitle_en="The real numbers behind food pricing. Not theory — actual margin ranges from the industry."
      subtitle_ko="식품 가격의 실제 숫자. 이론이 아닌 — 업계의 실제 마진 범위."
      readTime="10 min"
      date="March 2026"
      badges={["Finance", "Pricing", "Canada"]}
    >
      <TableOfContents items={TOC_ITEMS} />

      {/* Margin Stack */}
      <section id="margin-stack">
        <h2>{t("The Margin Stack: Who Takes What", "마진 스택: 누가 얼마를 가져가는가")}</h2>
        <p>
          {t(
            "Between your factory door and the consumer's hand, multiple parties take a cut. Understanding this stack is the difference between a profitable product and an expensive hobby.",
            "공장 문에서 소비자 손까지, 여러 당사자가 몫을 가져갑니다. 이 스택을 이해하는 것이 수익성 있는 제품과 비싼 취미의 차이입니다.",
          )}
        </p>

        <div className="not-prose rounded-xl border bg-muted/30 p-6 my-6 space-y-3">
          <p className="font-semibold text-center">{t("Typical Canadian Food Margin Stack", "캐나다 식품 마진 스택 (일반적)")}</p>
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">{t("Your COGS (Cost of Goods Sold)", "원가 (COGS)")}</span>
              <span className="font-mono font-semibold text-sm">$2.00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">{t("Your selling price (30% margin)", "판매가 (30% 마진)")}</span>
              <span className="font-mono font-semibold text-sm">$2.86</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b text-muted-foreground">
              <span className="text-sm">+ {t("Broker (5%)", "브로커 (5%)")}</span>
              <span className="font-mono text-sm">$0.14</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">{t("Distributor price (25% margin)", "유통가 (25% 마진)")}</span>
              <span className="font-mono font-semibold text-sm">$4.00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b bg-primary/5 px-2 rounded">
              <span className="text-sm font-medium">{t("Retail Selling Price (40% margin)", "소매가 RSP (40% 마진)")}</span>
              <span className="font-mono font-bold text-primary">$6.67</span>
            </div>
            <div className="flex justify-between items-center py-2 text-muted-foreground">
              <span className="text-sm">{t("RSP / COGS ratio", "RSP / 원가 배율")}</span>
              <span className="font-mono font-semibold">3.3x</span>
            </div>
          </div>
        </div>

        <Callout type="warning" title={t("The Math Problem", "수학 문제")}>
          <p>
            {t(
              "At standard margins across the chain, a $2.00 COGS product lands at ~$6.67 RSP — only 3.3x COGS. To hit the 4x rule ($8.00 RSP), you either need higher manufacturer margins, lower COGS, or a premium brand positioning that justifies a higher retail price.",
              "체인 전체의 표준 마진에서, $2.00 원가 제품은 ~$6.67 RSP에 도달합니다 — 원가의 3.3배에 불과. 4x 법칙 ($8.00 RSP)을 달성하려면, 제조 마진을 높이거나, 원가를 낮추거나, 더 높은 소매가를 정당화하는 프리미엄 브랜드 포지셔닝이 필요합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Distributor */}
      <section id="distributor">
        <h2>{t("Distributor Margins: 20-30%", "유통업체 마진: 20-30%")}</h2>
        <p>
          {t(
            "Distributors warehouse, transport, and deliver your product to retailers. Their margin compensates for logistics, warehousing, salesforce, and damaged/expired product handling.",
            "유통업체는 제품을 창고에 보관하고, 운송하고, 소매점에 배달합니다. 그들의 마진은 물류, 창고, 영업 인력, 손상/유통기한 만료 제품 처리에 대한 보상입니다.",
          )}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Distributor Type", "유통업체 유형")}</th>
                <th>{t("Typical Margin", "일반 마진")}</th>
                <th>{t("Notes", "비고")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("National (UNFI, Tree of Life)", "전국 (UNFI, Tree of Life)")}</td>
                <td>25-30%</td>
                <td>{t("Higher margin but national reach. Minimum volume requirements.", "높은 마진이지만 전국 도달. 최소 물량 요건.")}</td>
              </tr>
              <tr>
                <td>{t("Regional", "지역")}</td>
                <td>20-25%</td>
                <td>{t("More flexible terms. Better for early-stage brands.", "더 유연한 조건. 초기 단계 브랜드에 적합.")}</td>
              </tr>
              <tr>
                <td>DSD ({t("Direct Store Delivery", "직접 매장 배달")})</td>
                <td>15-20%</td>
                <td>{t("You deliver directly. Lower margin but more control and speed.", "직접 배달. 낮은 마진이지만 더 많은 통제와 속도.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground italic">
          {t(
            "Sources: Agriculture and Agri-Food Canada, PartnerSlate industry data, Kevin Grier trade practices report.",
            "출처: Agriculture and Agri-Food Canada, PartnerSlate 업계 데이터, Kevin Grier 유통 관행 리포트.",
          )}
        </p>
      </section>

      {/* Retailer */}
      <section id="retailer">
        <h2>{t("Retailer Margins: 35-40%", "소매업체 마진: 35-40%")}</h2>
        <p>
          {t(
            "The retailer's gross margin looks large, but their net profit is tiny — typically 2-4% after operating costs. Canadian grocers like Loblaw, Sobeys, and Metro average about 3.5% net profit margin.",
            "소매업체의 총마진은 커 보이지만, 순이익은 매우 작습니다 — 운영비 후 보통 2-4%. Loblaw, Sobeys, Metro 같은 캐나다 식료품점은 평균 약 3.5% 순이익률.",
          )}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Retailer Type", "소매업체 유형")}</th>
                <th>{t("Gross Margin", "총마진")}</th>
                <th>{t("Notes", "비고")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Major Grocery (Loblaw, Sobeys, Metro)", "대형 식료품 (Loblaw, Sobeys, Metro)")}</td>
                <td>30-40%</td>
                <td>{t("Volume-driven. Private label emphasis growing.", "볼륨 중심. 자체 브랜드 강조 증가.")}</td>
              </tr>
              <tr>
                <td>{t("Discount (No Frills, FreshCo)", "할인점 (No Frills, FreshCo)")}</td>
                <td>25-35%</td>
                <td>{t("Lower margin, higher volume. Price-sensitive customers.", "낮은 마진, 높은 볼륨. 가격 민감 고객.")}</td>
              </tr>
              <tr>
                <td>{t("Premium/Specialty (Whole Foods)", "프리미엄/전문 (Whole Foods)")}</td>
                <td>40-50%</td>
                <td>{t("Higher margin justified by premium positioning.", "프리미엄 포지셔닝으로 높은 마진 정당화.")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Broker */}
      <section id="broker">
        <h2>{t("Broker Commissions: 5-10%", "브로커 수수료: 5-10%")}</h2>
        <p>
          {t(
            "Brokers represent your brand to retailers. They don't buy your product — they sell it on your behalf to retail buyers. Commission is calculated as a percentage of sales to the retailer.",
            "브로커는 소매업체에 브랜드를 대표합니다. 제품을 구매하는 것이 아니라 — 소매 바이어에게 대신 판매합니다. 수수료는 소매업체 판매액의 퍼센트로 계산됩니다.",
          )}
        </p>
        <ul>
          <li><strong>5%</strong> — {t("Standard rate for brands with established velocity and retail presence", "확립된 회전율과 소매 존재감이 있는 브랜드의 표준 요율")}</li>
          <li><strong>7-10%</strong> — {t("New brands, low volume, or when broker provides additional services (trade show support, category management, etc.)", "신규 브랜드, 저물량, 또는 브로커가 추가 서비스 제공 시 (전시회 지원, 카테고리 관리 등)")}</li>
        </ul>

        <Callout type="tip" title={t("Do You Need a Broker?", "브로커가 필요한가?")}>
          <p>
            {t(
              "For major chains (Loblaw, Sobeys, Metro) — yes, almost always. Their category buyers deal primarily through brokers. For independent grocers and specialty stores, you can often sell direct. For a brand new product, expect to pay 7-10% until you prove velocity.",
              "대형 체인(Loblaw, Sobeys, Metro) — 네, 거의 항상. 카테고리 바이어는 주로 브로커를 통해 거래합니다. 독립 식료품점과 전문점에서는 직접 판매 가능한 경우가 많습니다. 새 제품의 경우 회전율을 증명할 때까지 7-10%를 예상하세요.",
            )}
          </p>
        </Callout>
      </section>

      {/* 4x Rule */}
      <section id="4x-rule">
        <h2>{t("The 4x COGS Rule", "4x 원가 법칙")}</h2>
        <p>
          {t(
            "Industry rule of thumb: your Retail Selling Price (RSP) should be at least 4 times your break-even cost (COGS + overhead). This ensures enough margin to cover every layer of the distribution chain and still leave profit for your business.",
            "업계 경험 법칙: 소매 판매가 (RSP)는 손익분기 비용 (원가 + 오버헤드)의 최소 4배여야 합니다. 이는 유통 체인의 모든 계층을 커버하고도 사업에 이윤을 남기기 위함입니다.",
          )}
        </p>
        <div className="not-prose rounded-xl border bg-muted/30 p-6 my-6">
          <p className="text-center font-mono text-lg font-bold">RSP ≥ 4 × COGS</p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {t(
              "If your COGS is $2.00, your RSP should be at least $8.00",
              "원가가 $2.00이면, RSP는 최소 $8.00이어야 함",
            )}
          </p>
        </div>
        <p>
          {t(
            "Products below 4x often can't sustain promotions (which retailers require), absorb listing fees, or survive margin pressure from private label competition. Above 5x gives you breathing room for trade spend.",
            "4x 미만의 제품은 (소매업체가 요구하는) 프로모션을 유지하거나, 입점비를 흡수하거나, 자체 브랜드 경쟁의 마진 압박에서 살아남기 어렵습니다. 5x 이상이면 trade spend에 여유가 생깁니다.",
          )}
        </p>
      </section>

      {/* Hidden Costs */}
      <section id="hidden-costs">
        <h2>{t("Hidden Costs Most Founders Miss", "대부분의 창업자가 놓치는 숨겨진 비용")}</h2>
        <p>
          {t(
            "The margin stack above doesn't include these additional costs that eat into your profit:",
            "위 마진 스택에는 이윤을 갉아먹는 아래 추가 비용이 포함되어 있지 않습니다:",
          )}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Cost", "비용")}</th>
                <th>{t("Typical Range", "일반 범위")}</th>
                <th>{t("What It Is", "설명")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{t("Listing Fee", "입점비")}</strong></td>
                <td>$10K-30K/{t("chain", "체인")}</td>
                <td>{t("One-time fee to get on shelf. Per SKU per chain. Some chains waive for small producers.", "선반에 올라가기 위한 1회 비용. SKU당 체인당. 일부 체인은 소규모 생산자에게 면제.")}</td>
              </tr>
              <tr>
                <td><strong>{t("Free Fill", "무료 제공")}</strong></td>
                <td>1-2 {t("cases/store", "박스/매장")}</td>
                <td>{t("Free initial product to fill the shelf. At 100+ stores, this adds up fast.", "선반 채움을 위한 무료 초기 제품. 100+ 매장에서는 빠르게 누적.")}</td>
              </tr>
              <tr>
                <td><strong>OI ({t("Off-Invoice", "인보이스 할인")})</strong></td>
                <td>5-15%</td>
                <td>{t("Promotional discount applied on invoice. Expected for regular promotional cadence.", "인보이스에 적용되는 프로모션 할인. 정기적 프로모션 주기에 기대됨.")}</td>
              </tr>
              <tr>
                <td><strong>TPR ({t("Temporary Price Reduction", "일시적 가격 인하")})</strong></td>
                <td>{t("Variable", "변동")}</td>
                <td>{t("You fund the sale price for promo periods. Retailer scans at reduced price, you cover the difference.", "프로모 기간의 할인가 부담. 소매업체가 할인가로 스캔, 차액을 부담.")}</td>
              </tr>
              <tr>
                <td><strong>MDF ({t("Marketing Dev Fund", "마케팅 개발 기금")})</strong></td>
                <td>1-3% {t("of sales", "매출 대비")}</td>
                <td>{t("Marketing contributions to retailer programs (flyers, displays, digital).", "소매업체 프로그램(전단지, 진열, 디지털)에 대한 마케팅 기여금.")}</td>
              </tr>
              <tr>
                <td><strong>{t("Spoilage/Damage", "부패/손상")}</strong></td>
                <td>1-3%</td>
                <td>{t("You bear cost for damaged or expired product. Higher for short shelf-life items.", "손상 또는 유통기한 만료 제품의 비용 부담. 유통기한이 짧은 품목일수록 높음.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title={t("The Real Rule", "진짜 법칙")}>
          <p>
            {t(
              "When you add listing fees, promotional allowances, and spoilage, the true cost of getting into — and staying on — a retail shelf is 15-25% on top of the margin stack. Budget your first-year retail entry at 2x what you think it will cost.",
              "입점비, 프로모션 수당, 부패 손실을 더하면, 소매 선반에 올라가고 — 유지하는 — 진정한 비용은 마진 스택 위에 15-25% 추가입니다. 첫 해 소매 진입 예산을 예상의 2배로 잡으세요.",
            )}
          </p>
        </Callout>
      </section>

      {/* Walkthrough */}
      <section id="walkthrough">
        <h2>{t("Pricing Walkthrough: $2 COGS → RSP", "가격 산정 예시: $2 원가 → RSP")}</h2>
        <p>
          {t(
            "Let's walk through three realistic scenarios to show how margin assumptions change the final retail price.",
            "마진 가정이 최종 소매가를 어떻게 바꾸는지 보여주는 세 가지 현실적 시나리오를 살펴보겠습니다.",
          )}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Layer", "단계")}</th>
                <th>{t("Conservative", "보수적")}</th>
                <th>{t("Standard", "표준")}</th>
                <th>{t("Premium", "프리미엄")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>COGS</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td>$2.00</td>
              </tr>
              <tr>
                <td>{t("Mfr. Margin", "제조 마진")}</td>
                <td>25%</td>
                <td>30%</td>
                <td>40%</td>
              </tr>
              <tr>
                <td>{t("Mfr. Price", "제조가")}</td>
                <td>$2.67</td>
                <td>$2.86</td>
                <td>$3.33</td>
              </tr>
              <tr>
                <td>{t("Distributor (25%)", "유통 (25%)")}</td>
                <td>$3.56</td>
                <td>$3.81</td>
                <td>$4.44</td>
              </tr>
              <tr>
                <td>{t("Retailer (40%)", "소매 (40%)")}</td>
                <td className="font-bold">$5.93</td>
                <td className="font-bold">$6.35</td>
                <td className="font-bold">$7.40</td>
              </tr>
              <tr className="bg-muted/30">
                <td>{t("RSP / COGS", "RSP / 원가")}</td>
                <td>2.97x</td>
                <td>3.18x</td>
                <td>3.70x</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {t(
            "Notice that even the \"premium\" scenario barely approaches 4x. To truly hit 4x ($8.00 RSP on $2.00 COGS), you need either a premium brand that commands a higher shelf price, or your COGS needs to be lower than $2.00.",
            "\"프리미엄\" 시나리오조차 4x에 간신히 접근합니다. 진정한 4x ($2.00 원가에 $8.00 RSP)에 도달하려면, 더 높은 매대 가격을 요구하는 프리미엄 브랜드이거나, 원가가 $2.00보다 낮아야 합니다.",
          )}
        </p>
      </section>

      {/* Strategy by Channel */}
      <section id="strategy">
        <h2>{t("Pricing Strategy by Channel", "채널별 가격 전략")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Channel", "채널")}</th>
                <th>{t("Your Margin", "본인 마진")}</th>
                <th>{t("Why", "이유")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DTC ({t("own website", "자사 웹사이트")})</td>
                <td>60-70%</td>
                <td>{t("No distributor or retailer cut. Highest margin but lowest volume.", "유통/소매 몫 없음. 최고 마진이지만 최저 볼륨.")}</td>
              </tr>
              <tr>
                <td>{t("Farmers Markets", "파머스 마켓")}</td>
                <td>50-65%</td>
                <td>{t("Direct sales. Table fee only. Good for validation.", "직접 판매. 테이블비만. 검증에 좋음.")}</td>
              </tr>
              <tr>
                <td>Amazon</td>
                <td>30-45%</td>
                <td>{t("Referral fee (~15%) + FBA fees. No broker/distributor but platform takes its cut.", "추천 수수료 (~15%) + FBA 수수료. 브로커/유통 없지만 플랫폼 몫.")}</td>
              </tr>
              <tr>
                <td>{t("Retail (with distributor)", "소매 (유통 경유)")}</td>
                <td>20-35%</td>
                <td>{t("Full margin stack. Volume makes up for lower margin.", "전체 마진 스택. 볼륨이 낮은 마진을 보완.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title={t("The Smart Sequence", "현명한 순서")}>
          <p>
            {t(
              "Start DTC/farmers market (high margin, low volume) → validate product-market fit → move to specialty/independent retail → scale to major chains. Each step trades margin for volume. Never start at the bottom of the margin stack.",
              "DTC/파머스 마켓으로 시작 (고마진, 저볼륨) → 제품-시장 적합성 검증 → 전문점/독립 소매로 이동 → 대형 체인으로 확장. 각 단계에서 마진을 볼륨으로 교환. 마진 스택의 맨 아래에서 시작하지 마세요.",
            )}
          </p>
        </Callout>
      </section>

      <p className="text-sm text-muted-foreground border-t pt-6">
        {t(
          "Sources: Agriculture and Agri-Food Canada — Retail Fees in the Canadian Food Industry; PartnerSlate — How to Price a Food Product; Kevin Grier — Trade Practices in the Canadian Grocery Industry; Retail Insider — Canadian Grocery vs Global CPG Profit Comparison.",
          "출처: Agriculture and Agri-Food Canada — 캐나다 식품 산업 소매 수수료; PartnerSlate — 식품 가격 책정 방법; Kevin Grier — 캐나다 식료품 유통 관행; Retail Insider — 캐나다 식료품 vs 글로벌 CPG 수익 비교.",
        )}
      </p>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Food Product Margin Structure & Pricing Guide for Canada",
            description: "The real numbers behind food pricing in Canada — distributor, broker, and retailer margins.",
            author: { "@type": "Organization", name: "OHMAZE" },
            publisher: { "@type": "Organization", name: "OHMAZE" },
            datePublished: "2026-03-28",
            dateModified: "2026-03-28",
          }),
        }}
      />
    </GuideArticle>
  );
}
