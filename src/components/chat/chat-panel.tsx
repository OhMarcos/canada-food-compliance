"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { ChatMessage } from "@/types/chat";
import { Trash2 } from "lucide-react";

import { STORAGE_KEY_FOOD, STORAGE_KEY_NHP, METADATA_DELIMITER, type Message, type CrossDomainInfo } from "./chat-constants";
import type { ProductDomain } from "@/lib/rag/domain-classifier";
import { stripCitationJson } from "./strip-citations";
import { MarkdownContent } from "./markdown-content";
import { LoadingSteps } from "./loading-steps";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";

export function ChatPanel({ domain = "food" }: { readonly domain?: ProductDomain }) {
  const searchParams = useSearchParams();
  const storageKey = domain === "nhp" ? STORAGE_KEY_NHP : STORAGE_KEY_FOOD;
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQuestionHandled = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();
  const { checkAuthError, authDialog } = useAuthGuard();

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
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
        localStorage.setItem(storageKey, JSON.stringify(toStore));
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

  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setStreamingContent("");
    setLoadingStep(0);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
        signal: controller.signal,
      });

      if (!response.ok) {
        const authError = checkAuthError(response);
        if (authError) throw new Error(authError);
        if (response.status === 429) {
          throw new Error(t(
            "Too many requests. Please try again shortly.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ) as string);
        }
        let serverDetail = "";
        try {
          const errBody = await response.json();
          serverDetail = errBody.debug || errBody.error || "";
        } catch { /* ignore parse errors */ }
        console.error(`Chat stream failed: ${response.status}`, serverDetail);
        throw new Error(t(
          `Server error (${response.status})${serverDetail ? `: ${serverDetail}` : ""}`,
          `서버 오류 (${response.status})${serverDetail ? `: ${serverDetail}` : ""}`,
        ) as string);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error(t("Unable to read response", "응답을 읽을 수 없습니다") as string);

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        const delimiterIndex = fullText.indexOf(METADATA_DELIMITER);
        if (delimiterIndex === -1) {
          // Strip citation JSON during streaming so raw JSON doesn't flash
          setStreamingContent(stripCitationJson(fullText));
        } else {
          setStreamingContent(stripCitationJson(fullText.slice(0, delimiterIndex)));
          setLoadingStep(2);
        }
      }

      clearTimeout(stepTimer);

      const delimiterIndex = fullText.indexOf(METADATA_DELIMITER);
      const rawAnswerText =
        delimiterIndex >= 0 ? fullText.slice(0, delimiterIndex) : fullText;
      const metadataJson =
        delimiterIndex >= 0
          ? fullText.slice(delimiterIndex + METADATA_DELIMITER.length)
          : null;

      let chatMessage: ChatMessage | undefined;
      let processingTime: number | undefined;
      let crossDomain: CrossDomainInfo | undefined;
      // Use server-stripped answer if available, otherwise strip client-side
      let answerText = stripCitationJson(rawAnswerText);

      if (metadataJson) {
        try {
          const metadata = JSON.parse(metadataJson);
          // Prefer server-side clean answer (more reliable stripping)
          if (metadata.clean_answer) {
            answerText = metadata.clean_answer;
          }
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
          if (metadata.cross_domain) {
            crossDomain = {
              suggestedDomain: metadata.cross_domain.suggested_domain,
              reason: metadata.cross_domain.reason,
            };
          }
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
        crossDomain,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      clearTimeout(stepTimer);

      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const isRateLimited = error instanceof Error && (
        error.message.includes("Too many requests") || error.message.includes("요청이 너무 많습니다")
      );
      const isAuthError = error instanceof Error && (
        error.message.includes("sign in") || error.message.includes("로그인") ||
        error.message.includes("token") || error.message.includes("토큰")
      );

      if (!isRateLimited && !isAuthError) {
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
              crossDomain: data.cross_domain ? {
                suggestedDomain: data.cross_domain.suggested_domain,
                reason: data.cross_domain.reason,
              } : undefined,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
          } else {
            throw error;
          }
        } catch {
          showError(t("An error occurred. Please try again shortly.", "오류가 발생했습니다. 잠시 후 다시 시도해주세요.") as string);
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: t(
              "Sorry, an error occurred. Please try again shortly.",
              "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            ) as string,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setStreamingContent("");
          console.error("Chat error:", error);
        }
      } else if (isAuthError) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: error instanceof Error ? error.message : "",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent("");
      } else {
        showError(t("Too many requests. Please try again shortly.", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.") as string);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: t(
            "Too many requests. Please try again shortly.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ) as string,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent("");
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setStreamingContent("");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(t("Copied to clipboard.", "클립보드에 복사되었습니다.") as string);
    } catch {
      showError(t("Failed to copy.", "복사에 실패했습니다.") as string);
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
          <SuggestedQuestions
            language={language}
            t={t}
            onSelect={sendMessage}
            domain={domain}
          />
        )}

        <ChatMessageList
          messages={messages}
          language={language}
          t={t}
          onCopy={copyToClipboard}
        />

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
      <ChatInput
        input={input}
        isLoading={isLoading}
        language={language}
        t={t}
        onInputChange={setInput}
        onSend={() => sendMessage(input)}
        onCancel={cancelStreaming}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {authDialog}
    </div>
  );
}
