"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Copy } from "lucide-react";
import { VerificationBadge } from "./verification-badge";
import { CitationCard } from "./citation-card";
import { ReportExport } from "./report-export";
import { MarkdownContent } from "./markdown-content";
import type { Message } from "./chat-constants";

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

function UserMessage({
  message,
  language,
}: {
  readonly message: Message;
  readonly language: string;
}) {
  return (
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
  );
}

function AssistantMessage({
  message,
  messages,
  messageIndex,
  language,
  t,
  onCopy,
}: {
  readonly message: Message;
  readonly messages: readonly Message[];
  readonly messageIndex: number;
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
  readonly onCopy: (text: string) => void;
}) {
  return (
    <div className="space-y-3 max-w-[90%]">
      {/* Verification Badge */}
      {message.chatMessage?.verification && (
        <div className="flex items-center gap-2 flex-wrap">
          <VerificationBadge
            confidence={message.chatMessage.verification.confidence}
            notes={message.chatMessage.verification.notes}
            verifiedCount={message.chatMessage.verification.verified_citations?.length}
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
          onClick={() => onCopy(message.content)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background/80"
          title={t("Copy", "복사") as string}
        >
          <Copy className="size-3 text-muted-foreground" />
        </button>
      </div>

      {/* Citations */}
      {message.chatMessage?.citations && message.chatMessage.citations.length > 0 && (
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
  );
}

export function ChatMessageList({
  messages,
  language,
  t,
  onCopy,
}: {
  readonly messages: readonly Message[];
  readonly language: string;
  readonly t: (en: React.ReactNode, ko: React.ReactNode) => React.ReactNode;
  readonly onCopy: (text: string) => void;
}) {
  return (
    <>
      {messages.map((message, messageIndex) => (
        <div
          key={message.id}
          className={`mb-4 ${message.role === "user" ? "flex justify-end" : ""}`}
        >
          {message.role === "user" ? (
            <UserMessage message={message} language={language} />
          ) : (
            <AssistantMessage
              message={message}
              messages={messages}
              messageIndex={messageIndex}
              language={language}
              t={t}
              onCopy={onCopy}
            />
          )}
        </div>
      ))}
    </>
  );
}
