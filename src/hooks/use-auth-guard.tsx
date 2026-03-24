"use client";

import { useState, useCallback } from "react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useLanguage } from "@/hooks/use-language";

/**
 * Shared hook for handling 401/402 API responses across all pages.
 * Returns a response checker + the AuthDialog element to render.
 */
export function useAuthGuard() {
  const [authOpen, setAuthOpen] = useState(false);
  const { t } = useLanguage();

  /**
   * Check if a fetch response is an auth/token error.
   * Returns an error message string if handled, or null if unrelated.
   */
  const checkAuthError = useCallback(
    (response: Response): string | null => {
      if (response.status === 401) {
        setAuthOpen(true);
        return t(
          "Please sign in to use this feature.",
          "이 기능을 사용하려면 로그인이 필요합니다.",
        );
      }
      if (response.status === 402) {
        setAuthOpen(true);
        return t(
          "Insufficient tokens. Please purchase more tokens to continue.",
          "토큰이 부족합니다. 토큰을 추가 구매해주세요.",
        );
      }
      return null;
    },
    [t],
  );

  const authDialog = (
    <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
  );

  return { checkAuthError, authDialog, setAuthOpen };
}
