"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./use-auth";

interface TokenBalance {
  readonly balance: number;
  readonly total_earned: number;
  readonly total_spent: number;
}

interface TokenContextValue {
  readonly balance: TokenBalance | null;
  readonly loading: boolean;
  readonly refreshBalance: () => Promise<void>;
  readonly referralCode: string | null;
}

const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tokens/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setReferralCode(data.referral_code ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshBalance();
    } else {
      setBalance(null);
      setReferralCode(null);
    }
  }, [user, refreshBalance]);

  const value = useMemo(
    () => ({ balance, loading, refreshBalance, referralCode }),
    [balance, loading, refreshBalance, referralCode],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens(): TokenContextValue {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return ctx;
}
