"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { VerificationBadge } from "./verification-badge";
import { CitationCard } from "./citation-card";
import { ReportExport } from "./report-export";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import type { ChatMessage } from "@/types/chat";
import { Copy, Trash2, Clock, Send } from "lucide-react";

const STORAGE_KEY = "cfc-chat-history";
const METADATA_DELIMITER = "\n\n---METADATA---\n";

const SUGGESTED_QUESTIONS = [
  {
    ko: "캐나다에 식품을 수입하려면 어떤 라이선스가 필요한가요?",
    en: "What license do I need to import food into Canada?",
  },
  {
    ko: "캐나다에서 식품 라벨에 반드시 포함해야 하는 정보는 무엇인가요?",
    en: "What information must be included on food labels in Canada?",
  },
  {
    ko: "식품 수입 시 알레르기 유발 물질 표시 요건은?",
    en: "What are the allergen labelling requirements for imported food?",
  },
  {
    ko: "캐나다 식품 수입에 필요한 예방관리계획(PCP)이란 무엇인가요?",
    en: "What is a Preventive Control Plan (PCP) required for importing food to Canada?",
  },
  {
    ko: "식품 첨가물이 캐나다에서 허가된 것인지 어떻게 확인하나요?",
    en: "How do I verify that food additives are permitted in Canada?",
  },
  {
    ko: "캐나다 영양성분표(Nutrition Facts Table) 규격은 어떻게 되나요?",
    en: "What are the Canadian Nutrition Facts Table format requirements?",
  },
] as const;

const LOADING_STEPS_EN = [
  { label: "Searching regulations...", delay: 0 },
  { label: "Generating answer...", delay: 1000 },
  { label: "Verifying...", delay: 0 },
] as const;

const LOADING_STEPS_KO = [
  { label: "RAG 검색 중...", delay: 0 },
  { label: "답변 생성 중...", delay: 1000 },
  { label: "검증 중...", delay: 0 },
] as const;

interface Message {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly chatMessage?: ChatMessage;
  readonly timestamp?: string;
  readonly processingTimeMs?: number;
}

function formatTime(isoString?: string, locale?: string): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Safe markdown renderer using react-markdown (no dangerouslySetInnerHTML).
 * Strips raw HTML from LLM output by default, preventing XSS.
 */
function MarkdownContent({ text }: { readonly text: string }) {
  return (
    <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-li:my-0 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

function LoadingSteps({ currentStep, language }: { readonly currentStep: number; readonly language: string }) {
  const steps = language === "en" ? LOADING_STEPS_EN : LOADING_STEPS_KO;
  return (
    <div className="space-y-2 p-3">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            {isDone ? (
              <span className="text-green-600 text-xs">&#10003;</span>
            ) : isActive ? (
              <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <span className="text-muted-foreground text-xs opacity-50">&#9679;</span>
            )}
            <span
              className={
                isDone
                  ? "text-muted-foreground line-through"
                  : isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground opacity-50"
              }
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChatPanel() {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQuestionHandled = useRef(false);
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as readonly Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Handle pre-filled question from URL params
  useEffect(() => {
    if (initialQuestionHandled.current) return;
    const q = searchParams.get("q");
    if (q && q.trim()) {
      initialQuestionHandled.current = true;
      setInput(q);
    }
  }, [searchParams]);

  // Save messages to localStorage (cap at 30 messages to prevent quota exhaustion)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const toStore = messages.slice(-30);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch {
        // localStorage full or unavailable
      }
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Build conversation history for API (last 3 turns)
  const buildHistory = useCallback(() => {
    return messages
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setLoadingStep(0);

    // Progress through loading steps
    const stepTimer = setTimeout(() => setLoadingStep(1), 1000);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language,
          include_market_check: false,
          history: buildHistory(),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(t(
            "Too many requests. Please try again shortly.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ));
        }
        throw new Error(t(
          `Server error (${response.status})`,
          `서버 오류 (${response.status})`,
        ));
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error(t("Unable to read response", "응답을 읽을 수 없습니다"));

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Check if metadata delimiter appeared
        const delimiterIndex = fullText.indexOf(METADATA_DELIMITER);
        if (delimiterIndex === -1) {
          setStreamingContent(fullText);
        } else {
          // Show only the text part while metadata loads
          setStreamingContent(fullText.slice(0, delimiterIndex));
          setLoadingStep(2); // verification step
        }
      }

      clearTimeout(stepTimer);

      // Parse metadata from the response
      const delimiterIndex = fullText.indexOf(METADATA_DELIMITER);
      const answerText =
        delimiterIndex >= 0 ? fullText.slice(0, delimiterIndex) : fullText;
      const metadataJson =
        delimiterIndex >= 0
          ? fullText.slice(delimiterIndex + METADATA_DELIMITER.length)
          : null;

      let chatMessage: ChatMessage | undefined;
      let processingTime: number | undefined;

      if (metadataJson) {
        try {
          const metadata = JSON.parse(metadataJson);
          chatMessage = {
            id: metadata.message_id ?? Date.now().toString(),
            role: "assistant",
            content: answerText,
            citations: metadata.citations,
            verification: metadata.verification,
            market_check: metadata.market_check,
            timestamp: new Date().toISOString(),
          };
          processingTime = metadata.processing_time_ms;
        } catch {
          // metadata parse failed, use text only
        }
      }

      const assistantMessage: Message = {
        id: chatMessage?.id ?? Date.now().toString(),
        role: "assistant",
        content: answerText,
        chatMessage,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      clearTimeout(stepTimer);

      const isRateLimited = error instanceof Error && (
        error.message.includes("Too many requests") || error.message.includes("요청이 너무 많습니다")
      );

      // Skip fallback if rate-limited (fallback endpoint will also reject)
      if (!isRateLimited) {
        try {
          const fallbackResponse = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              language,
              include_market_check: false,
            }),
          });

          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            const assistantMessage: Message = {
              id: data.message.id,
              role: "assistant",
              content: data.message.content,
              chatMessage: data.message,
              timestamp: new Date().toISOString(),
              processingTimeMs: data.processing_time_ms,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
          } else {
            throw error;
          }
        } catch {
          showError(t("An error occurred. Please try again shortly.", "오류가 발생했습니다. 잠시 후 다시 시도해주세요."));
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: t(
              "Sorry, an error occurred. Please try again shortly.",
              "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            ),
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setStreamingContent("");
          console.error("Chat error:", error);
        }
      } else {
        showError(t("Too many requests. Please try again shortly.", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."));
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: t(
            "Too many requests. Please try again shortly.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent("");
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setStreamingContent("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(t("Copied to clipboard.", "클립보드에 복사되었습니다."));
    } catch {
      showError(t("Failed to copy.", "복사에 실패했습니다."));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Bar */}
      {messages.length > 0 && (
        <div className="border-b p-3 bg-muted/30 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs text-muted-foreground"
          >
            <Trash2 className="size-3 mr-1" />
            {t("New Chat", "새 대화")}
          </Button>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {t("ClearBite Q&A", "ClearBite Q&A")}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  <>A regulatory consultation system based on Canadian food law.<br />Cites actual legislation and verifies through a 3-step process.</>,
                  <>캐나다 식품법에 기반한 규제 상담 시스템입니다.<br />실제 법 조항을 인용하고, 3단계 검증을 거쳐 답변합니다.</>,
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => sendMessage(language === "en" ? q.en : q.ko)}
                >
                  <CardContent className="p-3 text-sm">
                    {language === "en" ? q.en : q.ko}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, messageIndex) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === "user" ? "flex justify-end" : ""}`}
          >
            {message.role === "user" ? (
              <div className="space-y-0.5">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%] ml-auto">
                  {message.content}
                </div>
                {message.timestamp && (
                  <p className="text-[10px] text-muted-foreground text-right">
                    {formatTime(message.timestamp, language)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-w-[90%]">
                {/* Verification Badge */}
                {message.chatMessage?.verification && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <VerificationBadge
                      confidence={
                        message.chatMessage.verification.confidence
                      }
                      notes={message.chatMessage.verification.notes}
                      verifiedCount={
                        message.chatMessage.verification.verified_citations
                          ?.length
                      }
                      totalCount={message.chatMessage.citations?.length}
                    />
                    <span className="text-xs text-muted-foreground">
                      {t("3-step verification complete", "3단계 검증 완료")}
                    </span>
                    {message.processingTimeMs && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-3" />
                        {(message.processingTimeMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                )}

                {/* Answer Content */}
                <div className="bg-muted rounded-lg px-4 py-3 relative group">
                  <MarkdownContent text={message.content} />
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background/80"
                    title={t("Copy", "복사")}
                  >
                    <Copy className="size-3 text-muted-foreground" />
                  </button>
                </div>

                {/* Citations */}
                {message.chatMessage?.citations &&
                  message.chatMessage.citations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1">
                        <span>{t("Legal Citations", "법적 인용")}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.chatMessage.citations.length}
                        </Badge>
                      </h4>
                      <div className="space-y-1">
                        {message.chatMessage.citations.map((citation, i) => (
                          <CitationCard
                            key={i}
                            citation={citation}
                            index={i}
                            isVerified={message.chatMessage?.verification?.verified_citations?.includes(
                              citation.section_id,
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Report Export */}
                {message.chatMessage && (
                  <div className="flex items-center gap-2">
                    <ReportExport
                      question={
                        (messageIndex > 0 && messages[messageIndex - 1]?.role === "user"
                          ? messages[messageIndex - 1].content
                          : undefined) ?? message.content
                      }
                      chatMessage={message.chatMessage}
                    />
                  </div>
                )}

                {message.timestamp && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatTime(message.timestamp, language)}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Streaming content */}
        {streamingContent && (
          <div className="mb-4 space-y-3 max-w-[90%]">
            <div className="bg-muted rounded-lg px-4 py-3">
              <MarkdownContent text={streamingContent} />
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <LoadingSteps currentStep={loadingStep} language={language} />
        )}

        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(
              "Ask about Canadian food regulations...",
              "캐나다 식품 규제에 대해 질문하세요...",
            )}
            className="min-h-[48px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t(
            "All answers are based on actual Canadian legislation and go through 3-step verification (citation check \u2192 AI re-verification \u2192 confidence score).",
            "모든 답변은 실제 캐나다 법 조항에 기반하며, 3단계 검증(인용 확인 → AI 재검증 → 신뢰도 평가)을 거칩니다.",
          )}
        </p>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
