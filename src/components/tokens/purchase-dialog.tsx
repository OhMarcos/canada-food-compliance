"use client";

import { useState, useEffect } from "react";
import { Coins, Sparkles, Zap, Rocket, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

interface PackageInfo {
  readonly id: string;
  readonly name_en: string;
  readonly name_ko: string;
  readonly tokens: number;
  readonly price_cents: number;
  readonly price_currency: string;
}

const PACKAGE_ICONS = [Sparkles, Zap, Rocket, Crown] as const;

const PACKAGE_COLORS = [
  "border-blue-200 dark:border-blue-800 hover:border-primary",
  "border-purple-200 dark:border-purple-800 hover:border-purple-500",
  "border-amber-200 dark:border-amber-800 hover:border-amber-500",
  "border-rose-200 dark:border-rose-800 hover:border-rose-500",
] as const;

const PACKAGE_BADGES = [
  null,
  null,
  { en: "Popular", ko: "인기" },
  { en: "Best Value", ko: "최고 가성비" },
] as const;

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function pricePerToken(cents: number, tokens: number): string {
  return (cents / 100 / tokens).toFixed(3);
}

export function PurchaseDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  readonly trigger?: React.ReactElement;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<readonly PackageInfo[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (!open) return;
    fetch("/api/tokens/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => setPackages([]));
  }, [open]);

  const handlePurchase = async (pkg: PackageInfo) => {
    setLoadingId(pkg.id);
    setError(null);

    try {
      const response = await fetch("/api/tokens/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setError(t("Please sign in first", "먼저 로그인해주세요") as string);
          return;
        }
        throw new Error(data.error ?? "Checkout failed");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (t("Something went wrong", "오류가 발생했습니다") as string),
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger
          render={trigger ?? <Button size="sm" variant="default" className="gap-1.5 text-xs" />}
        >
          <Coins className="size-3.5" />
          {t("Buy Tokens", "토큰 구매")}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-display)]">
            <Coins className="size-5 text-amber-500" />
            {t("Purchase Tokens", "토큰 구매")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Tokens are used for AI-powered compliance queries. Choose a package below.",
              "토큰은 AI 기반 컴플라이언스 조회에 사용됩니다. 아래에서 패키지를 선택하세요.",
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-3 py-2">
          {packages.map((pkg, i) => {
            const Icon = PACKAGE_ICONS[i] ?? Sparkles;
            const colorClass = PACKAGE_COLORS[i] ?? PACKAGE_COLORS[0];
            const badge = PACKAGE_BADGES[i];
            const isLoading = loadingId === pkg.id;

            return (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg)}
                disabled={loadingId !== null}
                className={`relative flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${colorClass} ${
                  isLoading ? "opacity-70" : "hover:shadow-md"
                } disabled:cursor-not-allowed`}
              >
                {badge && (
                  <Badge className="absolute -top-2 right-3 bg-secondary text-secondary-foreground text-[10px]">
                    {t(badge.en, badge.ko)}
                  </Badge>
                )}

                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {t(pkg.name_en, pkg.name_ko)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {pkg.tokens} {t("tokens", "토큰")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${pricePerToken(pkg.price_cents, pkg.tokens)} / {t("token", "토큰")}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {formatPrice(pkg.price_cents, pkg.price_currency)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {packages.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin mx-auto mb-2" />
              {t("Loading packages...", "패키지 로딩 중...")}
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          {t(
            "Payments are processed securely by Stripe. Tokens are non-refundable.",
            "결제는 Stripe를 통해 안전하게 처리됩니다. 토큰은 환불되지 않습니다.",
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
