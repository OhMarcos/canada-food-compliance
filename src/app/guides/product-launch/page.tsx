"use client";

import { GuideArticle } from "@/components/guides/guide-article";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { Callout } from "@/components/guides/callout";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";

const TOC_ITEMS = [
  { id: "before-you-start", label_en: "Before You Start", label_ko: "시작하기 전에" },
  { id: "approach-a", label_en: "Approach A: Product-First", label_ko: "접근법 A: 제품 우선" },
  { id: "approach-b", label_en: "Approach B: Consumer-Insight-First", label_ko: "접근법 B: 소비자 인사이트 우선" },
  { id: "approach-c", label_en: "Approach C: Other Methods", label_ko: "접근법 C: 기타 방법" },
  { id: "comparison", label_en: "Side-by-Side Comparison", label_ko: "비교 분석" },
  { id: "validation", label_en: "Validation Checkpoints", label_ko: "검증 체크포인트" },
  { id: "red-flags", label_en: "Red Flags & When to Pivot", label_ko: "위험 신호 & 피벗 시점" },
] as const;

export default function ProductLaunchPage() {
  const { t } = useLanguage();

  return (
    <GuideArticle
      title_en="How to Launch a Food Product in Canada"
      title_ko="캐나다에서 식품 제품을 런칭하는 방법"
      subtitle_en="Three proven approaches — and the uncomfortable truths about each one."
      subtitle_ko="3가지 검증된 접근법 — 그리고 각각에 대한 불편한 진실."
      readTime="12 min"
      date="March 2026"
      badges={["Strategy", "CPG", "Canada"]}
    >
      <TableOfContents items={TOC_ITEMS} />

      {/* Section 1 */}
      <section id="before-you-start">
        <h2>{t("Before You Start: The Two Fundamental Paths", "시작하기 전에: 두 가지 근본적 경로")}</h2>
        <p>
          {t(
            "Every food product that makes it to a retail shelf started in one of two ways. Either someone made something great and then went looking for a market. Or someone understood a market deeply and then built a product to fill a gap they saw as a consumer.",
            "소매 매장 선반에 올라간 모든 식품은 두 가지 방식 중 하나로 시작됩니다. 누군가 훌륭한 것을 만들고 시장을 찾아 나서거나. 또는 누군가 시장을 깊이 이해한 소비자로서 자신이 본 공백을 메우는 제품을 만들었습니다.",
          )}
        </p>
        <p>
          {t(
            "Neither path is inherently better. But choosing the wrong path for your situation is one of the most common — and most expensive — mistakes in CPG.",
            "어느 길이 본질적으로 더 나은 것은 아닙니다. 그러나 자신의 상황에 맞지 않는 길을 선택하는 것은 CPG에서 가장 흔하고 — 가장 비용이 많이 드는 — 실수 중 하나입니다.",
          )}
        </p>
      </section>

      {/* Approach A */}
      <section id="approach-a">
        <h2>{t("Approach A: Product-First", "접근법 A: 제품 우선")}</h2>
        <p className="text-lg font-medium italic text-muted-foreground">
          {t(
            "\"I make something great, now let me find a space for it.\"",
            "\"내가 잘 만드는 좋은 제품이 있으니, 이제 이걸 위한 공간을 찾아보자.\"",
          )}
        </p>

        <h3>{t("How It Works", "작동 방식")}</h3>
        <p>
          {t(
            "You have a product you're proud of — maybe a family recipe, a perfected formula, or something you've been making for friends and farmers markets. You know the product is good. The question is whether there's a commercial category for it and how to get in.",
            "자랑스러운 제품이 있습니다 — 가족 레시피, 완성된 포뮬라, 또는 친구들과 파머스 마켓에서 만들어온 것. 제품이 좋다는 건 알고 있습니다. 질문은 이것이 상업적 카테고리가 있는지, 어떻게 들어갈 것인지입니다.",
          )}
        </p>

        <h3>{t("When This Works", "이 방법이 통할 때")}</h3>
        <ul>
          <li>{t("The product represents genuine innovation — new format, superior nutrition, novel ingredient", "제품이 진정한 혁신을 대표할 때 — 새로운 형태, 우월한 영양, 새로운 원료")}</li>
          <li>{t("You have deep R&D or manufacturing expertise", "깊은 R&D 또는 제조 전문성이 있을 때")}</li>
          <li>{t("Premium positioning is possible (product quality justifies 40%+ margin over incumbents)", "프리미엄 포지셔닝이 가능할 때 (제품 품질이 기존 제품 대비 40%+ 마진을 정당화)")}</li>
          <li>{t("You have 18-36 months of patient capital to iterate on market fit", "시장 적합성을 반복하기 위한 18-36개월의 인내 자본이 있을 때")}</li>
        </ul>

        <h3>{t("Real Examples", "실제 사례")}</h3>
        <ul>
          <li><strong>Nutrl Vodka Soda</strong> — {t("Superior taste/quality in an emerging category. Premium positioning worked because the product was genuinely different.", "신생 카테고리에서의 우수한 맛/품질. 제품이 진정으로 차별화되어 프리미엄 포지셔닝이 성공.")}</li>
          <li><strong>Three Farmers</strong> — {t("Prairie-farmed chickpea snacks. Authentic founder story combined with genuine product quality.", "프레리 농장 병아리콩 스낵. 진정성 있는 창업자 스토리와 진정한 제품 품질의 결합.")}</li>
        </ul>

        <Callout type="warning" title={t("The Artisan Trap", "장인의 함정")}>
          <p>
            {t(
              "This is the #1 failure mode for product-first founders. The product gets rave reviews from early adopters. Farmers market sales are strong. But the cost structure doesn't work at retail scale — COGS are above 60%, margins can't support distributor + retailer cuts, and the founder won't compromise on \"purity\" for commercial viability.",
              "이것은 제품 우선 창업자의 #1 실패 모드입니다. 얼리 어답터의 극찬. 파머스 마켓 매출도 좋습니다. 하지만 소매 규모에서 비용 구조가 작동하지 않습니다 — 원가가 60% 이상이고, 마진이 유통업체 + 소매업체 몫을 감당할 수 없으며, 창업자는 상업적 실현 가능성을 위해 '순수성'을 타협하지 않습니다.",
            )}
          </p>
          <p className="mt-2 font-medium">
            {t(
              "A great product that can't clear the 4x COGS margin hurdle is a hobby, not a business.",
              "4x 원가 마진 허들을 넘지 못하는 훌륭한 제품은 취미이지, 사업이 아닙니다.",
            )}
          </p>
        </Callout>

        <h3>{t("Success Probability: ~25-30%", "성공 확률: ~25-30%")}</h3>
        <p>
          {t(
            "Relatively low because most product innovations are not as differentiated as founders believe. Market feedback comes late in the process, so you've spent significant capital before learning whether the market actually wants this.",
            "상대적으로 낮은 이유는 대부분의 제품 혁신이 창업자가 믿는 만큼 차별화되지 않기 때문입니다. 시장 피드백이 프로세스 후반에 오므로, 시장이 실제로 이것을 원하는지 알기 전에 상당한 자본을 이미 소비합니다.",
          )}
        </p>
      </section>

      {/* Approach B */}
      <section id="approach-b">
        <h2>{t("Approach B: Consumer-Insight-First", "접근법 B: 소비자 인사이트 우선")}</h2>
        <p className="text-lg font-medium italic text-muted-foreground">
          {t(
            "\"I've been buying in this category for years. I know exactly what's missing.\"",
            "\"이 카테고리에서 수년간 구매해왔다. 뭐가 빠져있는지 정확히 안다.\"",
          )}
        </p>

        <h3>{t("How It Works", "작동 방식")}</h3>
        <p>
          {t(
            "You're a heavy user in a specific food category. You've tried every product on the shelf. You know what's wrong with all of them. The gap you see isn't theoretical — you've been frustrated by it personally. So you build the product you wish existed.",
            "특정 식품 카테고리의 헤비 유저입니다. 선반 위의 모든 제품을 먹어봤습니다. 모든 제품의 문제점을 알고 있습니다. 당신이 보는 공백은 이론적인 것이 아닙니다 — 개인적으로 좌절해왔습니다. 그래서 존재했으면 하는 제품을 직접 만듭니다.",
          )}
        </p>

        <h3>{t("When This Works", "이 방법이 통할 때")}</h3>
        <ul>
          <li>{t("5+ years of deep immersion in the category as a consumer", "소비자로서 해당 카테고리에 5년 이상의 깊은 몰입")}</li>
          <li>{t("You can articulate the gap in one sentence that makes other consumers nod immediately", "다른 소비자들이 즉시 고개를 끄덕이는 한 문장으로 공백을 설명할 수 있을 때")}</li>
          <li>{t("The gap is about behavior and occasion, not just \"better ingredients\"", "공백이 단순히 '더 좋은 원료'가 아닌 행동과 상황에 관한 것일 때")}</li>
          <li>{t("You have community access — a built-in audience of people who share your frustration", "커뮤니티 접근성 — 같은 좌절을 공유하는 사람들의 내장 오디언스가 있을 때")}</li>
        </ul>

        <h3>{t("Real Examples", "실제 사례")}</h3>
        <ul>
          <li><strong>RXBar</strong> — {t("Founders were CrossFit athletes frustrated by protein bar ingredient lists. They built what they personally wanted: clean ingredients, high protein, no BS. Exit: $600M to Kellogg's.", "창업자들이 프로틴바 성분표에 좌절한 크로스핏 선수. 자신이 원하는 것을 만듦: 깨끗한 원료, 고단백, 허세 없음. EXIT: Kellogg's에 $600M.")}</li>
          <li><strong>Chobani</strong> — {t("Hamdi Ulukaya, from Turkey, couldn't find real Greek yogurt in America. He knew what good yogurt tasted like because he grew up with it.", "터키 출신 Hamdi Ulukaya, 미국에서 진짜 그릭 요거트를 찾을 수 없었음. 좋은 요거트가 어떤 맛인지 자라면서 알았기에.")}</li>
          <li><strong>Simply Protein</strong> — {t("Plant-based community members who saw protein snack options were limited for their dietary needs.", "식물성 기반 커뮤니티 멤버들이 자신의 식단 요구에 맞는 프로틴 스낵 선택지가 제한적임을 발견.")}</li>
        </ul>

        <Callout type="warning" title={t("The \"Sample of One\" Bias", "\"1명의 표본\" 편향")}>
          <p>
            {t(
              "\"I couldn't find X, so I made it\" — but sometimes the market is just you and 12 other people. Your personal frustration doesn't always scale to a commercially viable segment. Before spending $100K on development, survey 100+ people in your target demographic. Test purchase intent with mockups, not just the product concept.",
              "\"X를 못 찾아서 직접 만들었다\" — 그런데 때로는 시장이 당신과 12명뿐입니다. 개인적 좌절이 항상 상업적으로 실현 가능한 세그먼트로 확장되는 건 아닙니다. 개발에 $100K를 쓰기 전에 타겟 인구 통계에서 100명 이상을 조사하세요. 제품 컨셉이 아닌 목업으로 구매 의향을 테스트하세요.",
            )}
          </p>
        </Callout>

        <h3>{t("Success Probability: ~35-40%", "성공 확률: ~35-40%")}</h3>
        <p>
          {t(
            "Higher than product-first because market feedback is built into the approach from day one. Founders already understand purchase triggers, usage occasions, and competitive weaknesses. The brand story is naturally authentic.",
            "제품 우선보다 높은 이유는 시장 피드백이 처음부터 접근법에 내장되어 있기 때문입니다. 창업자가 이미 구매 트리거, 사용 상황, 경쟁 약점을 이해합니다. 브랜드 스토리가 자연스럽게 진정성 있습니다.",
          )}
        </p>
      </section>

      {/* Approach C */}
      <section id="approach-c">
        <h2>{t("Approach C: Other Proven Methods", "접근법 C: 기타 검증된 방법")}</h2>

        <h3>{t("Market Data-Driven", "시장 데이터 기반")}</h3>
        <p>
          {t(
            "Identify a growing category through market data (e.g., plant-based snacks growing 25% annually), then engineer a competitive product quickly. You're not innovating — you're executing. This has the highest success probability (~40-45%) but creates the weakest brand differentiation. You'll compete on price and distribution, not story.",
            "시장 데이터를 통해 성장하는 카테고리를 식별한 후(예: 연 25% 성장하는 식물성 스낵), 경쟁력 있는 제품을 빠르게 설계합니다. 혁신이 아니라 실행입니다. 가장 높은 성공 확률(~40-45%)이지만 가장 약한 브랜드 차별화를 만듭니다. 스토리가 아닌 가격과 유통으로 경쟁합니다.",
          )}
        </p>

        <h3>{t("Platform/Channel-First", "플랫폼/채널 우선")}</h3>
        <p>
          {t(
            "Design the product specifically for a platform — Amazon SEO, TikTok Shop, or DTC Shopify. The product is optimized for the channel's algorithm and buying behavior, not for retail shelves. Success probability: ~30-35%. Risk: complete platform dependency.",
            "특정 플랫폼을 위해 제품을 디자인합니다 — Amazon SEO, TikTok Shop, 또는 DTC Shopify. 제품이 소매 선반이 아닌 채널의 알고리즘과 구매 행동에 최적화됩니다. 성공 확률: ~30-35%. 리스크: 완전한 플랫폼 의존성.",
          )}
        </p>

        <h3>{t("Technology-First", "기술 우선")}</h3>
        <p>
          {t(
            "A new ingredient, process, or format that creates a genuinely novel product. Requires defensible IP or exclusive access. Success probability: ~20-25%. Highest risk but highest potential reward if the technology translates to a consumer benefit people will pay for.",
            "새로운 원료, 공정, 또는 형태로 진정으로 새로운 제품을 만듭니다. 방어 가능한 IP 또는 독점 접근이 필요합니다. 성공 확률: ~20-25%. 가장 높은 리스크지만 기술이 소비자가 지불할 혜택으로 전환되면 가장 높은 잠재적 보상.",
          )}
        </p>
      </section>

      {/* Comparison Table */}
      <section id="comparison">
        <h2>{t("Side-by-Side Comparison", "비교 분석")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Factor", "요소")}</th>
                <th>{t("Product-First", "제품 우선")}</th>
                <th>{t("Consumer-Insight", "소비자 인사이트")}</th>
                <th>{t("Data-Driven", "데이터 기반")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Success Rate", "성공률")}</td>
                <td>25-30%</td>
                <td>35-40%</td>
                <td>40-45%</td>
              </tr>
              <tr>
                <td>{t("Initial Capital", "초기 자본")}</td>
                <td>$150K-500K</td>
                <td>$75K-250K</td>
                <td>$100K-300K</td>
              </tr>
              <tr>
                <td>{t("Time to Revenue", "매출까지 시간")}</td>
                <td>12-18 {t("months", "개월")}</td>
                <td>6-12 {t("months", "개월")}</td>
                <td>9-15 {t("months", "개월")}</td>
              </tr>
              <tr>
                <td>{t("Brand Defensibility", "브랜드 방어력")}</td>
                <td>{t("High (if truly novel)", "높음 (진정 새롭다면)")}</td>
                <td>{t("High (authentic story)", "높음 (진정성 있는 스토리)")}</td>
                <td>{t("Low (execution game)", "낮음 (실행 게임)")}</td>
              </tr>
              <tr>
                <td>{t("Best For", "적합한 창업자")}</td>
                <td>{t("R&D/Chef background", "R&D/셰프 배경")}</td>
                <td>{t("Category enthusiast", "카테고리 열정가")}</td>
                <td>{t("Business operator", "비즈니스 오퍼레이터")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Validation */}
      <section id="validation">
        <h2>{t("Validation Checkpoints (All Approaches)", "검증 체크포인트 (모든 접근법)")}</h2>
        <p>
          {t(
            "Regardless of which path you take, these four questions must have clear answers before you invest serious capital:",
            "어떤 경로를 택하든, 본격적인 자본을 투입하기 전에 이 네 가지 질문에 명확한 답이 있어야 합니다:",
          )}
        </p>
        <ol>
          <li>
            <strong>{t("Unit economics", "단위 경제성")}</strong> — {t("Can you hit 40%+ gross margin at scale? If not, the math will never work in Canadian retail.", "규모에서 40%+ 총이익률을 달성할 수 있는가? 아니라면, 캐나다 소매에서 수학은 절대 맞지 않습니다.")}
            {" "}<Link href="/guides/margins" className="text-primary hover:underline">{t("→ See margin guide", "→ 마진 가이드 보기")}</Link>
          </li>
          <li>
            <strong>{t("Repeat purchase", "반복 구매")}</strong> — {t("Can you achieve >30% repeat rate within 90 days? Trial without repeat is just expensive sampling.", ">30% 반복 구매율을 90일 이내에 달성할 수 있는가? 반복 없는 체험은 비싼 샘플링일 뿐.")}</li>
          <li>
            <strong>{t("Channel fit", "채널 적합성")}</strong> — {t("Does your ideal retailer actually want this category/format?", "목표 소매업체가 실제로 이 카테고리/형태를 원하는가?")}
            {" "}<Link href="/guides/retail-landscape" className="text-primary hover:underline">{t("→ See retail guide", "→ 소매 가이드 보기")}</Link>
          </li>
          <li>
            <strong>{t("Competitive moat", "경쟁 해자")}</strong> — {t("How quickly can an incumbent copy your product? If the answer is \"6 months with a bigger budget,\" you need a different strategy.", "기존 업체가 제품을 얼마나 빨리 복제할 수 있는가? 답이 '더 큰 예산으로 6개월'이면, 다른 전략이 필요합니다.")}</li>
        </ol>
      </section>

      {/* Red Flags */}
      <section id="red-flags">
        <h2>{t("Red Flags — When to Pivot", "위험 신호 — 피벗할 때")}</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{t("Timeline", "시점")}</th>
                <th>{t("Red Flag", "위험 신호")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Month 6", "6개월")}</td>
                <td>{t("No organic word-of-mouth or social sharing. If people who try it don't tell others, the product isn't remarkable enough.", "유기적 입소문이나 소셜 공유 없음. 시도한 사람이 다른 사람에게 말하지 않으면, 제품이 충분히 주목할 만하지 않습니다.")}</td>
              </tr>
              <tr>
                <td>{t("Month 12", "12개월")}</td>
                <td>{t("Unable to achieve target gross margins. If you can't make the math work after a year of optimization, the cost structure is fundamentally broken.", "목표 총이익률 달성 불가. 1년간 최적화 후에도 수학이 안 되면, 비용 구조가 근본적으로 깨진 것.")}</td>
              </tr>
              <tr>
                <td>{t("Month 18", "18개월")}</td>
                <td>{t("Repeat purchase rate below 20%. You're spending all your money on acquisition with no retention.", "반복 구매율 20% 미만. 유지 없이 획득에만 모든 돈을 소비 중.")}</td>
              </tr>
              <tr>
                <td>{t("Month 24", "24개월")}</td>
                <td>{t("Can't secure mainstream retail distribution. If no major chain buyer says yes after 2 years, the market signal is clear.", "주요 소매 유통 확보 불가. 2년 후에도 주요 체인 바이어가 예스라고 하지 않으면, 시장 신호는 명확합니다.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title={t("The Uncomfortable Truth", "불편한 진실")}>
          <p>
            {t(
              "90% of CPG launches are incremental improvements that consumers don't value enough to switch. Passion doesn't predict success — founder enthusiasm often masks market indifference. The approach matters less than execution speed and willingness to pivot when data contradicts assumptions.",
              "CPG 런칭의 90%는 소비자가 전환할 만큼 가치를 두지 않는 점진적 개선입니다. 열정은 성공을 예측하지 못합니다 — 창업자의 열정은 종종 시장의 무관심을 가립니다. 접근법보다 실행 속도와 데이터가 가정에 반할 때 피벗할 의지가 더 중요합니다.",
            )}
          </p>
        </Callout>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to Launch a Food Product in Canada",
            description: "Three proven approaches to launching a food product — product-first, consumer-insight-first, and data-driven.",
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
