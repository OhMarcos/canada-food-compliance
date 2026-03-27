"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ClipboardCopy, Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { ChatMessage } from "@/types/chat";

interface ReportExportProps {
  readonly question: string;
  readonly chatMessage: ChatMessage;
}

function buildReport(question: string, message: ChatMessage, isEn: boolean): string {
  const lines: string[] = [
    "====================================",
    isEn ? "  OHMAZE Compliance Report" : "  OHMAZE 컴플라이언스 리포트",
    "====================================",
    "",
    `${isEn ? "Date" : "일시"}: ${new Date().toLocaleString(isEn ? "en-US" : "ko-KR")}`,
    "",
    "------------------------------------",
    isEn ? "  Question" : "  질문",
    "------------------------------------",
    question,
    "",
    "------------------------------------",
    isEn ? "  Answer" : "  답변",
    "------------------------------------",
    message.content,
    "",
  ];

  // Verification status
  if (message.verification) {
    lines.push("------------------------------------");
    lines.push(isEn ? "  Verification Status" : "  검증 상태");
    lines.push("------------------------------------");

    const confidenceLabels: Record<string, string> = isEn
      ? { HIGH: "High Confidence", MEDIUM: "Medium Confidence", LOW: "Low Confidence", UNVERIFIED: "Unverified" }
      : { HIGH: "높은 신뢰도", MEDIUM: "보통 신뢰도", LOW: "낮은 신뢰도", UNVERIFIED: "미검증" };
    lines.push(`${isEn ? "Confidence" : "신뢰도"}: ${confidenceLabels[message.verification.confidence] ?? message.verification.confidence}`);
    lines.push(`${isEn ? "Status" : "상태"}: ${message.verification.status}`);

    if (message.verification.notes) {
      lines.push(`${isEn ? "Notes" : "비고"}: ${message.verification.notes}`);
    }

    if (message.verification.verified_citations) {
      lines.push(`${isEn ? "Verified citations" : "검증된 인용"}: ${message.verification.verified_citations.length}`);
    }

    if (message.verification.flagged_citations && message.verification.flagged_citations.length > 0) {
      lines.push(`${isEn ? "Flagged citations" : "주의 필요 인용"}: ${message.verification.flagged_citations.length}`);
    }

    lines.push("");
  }

  // Citations
  if (message.citations && message.citations.length > 0) {
    lines.push("------------------------------------");
    lines.push(isEn ? "  Legal Citations" : "  법적 인용");
    lines.push("------------------------------------");

    for (const [index, citation] of message.citations.entries()) {
      lines.push(`[${index + 1}] ${citation.regulation_name} - ${citation.section_number}`);
      lines.push(`    ${isEn ? "Excerpt" : "발췌"}: ${citation.excerpt}`);
      if (citation.official_url) {
        lines.push(`    URL: ${citation.official_url}`);
      }
      lines.push(`    ${isEn ? "Relevance" : "관련도"}: ${Math.round(citation.relevance_score * 100)}%`);
      lines.push("");
    }
  }

  // Market check
  if (message.market_check) {
    lines.push("------------------------------------");
    lines.push(isEn ? "  Market Cross-Check" : "  시장 크로스체크");
    lines.push("------------------------------------");

    if (message.market_check.similar_products.length > 0) {
      lines.push(isEn
        ? `${message.market_check.similar_products.length} similar product(s) found:`
        : `유사 제품 ${message.market_check.similar_products.length}건 발견:`);
      for (const product of message.market_check.similar_products) {
        const parts = [product.name];
        if (product.brand) parts.push(`${isEn ? "Brand" : "브랜드"}: ${product.brand}`);
        if (product.retailer) parts.push(`${isEn ? "Retailer" : "판매처"}: ${product.retailer}`);
        lines.push(`  - ${parts.join(" | ")}`);
        if (product.url) {
          lines.push(`    URL: ${product.url}`);
        }
      }
      lines.push("");
    }

    if (message.market_check.recall_history.length > 0) {
      lines.push(isEn
        ? `${message.market_check.recall_history.length} recall(s):`
        : `리콜 이력 ${message.market_check.recall_history.length}건:`);
      for (const recall of message.market_check.recall_history) {
        lines.push(`  - ${recall.product} (${recall.date})`);
        lines.push(`    ${isEn ? "Reason" : "사유"}: ${recall.reason}`);
      }
      lines.push("");
    }

    if (
      message.market_check.similar_products.length === 0 &&
      message.market_check.recall_history.length === 0
    ) {
      lines.push(isEn ? "No market data" : "시장 데이터 없음");
      lines.push("");
    }
  }

  lines.push("====================================");
  lines.push(isEn
    ? "  This report is for reference only, not legal advice."
    : "  이 리포트는 참고용이며 법적 조언이 아닙니다.");
  lines.push(isEn
    ? "  Verify actual requirements from official sources."
    : "  실제 규제 요건은 공식 출처를 확인하세요.");
  lines.push("====================================");

  return lines.join("\n");
}

export function ReportExport({ question, chatMessage }: ReportExportProps) {
  const [copied, setCopied] = useState(false);
  const { language, t } = useLanguage();
  const report = buildReport(question, chatMessage, language === "en");

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = report;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" />
        }
      >
        <FileText className="size-3.5 mr-1.5" />
        {t("Export Report", "리포트 내보내기")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("Compliance Report", "컴플라이언스 리포트")}</DialogTitle>
          <DialogDescription>
            {t(
              "Full report including question, answer, citations, and verification results.",
              "질문과 답변, 인용 및 검증 결과를 포함한 전체 리포트입니다.",
            )}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] rounded-lg border bg-muted/30 p-4">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
            {report}
          </pre>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={copyToClipboard} variant={copied ? "secondary" : "default"}>
            {copied ? (
              <>
                <Check className="size-4 mr-1.5" />
                {t("Copied!", "복사됨!")}
              </>
            ) : (
              <>
                <ClipboardCopy className="size-4 mr-1.5" />
                {t("Copy", "복사")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
