"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useTokens } from "@/hooks/use-tokens";

function SuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshBalance } = useTokens();

  // Refresh token balance after purchase
  useEffect(() => {
    if (sessionId) {
      const timer = setTimeout(() => refreshBalance(), 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, refreshBalance]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-accent" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold font-[family-name:var(--font-display)]">
              {t("Payment Successful!", "결제 완료!")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "Your tokens have been credited to your account. You can start using them right away.",
                "토큰이 계정에 충전되었습니다. 바로 사용하실 수 있습니다.",
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Coins className="size-4 text-amber-500" />
            {t(
              "Check your updated balance in the header",
              "헤더에서 업데이트된 잔액을 확인하세요",
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("Start Asking Questions", "질문 시작하기")}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {t("Back to Home", "홈으로 돌아가기")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse h-64 w-96 rounded-lg bg-muted" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
