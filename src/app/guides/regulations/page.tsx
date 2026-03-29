"use client";

import { GuideArticle } from "@/components/guides/guide-article";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { Callout } from "@/components/guides/callout";
import { useLanguage } from "@/hooks/use-language";

const TOC_ITEMS = [
  { id: "overview", label_en: "Regulatory Overview", label_ko: "규제 개요" },
  { id: "small-scale", label_en: "Small Scale (Provincial)", label_ko: "소규모 (주정부)" },
  { id: "large-scale", label_en: "Large Scale (Federal)", label_ko: "대규모 (연방)" },
  { id: "labelling", label_en: "Labelling Requirements", label_ko: "라벨링 요건" },
  { id: "provincial", label_en: "Provincial Differences", label_ko: "주별 차이" },
  { id: "transition", label_en: "Scaling Up: When to Transition", label_ko: "스케일업: 전환 시점" },
  { id: "resources", label_en: "Official Resources", label_ko: "공식 리소스" },
] as const;

export default function RegulationsGuidePage() {
  const { t } = useLanguage();

  return (
    <GuideArticle
      title_en="Food Regulations: Small Scale → Large Scale"
      title_ko="식품 규제: 소규모 → 대규모"
      subtitle_en="What you actually need at each stage — not what you think you need."
      subtitle_ko="각 단계에서 실제로 필요한 것 — 당신이 생각하는 것이 아닌."
      readTime="15 min"
      date="March 2026"
      badges={["Compliance", "CFIA", "SFCR"]}
    >
      <TableOfContents items={TOC_ITEMS} />

      {/* Overview */}
      <section id="overview">
        <h2>{t("The Two Regulatory Worlds", "두 개의 규제 세계")}</h2>
        <p>
          {t(
            "Canada has a split regulatory system for food. If you sell only within your own province, you answer primarily to provincial authorities. The moment you cross a provincial border — or import/export — you enter the federal system under CFIA. This distinction changes everything about what licences you need, what inspections you face, and how much compliance costs.",
            "캐나다는 식품에 대해 이원화된 규제 시스템을 갖고 있습니다. 자기 주 내에서만 판매하면, 주로 주정부 당국에 대응합니다. 주 경계를 넘는 순간 — 또는 수출입 시 — CFIA 하의 연방 시스템으로 진입합니다. 이 구분은 어떤 라이선스가 필요한지, 어떤 검사를 받는지, 규제 준수에 얼마나 비용이 드는지를 완전히 바꿉니다.",
          )}
        </p>

        <Callout type="info" title={t("The Key Question", "핵심 질문")}>
          <p>
            {t(
              "\"Will this product ever cross a provincial border?\" If yes — even through an online order to another province — you need federal licensing. Plan for this from the start, even if you begin locally.",
              "\"이 제품이 주 경계를 넘을 것인가?\" 예라면 — 다른 주로의 온라인 주문이라도 — 연방 라이선스가 필요합니다. 지역에서 시작하더라도 처음부터 이를 계획하세요.",
            )}
          </p>
        </Callout>
      </section>

      {/* Small Scale */}
      <section id="small-scale">
        <h2>{t("Small Scale: Provincial-Only Operations", "소규모: 주 내 운영")}</h2>
        <p>
          {t(
            "Selling within a single province. Farmers markets, local retailers, direct-to-consumer within province borders.",
            "단일 주 내에서 판매. 파머스 마켓, 지역 소매점, 주 경계 내 소비자 직접 판매.",
          )}
        </p>

        <h3>{t("What You Need", "필요한 것")}</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Requirement", "요건")}</th>
                <th>{t("Details", "상세")}</th>
                <th>{t("Cost", "비용")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Business registration", "사업자 등록")}</td>
                <td>{t("Provincial registry (ServiceOntario, BC Registry, etc.)", "주정부 등록 (ServiceOntario, BC Registry 등)")}</td>
                <td>$60-200</td>
              </tr>
              <tr>
                <td>{t("Food handler certification", "식품 취급 인증")}</td>
                <td>{t("Required in most provinces — course + exam", "대부분의 주에서 필수 — 과정 + 시험")}</td>
                <td>$30-100</td>
              </tr>
              <tr>
                <td>{t("Public health inspection", "공중보건 검사")}</td>
                <td>{t("Municipal public health unit pre-opening inspection", "시 공중보건과 개업 전 검사")}</td>
                <td>{t("Free (tax-funded)", "무료 (세금 운영)")}</td>
              </tr>
              <tr>
                <td>{t("Commercial kitchen", "상업용 주방")}</td>
                <td>{t("Own facility or shared/rental commercial kitchen", "자체 시설 또는 공유/임대 상업용 주방")}</td>
                <td>$15-50/hr {t("(rental)", "(임대)")}</td>
              </tr>
              <tr>
                <td>{t("Liability insurance", "배상책임 보험")}</td>
                <td>{t("Product liability — most retailers require it", "제조물 배상 — 대부분의 소매업체가 요구")}</td>
                <td>$500-2,000/yr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>{t("What You Don't Need (Yet)", "아직 필요 없는 것")}</h3>
        <ul>
          <li>{t("SFC (Safe Food for Canadians) federal licence — only for interprovincial/international trade", "SFC (안전식품) 연방 라이선스 — 주간/국제 거래 시에만")}</li>
          <li>{t("Formal Preventive Control Plan (PCP) — though having basic food safety procedures is still smart", "공식 예방 통제 계획 (PCP) — 기본적인 식품 안전 절차를 갖추는 것은 여전히 현명")}</li>
          <li>{t("Full CFIA-compliant Nutrition Facts table — some provincial exemptions exist for small producers", "완전한 CFIA 준수 영양성분표 — 소규모 생산자를 위한 일부 주정부 면제 존재")}</li>
        </ul>

        <Callout type="tip" title={t("Cottage Food / Home Kitchen Rules", "가정식 / 홈 키친 규칙")}>
          <p>
            {t(
              "Some provinces allow limited food production from home kitchens (e.g., Ontario's \"home-based food\" under O. Reg. 493/17 exemptions for low-risk foods like baked goods and jams). Check your specific province — rules vary significantly. BC is more restrictive than Ontario. Quebec requires MAPAQ permits for nearly everything.",
              "일부 주에서는 가정 주방에서의 제한적 식품 생산을 허용합니다 (예: 온타리오의 O. Reg. 493/17 하 '홈 기반 식품' — 구운 식품, 잼 등 저위험 식품 면제). 해당 주를 구체적으로 확인하세요 — 규칙이 상당히 다릅니다. BC는 온타리오보다 더 제한적입니다. 퀘벡은 거의 모든 것에 MAPAQ 허가를 요구합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Large Scale */}
      <section id="large-scale">
        <h2>{t("Large Scale: Federal (Interprovincial / Import / Export)", "대규모: 연방 (주간 / 수입 / 수출)")}</h2>
        <p>
          {t(
            "Selling across provincial borders, importing, or exporting. This is where the full weight of Canadian food regulation applies.",
            "주 경계를 넘어 판매, 수입 또는 수출. 캐나다 식품 규제의 전체 무게가 적용되는 곳입니다.",
          )}
        </p>

        <h3>{t("What You Need", "필요한 것")}</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Requirement", "요건")}</th>
                <th>{t("Details", "상세")}</th>
                <th>{t("Cost / Timeline", "비용 / 기간")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SFC Licence</strong></td>
                <td>
                  {t(
                    "Safe Food for Canadians licence via My CFIA portal. Required for manufacturing, processing, importing, or exporting food.",
                    "My CFIA 포털을 통한 안전식품 라이선스. 식품 제조, 가공, 수입, 수출에 필수.",
                  )}
                </td>
                <td>$250 / 2 {t("years", "년")}</td>
              </tr>
              <tr>
                <td><strong>PCP</strong></td>
                <td>
                  {t(
                    "Written Preventive Control Plan — HACCP-based food safety system documenting hazards, controls, monitoring, and corrective actions.",
                    "서면 예방 통제 계획 — 위해요소, 통제, 모니터링, 시정 조치를 문서화하는 HACCP 기반 식품 안전 시스템.",
                  )}
                </td>
                <td>{t("$2K-15K (consultant fees)", "$2K-15K (컨설턴트 비용)")}</td>
              </tr>
              <tr>
                <td><strong>{t("Traceability", "추적성")}</strong></td>
                <td>
                  {t(
                    "Ability to trace one step forward, one step back in the supply chain (SFCR Part 6). Lot coding, supplier records, customer records.",
                    "공급망에서 한 단계 앞, 한 단계 뒤를 추적하는 능력 (SFCR Part 6). 로트 코딩, 공급자 기록, 고객 기록.",
                  )}
                </td>
                <td>{t("Built into operations", "운영에 내장")}</td>
              </tr>
              <tr>
                <td><strong>{t("Full Labelling", "완전 라벨링")}</strong></td>
                <td>
                  {t(
                    "Bilingual (EN/FR), Nutrition Facts table, ingredient list, allergen declaration, net quantity, dealer name/address.",
                    "이중 언어 (영/불), 영양성분표, 성분표, 알레르겐 표시, 순중량, 판매자명/주소.",
                  )}
                </td>
                <td>{t("$1K-5K (design + regulatory review)", "$1K-5K (디자인 + 규제 검토)")}</td>
              </tr>
              <tr>
                <td><strong>{t("Recall Plan", "리콜 계획")}</strong></td>
                <td>
                  {t(
                    "Written procedure for product recall situations. Must be able to execute recall within 24 hours.",
                    "제품 리콜 상황에 대한 서면 절차. 24시간 이내에 리콜을 실행할 수 있어야 합니다.",
                  )}
                </td>
                <td>{t("Part of PCP", "PCP의 일부")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title={t("FOP Labelling — 2026 Update", "전면 라벨링 — 2026 업데이트")}>
          <p>
            {t(
              "Front-of-Package (FOP) nutrition symbol labelling is now mandatory for products high in saturated fat, sugars, or sodium. The compliance deadline has passed. If your product triggers FOP thresholds, you must include the Health Canada \"high in\" symbol on the principal display panel.",
              "전면 패키지 (FOP) 영양 심벌 라벨링은 포화지방, 당류 또는 나트륨이 높은 제품에 의무입니다. 준수 기한이 지났습니다. 제품이 FOP 기준을 초과하면, 주 표시면에 Health Canada '높음' 심벌을 포함해야 합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Labelling */}
      <section id="labelling">
        <h2>{t("Labelling: The Details That Trip People Up", "라벨링: 사람들이 걸려 넘어지는 세부사항")}</h2>

        <h3>{t("Mandatory Label Elements", "필수 라벨 요소")}</h3>
        <ol>
          <li><strong>{t("Product identity", "제품명")}</strong> — {t("Common name in both English and French", "영어와 프랑스어 모두 일반명")}</li>
          <li><strong>{t("Ingredient list", "성분표")}</strong> — {t("Descending order by weight. Components of multi-ingredient items must be broken out.", "중량 기준 내림차순. 복합 원료의 구성 성분도 분류해야 합니다.")}</li>
          <li><strong>{t("Allergen declaration", "알레르겐 표시")}</strong> — {t("\"Contains:\" statement for all priority allergens (11 in Canada: eggs, milk, mustard, peanuts, crustaceans/molluscs, fish, sesame, soy, sulphites, tree nuts, wheat/triticale)", "\"포함:\" 문구로 모든 우선 알레르겐 표시 (캐나다 11종: 계란, 우유, 겨자, 땅콩, 갑각류/연체류, 생선, 참깨, 대두, 아황산염, 견과류, 밀/트리티케일)")}</li>
          <li><strong>{t("Nutrition Facts table", "영양성분표")}</strong> — {t("Standardized format per FDR B.01.401. Specific font sizes, line spacing, and format requirements.", "FDR B.01.401 기준 표준화된 형식. 특정 글꼴 크기, 줄 간격, 형식 요건.")}</li>
          <li><strong>{t("Net quantity", "순중량")}</strong> — {t("Metric units. Specific minimum type height based on package area.", "미터법 단위. 패키지 면적 기준 최소 글자 높이.")}</li>
          <li><strong>{t("Best before date", "유통기한")}</strong> — {t("Required if shelf life ≤ 90 days. Format: \"Best Before / Meilleur avant\" + date.", "유통기한 ≤ 90일인 경우 필수. 형식: \"Best Before / Meilleur avant\" + 날짜.")}</li>
          <li><strong>{t("Dealer name & address", "판매자명 & 주소")}</strong> — {t("Canadian address of manufacturer, distributor, or importer.", "제조자, 유통업자, 또는 수입업자의 캐나다 주소.")}</li>
        </ol>
      </section>

      {/* Provincial Differences */}
      <section id="provincial">
        <h2>{t("Provincial Differences That Matter", "중요한 주별 차이")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Province", "주")}</th>
                <th>{t("Authority", "관할")}</th>
                <th>{t("Key Differences", "주요 차이")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ontario</strong></td>
                <td>{t("Local Public Health Units", "지역 공중보건과")}</td>
                <td>{t("Most cottage food-friendly. Home kitchen possible for low-risk items. Food handler cert required.", "가정식 가장 친화적. 저위험 품목에 홈키친 가능. 식품 취급 인증 필수.")}</td>
              </tr>
              <tr>
                <td><strong>BC</strong></td>
                <td>{t("Regional Health Authorities", "지역 보건청")}</td>
                <td>{t("Stricter than Ontario. Floor plan pre-approval required before construction. Health Operating Permit needed.", "온타리오보다 엄격. 건설 전 도면 사전 승인 필요. Health Operating Permit 필요.")}</td>
              </tr>
              <tr>
                <td><strong>Alberta</strong></td>
                <td>Alberta Health Services</td>
                <td>{t("Food handling permit from AHS. Relatively straightforward process.", "AHS의 식품 취급 허가. 상대적으로 간단한 프로세스.")}</td>
              </tr>
              <tr>
                <td><strong>Quebec</strong></td>
                <td>MAPAQ</td>
                <td>{t("Most regulated. MAPAQ permit required for nearly all food operations. French-first labelling. Separate inspection regime.", "가장 규제가 많음. 거의 모든 식품 운영에 MAPAQ 허가 필요. 프랑스어 우선 라벨링. 별도 검사 체계.")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Transition */}
      <section id="transition">
        <h2>{t("Scaling Up: When & How to Transition", "스케일업: 언제 & 어떻게 전환")}</h2>
        <p>
          {t(
            "The transition from provincial to federal isn't just a licensing change — it's a fundamental shift in how your business operates.",
            "주정부에서 연방으로의 전환은 단순한 라이선스 변경이 아닙니다 — 비즈니스 운영 방식의 근본적인 변화입니다.",
          )}
        </p>

        <h3>{t("Triggers for Transition", "전환 트리거")}</h3>
        <ul>
          <li>{t("First online order from another province", "다른 주에서의 첫 온라인 주문")}</li>
          <li>{t("Retailer with stores in multiple provinces wants to carry your product", "여러 주에 매장이 있는 소매업체가 제품을 취급하려 할 때")}</li>
          <li>{t("Distributor deal that covers multiple provinces", "여러 주를 커버하는 유통 계약")}</li>
          <li>{t("Export opportunity", "수출 기회")}</li>
          <li>{t("Importing ingredients or finished products", "원료 또는 완제품 수입")}</li>
        </ul>

        <h3>{t("Transition Checklist", "전환 체크리스트")}</h3>
        <ol>
          <li>{t("Develop written PCP before applying for SFC licence", "SFC 라이선스 신청 전 서면 PCP 개발")}</li>
          <li>{t("Implement traceability system (lot coding + one-up/one-back records)", "추적 시스템 구현 (로트 코딩 + one-up/one-back 기록)")}</li>
          <li>{t("Update labels to full federal compliance (bilingual, NFt, allergens)", "라벨을 연방 규정 완전 준수로 업데이트 (이중 언어, 영양성분표, 알레르겐)")}</li>
          <li>{t("Apply for SFC licence via My CFIA portal ($250, 2-year validity)", "My CFIA 포털로 SFC 라이선스 신청 ($250, 2년 유효)")}</li>
          <li>{t("Prepare for potential CFIA assessment/inspection", "잠재적 CFIA 평가/검사 준비")}</li>
          <li>{t("Establish recall procedures and emergency contacts", "리콜 절차 및 비상 연락처 수립")}</li>
        </ol>

        <Callout type="tip" title={t("Pro Tip: Start Federal-Ready", "프로 팁: 연방 준비 상태로 시작")}>
          <p>
            {t(
              "Even if you start small and local, build your systems as if you'll go federal. Write your PCP from day one. Use proper lot coding. Build compliant labels from the start. The cost of retrofitting is 3-5x higher than building right initially.",
              "소규모 지역에서 시작하더라도, 연방으로 갈 것처럼 시스템을 구축하세요. 첫날부터 PCP를 작성하세요. 적절한 로트 코딩을 사용하세요. 처음부터 규정 준수 라벨을 만드세요. 나중에 개조하는 비용은 처음에 제대로 만드는 것보다 3-5배 높습니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Resources */}
      <section id="resources">
        <h2>{t("Official Resources", "공식 리소스")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Resource", "리소스")}</th>
                <th>{t("URL", "URL")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CFIA — SFC Licence</td>
                <td><a href="https://inspection.canada.ca/en/food-licences/obtain-licence" target="_blank" rel="noopener noreferrer">inspection.canada.ca</a></td>
              </tr>
              <tr>
                <td>SFCR Toolkit</td>
                <td><a href="https://inspection.canada.ca/en/food-safety-industry/toolkit-food-businesses" target="_blank" rel="noopener noreferrer">inspection.canada.ca/toolkit</a></td>
              </tr>
              <tr>
                <td>Safe Food for Canadians Act</td>
                <td><a href="https://laws-lois.justice.gc.ca/eng/acts/s-1.1/index.html" target="_blank" rel="noopener noreferrer">laws-lois.justice.gc.ca</a></td>
              </tr>
              <tr>
                <td>SFCR (Full Regulations)</td>
                <td><a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/index.html" target="_blank" rel="noopener noreferrer">laws-lois.justice.gc.ca</a></td>
              </tr>
              <tr>
                <td>Food Labelling (Health Canada)</td>
                <td><a href="https://www.canada.ca/en/health-canada/services/food-nutrition/food-labelling.html" target="_blank" rel="noopener noreferrer">canada.ca/food-labelling</a></td>
              </tr>
              <tr>
                <td>FOP Labelling Requirements</td>
                <td><a href="https://www.canada.ca/en/health-canada/services/food-nutrition/food-labelling/nutrition-symbol.html" target="_blank" rel="noopener noreferrer">canada.ca/nutrition-symbol</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Food Regulations in Canada: Small Scale to Large Scale",
            description: "What you actually need at each stage — from kitchen-based startups to national distribution.",
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
