"use client";

import { GuideArticle } from "@/components/guides/guide-article";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { Callout } from "@/components/guides/callout";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";

const TOC_ITEMS = [
  { id: "overview", label_en: "Market Overview", label_ko: "시장 개요" },
  { id: "big-five", label_en: "The Big Five Retailers", label_ko: "5대 소매업체" },
  { id: "market-share", label_en: "Market Share & Store Counts", label_ko: "시장 점유율 & 매장 수" },
  { id: "independents", label_en: "Independent Grocers", label_ko: "독립 식료품점" },
  { id: "regional", label_en: "Regional Dynamics", label_ko: "지역별 특성" },
  { id: "trends", label_en: "2026 Trends", label_ko: "2026 트렌드" },
  { id: "getting-listed", label_en: "Getting Listed: A Realistic View", label_ko: "입점하기: 현실적 시각" },
] as const;

export default function RetailLandscapePage() {
  const { t } = useLanguage();

  return (
    <GuideArticle
      title_en="Canadian Retail Grocery Landscape: 2026 Analysis"
      title_ko="캐나다 식품 소매 시장 분석: 2026"
      subtitle_en="Who controls Canadian grocery, how many stores exist, and what it takes to get on their shelves."
      subtitle_ko="누가 캐나다 식료품을 지배하는지, 매장이 얼마나 있는지, 선반에 올라가려면 무엇이 필요한지."
      readTime="12 min"
      date="March 2026"
      badges={["Market Research", "Retail", "Canada"]}
    >
      <TableOfContents items={TOC_ITEMS} />

      {/* Overview */}
      <section id="overview">
        <h2>{t("Market Overview: A Concentrated Market", "시장 개요: 집중된 시장")}</h2>
        <p>
          {t(
            "Canada's grocery market is one of the most concentrated in the developed world. Five companies control approximately 76% of all grocery sales. There are roughly 8,900 supermarkets and grocery stores nationwide, plus about 6,900 independent grocers and 27,000 small convenience stores.",
            "캐나다 식료품 시장은 선진국 중 가장 집중된 시장 중 하나입니다. 5개 기업이 전체 식료품 매출의 약 76%를 지배합니다. 전국에 약 8,900개의 슈퍼마켓/식료품점, 약 6,900개의 독립 식료품점, 27,000개의 소규모 편의점이 있습니다.",
          )}
        </p>
        <p>
          {t(
            "For a new food brand, this concentration is both a challenge and an advantage. The challenge: a handful of buyers control most shelf space. The advantage: getting into even one major chain gives you national-scale distribution.",
            "새로운 식품 브랜드에게 이 집중은 도전이자 이점입니다. 도전: 소수의 바이어가 대부분의 선반 공간을 지배. 이점: 하나의 대형 체인에만 입점해도 전국 규모의 유통을 확보.",
          )}
        </p>
        <p className="text-sm text-muted-foreground italic">
          {t(
            "Source: IBISWorld Canada — Supermarkets & Grocery Stores Industry (2026); Statistics Canada; CFIG.",
            "출처: IBISWorld Canada — 슈퍼마켓 & 식료품점 산업 (2026); Statistics Canada; CFIG.",
          )}
        </p>
      </section>

      {/* Big Five */}
      <section id="big-five">
        <h2>{t("The Big Five Retailers", "5대 소매업체")}</h2>

        <h3>1. Loblaw Companies — ~30% {t("market share", "시장 점유율")}</h3>
        <p>
          {t(
            "Canada's largest retailer with 2,400+ stores. Banners include Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, T&T Supermarket, and Provigo. Revenue exceeded $61 billion in 2024.",
            "캐나다 최대 소매업체로 2,400+ 매장 운영. 브랜드: Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, T&T Supermarket, Provigo. 2024년 매출 $61B 초과.",
          )}
        </p>
        <ul>
          <li>{t("Strongest private label program in Canada (President's Choice, No Name)", "캐나다 최강 자체 브랜드 프로그램 (President's Choice, No Name)")}</li>
          <li>{t("Aggressive on local sourcing and innovation partnerships", "로컬 소싱과 혁신 파트너십에 적극적")}</li>
          <li>{t("Has granted listing fee exemptions for small producers and farmers", "소규모 생산자와 농부에게 입점비 면제 부여")}</li>
        </ul>

        <h3>2. Sobeys (Empire) — ~25% {t("market share", "시장 점유율")}</h3>
        <p>
          {t(
            "~$30 billion in annual revenue. Banners include Sobeys, Safeway (Western Canada), FreshCo, Farm Boy, Foodland, IGA (Quebec), and Longo's.",
            "연간 ~$30B 매출. 브랜드: Sobeys, Safeway (서부 캐나다), FreshCo, Farm Boy, Foodland, IGA (퀘벡), Longo's.",
          )}
        </p>
        <ul>
          <li>{t("Region-specific banners tailored to local tastes", "지역 맞춤형 배너 운영")}</li>
          <li>{t("Strong presence from Atlantic to BC through diverse banner strategy", "다양한 배너 전략으로 대서양~BC 강한 입지")}</li>
          <li>{t("Voilà online grocery delivery service", "Voilà 온라인 식료품 배달 서비스")}</li>
        </ul>

        <h3>3. Metro Inc. — ~15% {t("market share", "시장 점유율")}</h3>
        <p>
          {t(
            "Primarily Ontario and Quebec. Banners include Metro, Food Basics, Super C, and Jean Coutu pharmacies.",
            "주로 온타리오와 퀘벡. 브랜드: Metro, Food Basics, Super C, Jean Coutu 약국.",
          )}
        </p>
        <ul>
          <li>{t("Most geographically focused of the Big Three — deep penetration in ON/QC", "Big Three 중 가장 지리적으로 집중 — ON/QC 깊은 침투")}</li>
          <li>{t("Strong discount presence through Food Basics and Super C", "Food Basics와 Super C를 통한 강한 할인점 입지")}</li>
        </ul>

        <h3>4. Costco Canada — ~8% {t("market share", "시장 점유율")}</h3>
        <p>
          {t(
            "Membership-based warehouse club. Fewer SKUs (3,800 vs 30,000+ at a typical grocery store) means extremely competitive shelf space, but massive volume per SKU.",
            "회원제 창고형 클럽. 적은 SKU (3,800 vs 일반 식료품점 30,000+)로 극도로 경쟁적인 선반 공간이지만, SKU당 엄청난 볼륨.",
          )}
        </p>
        <ul>
          <li>{t("Kirkland Signature private label is a powerful competitor in every category", "Kirkland Signature 자체 브랜드가 모든 카테고리에서 강력한 경쟁자")}</li>
          <li>{t("Getting in is very hard, but staying in means massive volume", "입점이 매우 어렵지만, 유지하면 엄청난 볼륨")}</li>
        </ul>

        <h3>5. Walmart Canada</h3>
        <p>
          {t(
            "Ranked 5th in food sales nationally. Supercentre format combines grocery with general merchandise. Strong in price-conscious segments.",
            "전국 식품 매출 5위. 슈퍼센터 형태로 식료품과 일반 상품을 결합. 가격 의식이 강한 세그먼트에서 강세.",
          )}
        </p>
      </section>

      {/* Market Share */}
      <section id="market-share">
        <h2>{t("Market Share & Store Counts (2026)", "시장 점유율 & 매장 수 (2026)")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Retailer", "소매업체")}</th>
                <th>{t("Market Share", "시장 점유율")}</th>
                <th>{t("Stores", "매장 수")}</th>
                <th>{t("Revenue", "매출")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Loblaw</strong></td>
                <td>~30%</td>
                <td>2,400+</td>
                <td>$61B+ (2024)</td>
              </tr>
              <tr>
                <td><strong>Sobeys (Empire)</strong></td>
                <td>~25%</td>
                <td>1,500+</td>
                <td>~$30B</td>
              </tr>
              <tr>
                <td><strong>Metro</strong></td>
                <td>~15%</td>
                <td>950+</td>
                <td>~$21B</td>
              </tr>
              <tr>
                <td><strong>Costco Canada</strong></td>
                <td>~8%</td>
                <td>108</td>
                <td>{t("N/A (not broken out)", "N/A (미공개)")}</td>
              </tr>
              <tr>
                <td><strong>Walmart Canada</strong></td>
                <td>{t("Significant", "상당")}</td>
                <td>400+</td>
                <td>{t("N/A (not broken out)", "N/A (미공개)")}</td>
              </tr>
              <tr className="bg-muted/30">
                <td><strong>{t("Top 5 Combined", "상위 5개 합계")}</strong></td>
                <td><strong>~76%</strong></td>
                <td><strong>5,350+</strong></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="not-prose rounded-xl border bg-muted/30 p-5 my-6">
          <p className="text-sm font-semibold mb-2">{t("Total Canadian Food Retail", "캐나다 식품 소매 전체")}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>~8,900 {t("supermarkets/grocery stores", "슈퍼마켓/식료품점")} (IBISWorld, 2026)</li>
            <li>~6,900 {t("independent grocers", "독립 식료품점")} (CFIG)</li>
            <li>~27,000 {t("convenience stores", "편의점")}</li>
            <li>~28,000 {t("total food & beverage stores", "전체 식품 & 음료 매장")} (Statistics Canada)</li>
          </ul>
        </div>
      </section>

      {/* Independents */}
      <section id="independents">
        <h2>{t("Independent Grocers: The Overlooked Opportunity", "독립 식료품점: 간과된 기회")}</h2>
        <p>
          {t(
            "The Canadian Federation of Independent Grocers (CFIG) represents approximately 6,900 independent grocery retailers — roughly one for every 5,640 Canadians. They generated over $12.8 billion in sales.",
            "캐나다 독립 식료품 연맹 (CFIG)은 약 6,900개의 독립 식료품점을 대표합니다 — 캐나다인 5,640명당 약 1개. $12.8B 이상의 매출을 기록.",
          )}
        </p>

        <Callout type="tip" title={t("Why Start With Independents", "독립 식료품점부터 시작하는 이유")}>
          <p>
            {t(
              "Independent grocers are the best first step for new brands. No listing fees. Direct relationship with the buyer (often the owner). Faster decision cycle. Willingness to try local/unique products. Once you have velocity data from independents, you have ammunition for pitching major chains.",
              "독립 식료품점은 새 브랜드의 최고의 첫 단계입니다. 입점비 없음. 바이어(보통 점주)와 직접 관계. 빠른 의사결정. 로컬/유니크 제품에 대한 시도 의지. 독립점에서의 회전율 데이터가 있으면, 대형 체인 피칭의 무기가 됩니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Regional */}
      <section id="regional">
        <h2>{t("Regional Dynamics", "지역별 특성")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Region", "지역")}</th>
                <th>{t("Dominant Players", "지배적 업체")}</th>
                <th>{t("Key Characteristics", "주요 특성")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ontario</strong></td>
                <td>Loblaw, Sobeys, Metro</td>
                <td>{t("Largest market. All three compete aggressively. Most diverse ethnic food demand.", "최대 시장. 3사 치열한 경쟁. 가장 다양한 에스닉 식품 수요.")}</td>
              </tr>
              <tr>
                <td><strong>Quebec</strong></td>
                <td>Metro, Sobeys (IGA), Loblaw (Provigo)</td>
                <td>{t("French-first market. Strong local brand loyalty. MAPAQ regulatory overlay.", "프랑스어 우선 시장. 강한 로컬 브랜드 충성도. MAPAQ 규제 추가.")}</td>
              </tr>
              <tr>
                <td><strong>{t("Western Canada", "서부 캐나다")}</strong></td>
                <td>Sobeys (Safeway), Loblaw (Superstore), Costco</td>
                <td>{t("Costco particularly strong in BC/Alberta. Save-On-Foods (Pattison) is major regional player.", "BC/Alberta에서 Costco 특히 강세. Save-On-Foods (Pattison)이 주요 지역 업체.")}</td>
              </tr>
              <tr>
                <td><strong>{t("Atlantic", "대서양 연안")}</strong></td>
                <td>Sobeys (Foodland), Loblaw (Atlantic Superstore)</td>
                <td>{t("Sobeys' home turf (HQ in Stellarton, NS). Strong co-op and independent presence.", "Sobeys 홈 터프 (본사: NS 스텔라턴). 강한 협동조합과 독립점 입지.")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Trends */}
      <section id="trends">
        <h2>{t("2026 Trends Shaping the Market", "시장을 형성하는 2026 트렌드")}</h2>

        <h3>{t("1. Discount Grocery Growth", "1. 할인 식료품점 성장")}</h3>
        <p>
          {t(
            "Consumers are gravitating toward discount banners — No Frills, FreshCo, Food Basics. This trend has been building for 15 years but accelerated with inflation. Consumers now employ an average of 4.3 savings strategies when grocery shopping.",
            "소비자들이 할인 배너로 이동 — No Frills, FreshCo, Food Basics. 이 추세는 15년간 이어졌지만 인플레이션으로 가속화. 소비자들은 현재 식료품 쇼핑 시 평균 4.3가지 절약 전략을 사용.",
          )}
        </p>

        <h3>{t("2. Ethnic & International Foods Going Mainstream", "2. 에스닉 & 해외 식품의 주류화")}</h3>
        <p>
          {t(
            "Multicultural foods are moving from specialty sections into mainstream aisles. Immigration-driven demand plus second-generation consumers introducing their food culture to the broader market.",
            "다문화 식품이 특수 코너에서 주류 통로로 이동 중. 이민 수요와 2세대 소비자들이 자국 식문화를 더 넓은 시장에 소개하는 추세.",
          )}
        </p>

        <h3>{t("3. Online Grocery Acceleration", "3. 온라인 식료품 가속화")}</h3>
        <p>
          {t(
            "Third-party marketplaces growing at 11.17% CAGR. Click-and-collect remains popular (46.65% of orders) because it eliminates delivery fees. All major chains now have robust online platforms.",
            "서드파티 마켓플레이스 CAGR 11.17% 성장. 클릭-앤-콜렉트가 여전히 인기 (주문의 46.65%) — 배달비 제거. 모든 대형 체인이 이제 견고한 온라인 플랫폼 보유.",
          )}
        </p>

        <h3>{t("4. Private Label Dominance", "4. 자체 브랜드 지배")}</h3>
        <p>
          {t(
            "100% of Canadian households purchased private label products in 2024. President's Choice, Kirkland, Compliments, and Selection are no longer \"store brands\" — they're trusted brands in their own right. This compresses margins for national brands.",
            "2024년 캐나다 가구의 100%가 자체 브랜드 제품을 구매. President's Choice, Kirkland, Compliments, Selection은 더 이상 '매장 브랜드'가 아닌 — 그 자체로 신뢰받는 브랜드. 이는 전국 브랜드의 마진을 압축.",
          )}
        </p>

        <h3>{t("5. Local Sourcing & Farm-to-Table", "5. 로컬 소싱 & 농장 직송")}</h3>
        <p>
          {t(
            "Rising produce prices are driving consumers to local farmers and roadside stands. Economic uncertainty is accelerating preference for locally made goods. Retailers are responding with dedicated \"local\" shelf sections.",
            "상승하는 농산물 가격이 소비자를 지역 농부와 노변 가판대로 이끌고 있습니다. 경제적 불확실성이 로컬 생산품 선호를 가속화. 소매업체들은 전용 '로컬' 선반 섹션으로 대응.",
          )}
        </p>
      </section>

      {/* Getting Listed */}
      <section id="getting-listed">
        <h2>{t("Getting Listed: A Realistic View", "입점하기: 현실적 시각")}</h2>

        <h3>{t("Listing Fees", "입점비")}</h3>
        <p>
          {t(
            "National chain listing fees range from $10,000 to $25,000+ per SKU per chain — up to $3 million for a multi-SKU national program. Premium placement (end caps, eye-level) costs additional fees on top.",
            "전국 체인 입점비는 SKU당 체인당 $10,000~$25,000+ — 다중 SKU 전국 프로그램은 $3M까지. 프리미엄 배치 (엔드캡, 눈높이)는 추가 비용.",
          )}
        </p>
        <p>
          {t(
            "However: Loblaw has publicly committed to granting fee exemptions for small producers, farmers, and growers. Other chains have similar (if less publicized) programs for emerging brands.",
            "그러나: Loblaw은 소규모 생산자, 농부, 재배자에게 수수료 면제를 공개적으로 약속. 다른 체인도 유사한 (덜 알려진) 신생 브랜드 프로그램을 운영.",
          )}
        </p>

        <h3>{t("The Realistic Path", "현실적 경로")}</h3>
        <ol>
          <li>
            <strong>{t("Validate locally", "로컬에서 검증")}</strong> — {t("Farmers markets, DTC, local independents. Prove the product sells.", "파머스 마켓, DTC, 지역 독립점. 제품이 판매됨을 증명.")}
          </li>
          <li>
            <strong>{t("Build velocity data", "회전율 데이터 구축")}</strong> — {t("Track units/store/week. Retailers want to see $X/linear foot/week.", "매장당 주당 판매량 추적. 소매업체는 주당 linear foot당 $X를 보고 싶어함.")}
            {" "}<Link href="/guides/margins" className="text-primary hover:underline">{t("→ See margin guide", "→ 마진 가이드 보기")}</Link>
          </li>
          <li>
            <strong>{t("Hire a broker", "브로커 고용")}</strong> — {t("For major chains, this is nearly mandatory. Budget 5-10% of wholesale.", "대형 체인의 경우 거의 필수. 도매가의 5-10% 예산.")}
          </li>
          <li>
            <strong>{t("Pitch to regional buyers", "지역 바이어에게 피칭")}</strong> — {t("Start with one region, not national. Prove concept before scaling.", "전국이 아닌 한 지역부터. 확장 전 컨셉 증명.")}
          </li>
          <li>
            <strong>{t("Scale nationally", "전국 확장")}</strong> — {t("Use regional success data to negotiate national programs.", "지역 성공 데이터로 전국 프로그램 협상.")}
          </li>
        </ol>

        <Callout type="info" title={t("The Grocery Code of Conduct", "식료품 행동강령")}>
          <p>
            {t(
              "Canada introduced a voluntary Grocery Code of Conduct (canadacode.org) to address power imbalances between suppliers and major retailers. While not yet mandatory, it signals increasing regulatory attention to fair trading practices. Stay informed — this may become enforceable.",
              "캐나다는 공급업체와 대형 소매업체 간의 권력 불균형을 해소하기 위해 자발적 식료품 행동강령 (canadacode.org)을 도입했습니다. 아직 의무는 아니지만, 공정 거래에 대한 규제 관심 증가를 시사. 동향 파악 필요 — 강제 시행될 수 있습니다.",
            )}
          </p>
        </Callout>
      </section>

      <p className="text-sm text-muted-foreground border-t pt-6">
        {t(
          "Sources: IBISWorld — Supermarkets & Grocery Stores in Canada (2026); Statista — Leading Grocery Retailers by Market Share; Statistics Canada; CFIG — Canadian Federation of Independent Grocers; Agriculture and Agri-Food Canada — Retail Fees; The Packer — Five Retailers Dominate Canada's Grocery Sales; Mordor Intelligence — Canada Online Grocery Market.",
          "출처: IBISWorld — 캐나다 슈퍼마켓 & 식료품점 (2026); Statista — 시장 점유율별 주요 식료품 소매업체; Statistics Canada; CFIG; Agriculture and Agri-Food Canada — 소매 수수료; The Packer; Mordor Intelligence — 캐나다 온라인 식료품 시장.",
        )}
      </p>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Canadian Retail Grocery Market Research: 2026 Analysis",
            description: "Market share data, store counts, and retailer profiles for the Canadian grocery market.",
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
