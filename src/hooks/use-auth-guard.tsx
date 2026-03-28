"use client";

import { useState, useCallback } from "react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { PurchaseDialog } from "@/components/tokens/purchase-dialog";
import { useLanguage } from "@/hooks/use-language";

/**
 * Shared hook for handling 401/402 API responses across all pages.
 * 401 → shows AuthDialog (sign in)
 * 402 → shows PurchaseDialog (buy tokens)
 */
export function useAuthGuard() {
  const [authOpen, setAuthOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const { t } = useLanguage();

  const checkAuthError = useCallback(
    (response: Response): string | null => {
      if (response.status === 401) {
        setAuthOpen(true);
        return t(
          "Please sign in to use this feature.",
          "이 기능을 사용하려면 로그인이 필요합니다.",
        ) as string;
      }
      if (response.status === 402) {
        setPurchaseOpen(true);
        return t(
          "Insufficient tokens. Please purchase more tokens to continue.",
          "토큰이 부족합니다. 토큰을 추가 구매해주세요.",
        ) as string;
      }
      return null;
    },
    [t],
  );

  const authDialog = (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <PurchaseDialog open={purchaseOpen} onOpenChange={setPurchaseOpen} />
    </>
  );

  return { checkAuthError, authDialog, setAuthOpen };
}
