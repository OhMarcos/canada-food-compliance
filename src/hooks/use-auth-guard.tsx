"use client";

import { useState, useCallback } from "react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useLanguage } from "@/hooks/use-language";

/**
 * Shared hook for handling API access errors across all pages.
 *
 * Free-tier flow:
 * - 401 + GUEST_LIMIT → show AuthDialog (sign up to continue)
 * - 401 (generic) → show AuthDialog (sign in)
 * - 429 + DAILY_LIMIT → show daily limit message (no dialog)
 */
export function useAuthGuard() {
  const [authOpen, setAuthOpen] = useState(false);
  const [dailyLimitMessage, setDailyLimitMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const checkAuthError = useCallback(
    async (response: Response): Promise<string | null> => {
      if (response.status === 401) {
        setAuthOpen(true);

        // Try to parse body for GUEST_LIMIT code
        try {
          const body = await response.clone().json();
          if (body.code === "GUEST_LIMIT") {
            return t(
              "Sign up free — get AI Q&A, label scans & checklists daily",
              "무료 가입하고 AI 상담, 라벨 분석, 체크리스트를 매일 이용하세요",
            ) as string;
          }
        } catch {
          // Fallback to generic message
        }

        return t(
          "Please sign in to use this feature.",
          "이 기능을 사용하려면 로그인이 필요합니다.",
        ) as string;
      }

      if (response.status === 429) {
        try {
          const body = await response.clone().json();
          if (body.code === "DAILY_LIMIT") {
            const msg = t(
              "Daily usage limit reached. Come back tomorrow!",
              "일일 사용 한도에 도달했습니다. 내일 다시 이용해주세요!",
            ) as string;
            setDailyLimitMessage(msg);
            return msg;
          }
        } catch {
          // Fallback
        }

        return t(
          "Too many requests. Please try again later.",
          "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        ) as string;
      }

      return null;
    },
    [t],
  );

  const clearDailyLimit = useCallback(() => {
    setDailyLimitMessage(null);
  }, []);

  const authDialog = (
    <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
  );

  return {
    checkAuthError,
    authDialog,
    setAuthOpen,
    dailyLimitMessage,
    clearDailyLimit,
  };
}
