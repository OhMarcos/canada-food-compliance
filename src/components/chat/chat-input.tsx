"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";

export function ChatInput({
  input,
  isLoading,
  language,
  t,
  onInputChange,
  onSend,
  onCancel,
}: {
  readonly input: string;
  readonly isLoading: boolean;
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
  readonly onInputChange: (value: string) => void;
  readonly onSend: () => void;
  readonly onCancel: () => void;
}) {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={
            t(
              "Ask about Canadian food regulations...",
              "캐나다 식품 규제에 대해 질문하세요...",
            ) as string
          }
          className="min-h-[48px] max-h-32 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        {isLoading ? (
          <Button
            onClick={onCancel}
            variant="destructive"
            className="self-end"
            aria-label={t("Cancel", "취소") as string}
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={onSend}
            disabled={!input.trim()}
            className="self-end"
          >
            <Send className="size-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {t(
          "All answers are based on actual Canadian legislation and go through 3-step verification (citation check \u2192 AI re-verification \u2192 confidence score).",
          "모든 답변은 실제 캐나다 법 조항에 기반하며, 3단계 검증(인용 확인 → AI 재검증 → 신뢰도 평가)을 거칩니다.",
        )}
      </p>
    </div>
  );
}
