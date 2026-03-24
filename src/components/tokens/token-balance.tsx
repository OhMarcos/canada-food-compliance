"use client";

import { useState } from "react";
import { Coins, LogOut, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTokens } from "@/hooks/use-tokens";
import { useLanguage } from "@/hooks/use-language";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function TokenBalance() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { balance, referralCode } = useTokens();
  const { t } = useLanguage();
  const [authOpen, setAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyReferralCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
    );
  }

  // Not signed in
  if (!user) {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          className="text-xs"
          onClick={() => setAuthOpen(true)}
        >
          {t("Sign In", "로그인")}
        </Button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  // Signed in — show balance + dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" />
        }
      >
        <Coins className="size-3.5 text-amber-500" />
        <span className="font-semibold tabular-nums">
          {balance?.balance ?? "—"}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">
            {user.user_metadata?.full_name ?? user.email}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>{t("Balance", "잔액")}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {balance?.balance ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("Total Earned", "총 획득")}</span>
            <span className="tabular-nums">{balance?.total_earned ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("Total Spent", "총 사용")}</span>
            <span className="tabular-nums">{balance?.total_spent ?? 0}</span>
          </div>
        </div>

        {referralCode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyReferralCode}>
              {copied ? (
                <Check className="mr-2 size-3.5 text-green-500" />
              ) : (
                <Copy className="mr-2 size-3.5" />
              )}
              <span className="text-xs">
                {t("Copy referral:", "추천 코드:")}{" "}
                <code className="font-mono">{referralCode}</code>
              </span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 size-3.5" />
          <span>{t("Sign Out", "로그아웃")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
