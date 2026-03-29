"use client";

import { GuideArticle } from "@/components/guides/guide-article";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { Callout } from "@/components/guides/callout";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";

const TOC_ITEMS = [
  { id: "overview", label_en: "Import System Overview", label_ko: "수입 시스템 개요" },
  { id: "licence", label_en: "SFC Import Licence", label_ko: "SFC 수입 라이선스" },
  { id: "tariff", label_en: "Tariff Classification & HS Codes", label_ko: "관세 분류 & HS 코드" },
  { id: "border", label_en: "Border Process Step-by-Step", label_ko: "국경 통관 단계별" },
  { id: "labelling", label_en: "Relabelling Requirements", label_ko: "재라벨링 요건" },
  { id: "common-issues", label_en: "Common Import Pitfalls", label_ko: "흔한 수입 함정" },
  { id: "costs", label_en: "True Cost of Importing", label_ko: "수입의 실제 비용" },
  { id: "resources", label_en: "Official Resources", label_ko: "공식 리소스" },
] as const;

export default function ImportGuidePage() {
  const { t } = useLanguage();

  return (
    <GuideArticle
      title_en="Importing Food Products to Canada: Complete Guide"
      title_ko="캐나다 식품 수입 완전 가이드"
      subtitle_en="CBSA customs, CFIA licensing, tariff classification, and the steps most importers learn the hard way."
      subtitle_ko="CBSA 통관, CFIA 라이선스, 관세 분류, 대부분의 수입업자가 어렵게 배우는 단계들."
      readTime="14 min"
      date="March 2026"
      badges={["Import/Export", "CBSA", "CFIA"]}
    >
      <TableOfContents items={TOC_ITEMS} />

      {/* Overview */}
      <section id="overview">
        <h2>{t("Import System Overview", "수입 시스템 개요")}</h2>
        <p>
          {t(
            "Importing food into Canada involves two federal agencies working in parallel: CBSA (Canada Border Services Agency) handles customs, tariffs, and physical border inspection. CFIA (Canadian Food Inspection Agency) handles food safety, licensing, and labelling compliance.",
            "캐나다로의 식품 수입에는 두 연방 기관이 병행 작동합니다: CBSA (캐나다 국경서비스청)가 통관, 관세, 물리적 국경 검사를 처리. CFIA (캐나다 식품검사청)가 식품 안전, 라이선스, 라벨링 준수를 처리.",
          )}
        </p>

        <div className="not-prose rounded-xl border bg-muted/30 p-6 my-6">
          <p className="font-semibold text-center mb-4">{t("Import Process Flow", "수입 프로세스 흐름")}</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm">
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
              <p className="font-semibold">1. {t("SFC Licence", "SFC 라이선스")}</p>
              <p className="text-xs text-muted-foreground">{t("Before import", "수입 전")}</p>
            </div>
            <span className="hidden md:block">→</span>
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
              <p className="font-semibold">2. {t("HS Classification", "HS 분류")}</p>
              <p className="text-xs text-muted-foreground">{t("Tariff code", "관세 코드")}</p>
            </div>
            <span className="hidden md:block">→</span>
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
              <p className="font-semibold">3. {t("Prior Notice", "사전 통보")}</p>
              <p className="text-xs text-muted-foreground">CBSA EDI</p>
            </div>
            <span className="hidden md:block">→</span>
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
              <p className="font-semibold">4. {t("Border Inspection", "국경 검사")}</p>
              <p className="text-xs text-muted-foreground">CFIA + CBSA</p>
            </div>
            <span className="hidden md:block">→</span>
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
              <p className="font-semibold">5. {t("Release & Label", "통관 & 라벨링")}</p>
              <p className="text-xs text-muted-foreground">{t("Comply & sell", "준수 & 판매")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SFC Licence */}
      <section id="licence">
        <h2>{t("SFC Import Licence", "SFC 수입 라이선스")}</h2>
        <p>
          {t(
            "Before you can present any food shipment at the Canadian border, you need a Safe Food for Canadians (SFC) licence with import authorization. No licence = your shipment gets turned away.",
            "캐나다 국경에 식품 화물을 제시하기 전에, 수입 허가가 있는 안전식품(SFC) 라이선스가 필요합니다. 라이선스 없음 = 화물 반송.",
          )}
        </p>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Item", "항목")}</th>
                <th>{t("Details", "상세")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Application", "신청")}</td>
                <td>{t("Online via My CFIA portal", "My CFIA 포털 온라인")}</td>
              </tr>
              <tr>
                <td>{t("Cost", "비용")}</td>
                <td>$250 CAD ({t("non-refundable", "환불 불가")})</td>
              </tr>
              <tr>
                <td>{t("Validity", "유효기간")}</td>
                <td>2 {t("years", "년")}</td>
              </tr>
              <tr>
                <td>{t("Pre-requisite", "전제조건")}</td>
                <td>{t("Preventive Control Plan (PCP) must be in place", "예방 통제 계획 (PCP) 수립 필요")}</td>
              </tr>
              <tr>
                <td>{t("Processing time", "처리 시간")}</td>
                <td>{t("Variable — CFIA may issue immediately or conduct assessment", "가변 — CFIA가 즉시 발급하거나 평가 실시 가능")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title={t("PCP for Importers", "수입업자를 위한 PCP")}>
          <p>
            {t(
              "Even though you're not manufacturing, importers need a PCP. Your plan must document: how you verify foreign supplier food safety, what happens when a product fails inspection, your recall procedures, and how you maintain traceability.",
              "제조하지 않더라도, 수입업자에게 PCP가 필요합니다. 계획에 문서화해야 할 것: 외국 공급업체의 식품 안전 검증 방법, 제품이 검사에 실패할 때의 대응, 리콜 절차, 추적성 유지 방법.",
            )}
          </p>
        </Callout>
      </section>

      {/* Tariff */}
      <section id="tariff">
        <h2>{t("Tariff Classification & HS Codes", "관세 분류 & HS 코드")}</h2>
        <p>
          {t(
            "Every food product entering Canada must be classified under the Harmonized System (HS) code. This determines your tariff rate, GST/HST application, and whether any trade agreements (CUSMA, CETA, CPTPP) apply for preferential rates.",
            "캐나다에 입국하는 모든 식품은 조화 시스템 (HS) 코드로 분류되어야 합니다. 이것이 관세율, GST/HST 적용, 무역 협정 (CUSMA, CETA, CPTPP) 특혜율 적용 여부를 결정합니다.",
          )}
        </p>

        <h3>{t("Key Food HS Chapters", "주요 식품 HS 챕터")}</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>HS {t("Chapter", "챕터")}</th>
                <th>{t("Category", "카테고리")}</th>
                <th>{t("Typical Tariff (MFN)", "일반 관세 (MFN)")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>02</td>
                <td>{t("Meat", "육류")}</td>
                <td>0-26.5%</td>
              </tr>
              <tr>
                <td>04</td>
                <td>{t("Dairy, eggs, honey", "유제품, 계란, 꿀")}</td>
                <td>{t("0-313.5% (supply-managed)", "0-313.5% (공급 관리)")}</td>
              </tr>
              <tr>
                <td>07-08</td>
                <td>{t("Vegetables & Fruits", "채소 & 과일")}</td>
                <td>0-14%</td>
              </tr>
              <tr>
                <td>09</td>
                <td>{t("Coffee, tea, spices", "커피, 차, 향신료")}</td>
                <td>0-11%</td>
              </tr>
              <tr>
                <td>15</td>
                <td>{t("Oils & fats", "유지류")}</td>
                <td>0-14%</td>
              </tr>
              <tr>
                <td>16</td>
                <td>{t("Prepared meat/fish", "가공 육류/수산물")}</td>
                <td>0-12.5%</td>
              </tr>
              <tr>
                <td>17-21</td>
                <td>{t("Sugar, cocoa, preparations", "설탕, 코코아, 조제식품")}</td>
                <td>0-15%</td>
              </tr>
              <tr>
                <td>22</td>
                <td>{t("Beverages", "음료")}</td>
                <td>0-16%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title={t("Supply-Managed Products", "공급 관리 품목")}>
          <p>
            {t(
              "Dairy, poultry, and eggs are supply-managed in Canada with tariffs up to 313.5%. Unless you have a tariff rate quota (TRQ) allocation, importing these products at commercial scale is economically impossible. This catches many first-time importers off guard.",
              "유제품, 가금류, 계란은 캐나다에서 최대 313.5%의 관세로 공급 관리됩니다. 관세율 할당량 (TRQ) 배정이 없으면, 이들 제품의 상업적 규모 수입은 경제적으로 불가능합니다. 많은 초보 수입업자가 이를 간과합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Border Process */}
      <section id="border">
        <h2>{t("Border Process Step-by-Step", "국경 통관 단계별")}</h2>
        <ol>
          <li>
            <strong>{t("Prior notice to CBSA", "CBSA 사전 통보")}</strong> — {t("Electronic notification via EDI (Electronic Data Interchange) up to 3 months before import. Required information: importer name/address/licence number, foreign supplier details, product description, HS code.", "EDI (전자 데이터 교환)를 통해 수입 최대 3개월 전 전자 통보. 필요 정보: 수입업자명/주소/라이선스 번호, 외국 공급자 상세, 제품 설명, HS 코드.")}
          </li>
          <li>
            <strong>{t("Documentation", "서류")}</strong> — {t("Commercial invoice, packing list, bill of lading, certificate of origin (for FTA preferential rates), any required import permits (e.g., for specific commodities like meat).", "상업 인보이스, 패킹 리스트, 선하증권, 원산지 증명서 (FTA 특혜율용), 필요한 수입 허가 (예: 육류 등 특정 품목).")}
          </li>
          <li>
            <strong>{t("CBSA assessment", "CBSA 평가")}</strong> — {t("Tariff classification verification, duty calculation, GST/HST assessment. Your customs broker handles this.", "관세 분류 확인, 관세 계산, GST/HST 평가. 통관 브로커가 처리.")}
          </li>
          <li>
            <strong>{t("CFIA inspection (if triggered)", "CFIA 검사 (해당 시)")}</strong> — {t("Not every shipment is inspected. CFIA uses risk-based selection. If selected: label review, temperature checks (cold chain), sampling for lab analysis. Can take 1-5 days.", "모든 화물이 검사되지는 않음. CFIA는 위험 기반 선정. 선정 시: 라벨 검토, 온도 확인 (콜드체인), 실험실 분석용 샘플링. 1-5일 소요 가능.")}
          </li>
          <li>
            <strong>{t("Release", "통관")}</strong> — {t("Once cleared by both CBSA and CFIA, goods are released to you. You're responsible for ensuring all labelling is compliant before the product reaches consumers.", "CBSA와 CFIA 모두 통과하면 화물이 반출. 제품이 소비자에게 도달하기 전 모든 라벨링의 준수를 보장하는 것은 수입업자의 책임.")}
          </li>
        </ol>

        <Callout type="tip" title={t("Use a Customs Broker", "통관 브로커를 사용하세요")}>
          <p>
            {t(
              "First-time importers should always use a licensed customs broker. They handle HS classification, duty payment, CBSA paperwork, and can navigate complications. Cost: typically $100-500 per shipment for standard entries. Worth every dollar for your first 10-20 shipments.",
              "처음 수입하는 사람은 반드시 인가된 통관 브로커를 사용해야 합니다. HS 분류, 관세 납부, CBSA 서류 처리, 복잡한 상황 대처를 담당합니다. 비용: 표준 수입 건당 일반적으로 $100-500. 처음 10-20회 수입에 매우 가치 있는 투자.",
            )}
          </p>
        </Callout>
      </section>

      {/* Relabelling */}
      <section id="labelling">
        <h2>{t("Relabelling Requirements", "재라벨링 요건")}</h2>
        <p>
          {t(
            "Foreign products almost never arrive with Canadian-compliant labels. You must relabel before selling to consumers.",
            "외국 제품은 캐나다 준수 라벨을 부착하고 오는 경우가 거의 없습니다. 소비자에게 판매하기 전에 반드시 재라벨링해야 합니다.",
          )}
        </p>

        <h3>{t("Mandatory Changes for Import", "수입 시 필수 변경")}</h3>
        <ul>
          <li>{t("Bilingual labelling (English + French) — no exceptions for imported products", "이중 언어 라벨링 (영어 + 프랑스어) — 수입 제품에 예외 없음")}</li>
          <li>{t("Canadian Nutrition Facts table format (different from US \"Nutrition Facts\" or other countries)", "캐나다 영양성분표 형식 (미국 'Nutrition Facts'나 다른 국가와 다름)")}</li>
          <li>{t("Canadian allergen declaration format (\"Contains:\" statement with all 11 priority allergens)", "캐나다 알레르겐 표시 형식 ('포함:' 문구와 11가지 우선 알레르겐)")}</li>
          <li>{t("Metric net quantity (not imperial)", "미터법 순중량 (야드파운드법 아님)")}</li>
          <li>{t("Canadian dealer name and address (your Canadian company)", "캐나다 판매자명 및 주소 (귀하의 캐나다 회사)")}</li>
          <li>{t("Country of origin declaration (\"Product of [country]\")", "원산지 표시 ('Product of [국가]')")}</li>
          <li>{t("FOP nutrition symbol if product is high in sat. fat, sugars, or sodium", "포화지방, 당류 또는 나트륨이 높은 경우 FOP 영양 심벌")}</li>
        </ul>

        <Callout type="info" title={t("Sticker Labels vs. Full Repackaging", "스티커 라벨 vs. 전체 재포장")}>
          <p>
            {t(
              "Sticker labels (applied over the original foreign label) are acceptable as long as all mandatory Canadian information is visible and legible. Full repackaging is only necessary if the original packaging doesn't meet size/format requirements or if you're rebranding.",
              "스티커 라벨 (원래 외국 라벨 위에 부착)은 모든 의무 캐나다 정보가 보이고 읽을 수 있는 한 허용됩니다. 전체 재포장은 원래 포장이 크기/형식 요건을 충족하지 못하거나 리브랜딩할 경우에만 필요합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* Common Issues */}
      <section id="common-issues">
        <h2>{t("Common Import Pitfalls", "흔한 수입 함정")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Pitfall", "함정")}</th>
                <th>{t("What Happens", "결과")}</th>
                <th>{t("How to Avoid", "방지 방법")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("No SFC licence", "SFC 라이선스 없음")}</td>
                <td>{t("Shipment refused at border. Storage fees accumulate.", "국경에서 화물 거부. 보관료 누적.")}</td>
                <td>{t("Apply 4-6 weeks before first shipment", "첫 화물 4-6주 전 신청")}</td>
              </tr>
              <tr>
                <td>{t("Wrong HS code", "잘못된 HS 코드")}</td>
                <td>{t("Overpaying duties or penalties for misclassification", "관세 과다 납부 또는 오분류 벌금")}</td>
                <td>{t("Get advance ruling from CBSA for complex products", "복잡한 제품은 CBSA 사전 판정 받기")}</td>
              </tr>
              <tr>
                <td>{t("Non-compliant labels", "미준수 라벨")}</td>
                <td>{t("Product held at border or recalled post-entry", "국경에서 제품 보류 또는 입국 후 리콜")}</td>
                <td>{t("Get labels reviewed by a regulatory consultant before shipping", "선적 전 규제 컨설턴트에게 라벨 검토 받기")}</td>
              </tr>
              <tr>
                <td>{t("Supply-managed surprise", "공급 관리 품목 불의타")}</td>
                <td>{t("300%+ tariff on dairy/poultry/eggs", "유제품/가금류/계란에 300%+ 관세")}</td>
                <td>{t("Check supply management status before sourcing", "소싱 전 공급 관리 상태 확인")}</td>
              </tr>
              <tr>
                <td>{t("Cold chain break", "콜드체인 단절")}</td>
                <td>{t("Product rejected for temperature deviation", "온도 이탈로 제품 거부")}</td>
                <td>{t("Use temperature loggers, require reefer containers", "온도 로거 사용, 냉장 컨테이너 요구")}</td>
              </tr>
              <tr>
                <td>{t("Missing traceability", "추적성 미비")}</td>
                <td>{t("CFIA audit failure, potential licence suspension", "CFIA 감사 실패, 라이선스 정지 가능")}</td>
                <td>{t("Implement lot tracking from day one", "첫날부터 로트 추적 구현")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Costs */}
      <section id="costs">
        <h2>{t("True Cost of Importing", "수입의 실제 비용")}</h2>
        <p>
          {t(
            "Beyond the product cost and tariff, importing has many additional costs that affect your margin structure.",
            "제품 비용과 관세 외에, 수입에는 마진 구조에 영향을 미치는 많은 추가 비용이 있습니다.",
          )}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Cost Item", "비용 항목")}</th>
                <th>{t("Typical Range", "일반 범위")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Tariff/duty", "관세")}</td>
                <td>0-26.5% ({t("varies by product & origin", "제품 & 원산지에 따라 다름")})</td>
              </tr>
              <tr>
                <td>GST/HST</td>
                <td>5-15% ({t("on value + duty", "가격 + 관세에 적용")})</td>
              </tr>
              <tr>
                <td>{t("Customs broker fee", "통관 브로커 비용")}</td>
                <td>$100-500/{t("shipment", "화물")}</td>
              </tr>
              <tr>
                <td>{t("Ocean freight", "해상 운임")}</td>
                <td>{t("Varies widely by origin/volume", "원산지/볼륨에 따라 큰 차이")}</td>
              </tr>
              <tr>
                <td>{t("Warehouse & handling", "창고 & 취급")}</td>
                <td>{t("$0.50-2.00/case/month", "$0.50-2.00/박스/월")}</td>
              </tr>
              <tr>
                <td>{t("Relabelling", "재라벨링")}</td>
                <td>$0.15-1.00/{t("unit", "개")}</td>
              </tr>
              <tr>
                <td>{t("CFIA inspection (if sampled)", "CFIA 검사 (샘플링 시)")}</td>
                <td>{t("Lab analysis fees + delay costs", "실험실 분석비 + 지연 비용")}</td>
              </tr>
              <tr>
                <td>{t("SFC licence", "SFC 라이선스")}</td>
                <td>$250/2 {t("years", "년")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title={t("FTA Savings", "FTA 절감")}>
          <p>
            {t(
              "Check if your source country has a Free Trade Agreement with Canada. CUSMA (US/Mexico), CETA (EU), CPTPP (11 Pacific Rim countries including Japan, Vietnam, Australia) can significantly reduce or eliminate tariffs. You need proper certificates of origin to claim preferential rates.",
              "원산지 국가가 캐나다와 자유무역협정을 맺고 있는지 확인하세요. CUSMA (미국/멕시코), CETA (EU), CPTPP (일본, 베트남, 호주 등 11개 환태평양 국가)는 관세를 상당히 줄이거나 없앨 수 있습니다. 특혜율을 받으려면 적절한 원산지 증명서가 필요합니다.",
            )}
          </p>
        </Callout>

        <p>
          {t(
            "Factor all these costs into your pricing model.",
            "이 모든 비용을 가격 모델에 반영하세요.",
          )}
          {" "}<Link href="/guides/margins" className="text-primary hover:underline">{t("→ See margin structure guide", "→ 마진 구조 가이드 보기")}</Link>
        </p>
      </section>

      {/* Resources */}
      <section id="resources">
        <h2>{t("Official Resources", "공식 리소스")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Resource", "리소스")}</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CFIA — {t("Importing Food", "식품 수입")}</td>
                <td><a href="https://inspection.canada.ca/en/food-safety-industry/importing-food" target="_blank" rel="noopener noreferrer">inspection.canada.ca</a></td>
              </tr>
              <tr>
                <td>CBSA — {t("Customs Tariff 2026", "2026 관세")}</td>
                <td><a href="https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/menu-eng.html" target="_blank" rel="noopener noreferrer">cbsa-asfc.gc.ca</a></td>
              </tr>
              <tr>
                <td>My CFIA — {t("Licence Application", "라이선스 신청")}</td>
                <td><a href="https://inspection.canada.ca/en/food-licences/obtain-licence" target="_blank" rel="noopener noreferrer">inspection.canada.ca</a></td>
              </tr>
              <tr>
                <td>SFCR — {t("Part 11 (Imports)", "Part 11 (수입)")}</td>
                <td><a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/index.html" target="_blank" rel="noopener noreferrer">laws-lois.justice.gc.ca</a></td>
              </tr>
              <tr>
                <td>{t("Trade Agreements", "무역 협정")}</td>
                <td><a href="https://www.international.gc.ca/trade-commerce/trade-agreements-accords-commerciaux/agr-acc/index.aspx" target="_blank" rel="noopener noreferrer">international.gc.ca</a></td>
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
            "@type": "HowTo",
            name: "How to Import Food Products to Canada",
            description: "Step-by-step guide for importing food to Canada including CBSA customs, CFIA licensing, and labelling requirements.",
            step: [
              { "@type": "HowToStep", name: "Obtain SFC Import Licence", text: "Apply through My CFIA portal. $250, valid 2 years." },
              { "@type": "HowToStep", name: "Classify HS Code", text: "Determine tariff classification for your product." },
              { "@type": "HowToStep", name: "Submit Prior Notice", text: "Electronic notification to CBSA via EDI." },
              { "@type": "HowToStep", name: "Clear Border Inspection", text: "CBSA customs assessment and potential CFIA inspection." },
              { "@type": "HowToStep", name: "Relabel for Canadian Market", text: "Bilingual labels, NFt, allergens, metric units." },
            ],
            author: { "@type": "Organization", name: "OHMAZE" },
          }),
        }}
      />
    </GuideArticle>
  );
}
