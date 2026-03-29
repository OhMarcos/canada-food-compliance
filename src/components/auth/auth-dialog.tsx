"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

type AuthMode = "sign-in" | "sign-up";

interface AuthDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Feature icons (inline SVG to avoid extra dependencies)
// ---------------------------------------------------------------------------

function ChatIcon() {
  return (
    <svg className="size-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg className="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" x2="17" y1="12" y2="12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setReferralCode("");
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const { error: authError } = await signUp(email, password, fullName);
        if (authError) {
          setError(authError.message);
          return;
        }

        if (referralCode.trim()) {
          try {
            await fetch("/api/tokens/referral", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ referral_code: referralCode.trim() }),
            });
          } catch {
            // Referral processing failed silently
          }
        }

        setSuccessMessage(
          t(
            "Check your email to confirm your account.",
            "이메일을 확인하여 계정을 인증해주세요.",
          ),
        );
      } else {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message);
          return;
        }
        onOpenChange(false);
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
    setShowEmailForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {successMessage ? (
          <div className="p-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              {successMessage}
            </div>
          </div>
        ) : (
          <>
            {/* ── Header with value prop ── */}
            <div className="bg-violet-50/80 px-6 pt-6 pb-4">
              <h2 className="text-lg font-semibold tracking-tight">
                {mode === "sign-up"
                  ? t(
                      "Your compliance expert, ready 24/7",
                      "24시간 대기 중인 컴플라이언스 전문가",
                    )
                  : t("Welcome back", "다시 오신 걸 환영합니다")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "sign-up"
                  ? t(
                      "Free sign-up. No credit card required.",
                      "무료 가입. 신용카드 필요 없음.",
                    )
                  : t(
                      "Sign in to continue your compliance work.",
                      "로그인하고 컴플라이언스 분석을 계속하세요.",
                    )}
              </p>
            </div>

            {/* ── Primary CTA: Google ── */}
            <div className="px-6 pt-5">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 border-2 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200"
                onClick={handleGoogleSignIn}
                type="button"
              >
                <GoogleIcon />
                <span className="ml-3 font-medium">
                  {t("Continue with Google", "Google로 30초 만에 시작")}
                </span>
              </Button>

              {/* Trust signals */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="size-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                  {t("Free forever", "영구 무료")}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="size-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                  {t("No credit card", "카드 불필요")}
                </span>
              </div>
            </div>

            {/* ── Value props (sign-up mode only) ── */}
            {mode === "sign-up" && (
              <div className="mx-6 mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-violet-100">
                    <ChatIcon />
                  </div>
                  <p className="text-xs font-medium">{t("AI Q&A", "AI 상담")}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {t("10x daily", "매일 10회")}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
                    <ScanIcon />
                  </div>
                  <p className="text-xs font-medium">{t("Label Scan", "라벨 분석")}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {t("3x daily", "매일 3회")}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                    <ShieldIcon />
                  </div>
                  <p className="text-xs font-medium">{t("Checklist", "체크리스트")}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {t("5x daily", "매일 5회")}
                  </p>
                </div>
              </div>
            )}

            {/* ── Secondary: Email form (collapsed) ── */}
            <div className="px-6 pt-4 pb-5">
              {!showEmailForm ? (
                <button
                  type="button"
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowEmailForm(true)}
                >
                  {t("Or use email instead", "또는 이메일로 진행")}
                </button>
              ) : (
                <>
                  <div className="relative mb-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("or", "또는")}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {mode === "sign-up" && (
                      <Input
                        type="text"
                        placeholder={t("Full name", "이름") as string}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                      />
                    )}
                    <Input
                      type="email"
                      placeholder={t("Email", "이메일") as string}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <Input
                      type="password"
                      placeholder={t("Password", "비밀번호") as string}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    />
                    {mode === "sign-up" && (
                      <Input
                        type="text"
                        placeholder={t("Referral code (optional)", "추천 코드 (선택사항)") as string}
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                    )}

                    {error && (
                      <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading
                        ? t("Please wait...", "잠시만 기다려주세요...")
                        : mode === "sign-in"
                          ? t("Sign In", "로그인")
                          : t("Sign Up", "가입하기")}
                    </Button>
                  </form>
                </>
              )}

              {/* Error display when email form is hidden */}
              {!showEmailForm && error && (
                <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* ── Footer: mode switch ── */}
            <div className="border-t px-6 py-3 text-center text-xs text-muted-foreground">
              {mode === "sign-in" ? (
                <>
                  {t("Don't have an account?", "계정이 없으신가요?")}{" "}
                  <button
                    type="button"
                    className="font-medium text-violet-600 hover:text-violet-700"
                    onClick={() => switchMode("sign-up")}
                  >
                    {t("Sign up free", "무료 가입")}
                  </button>
                </>
              ) : (
                <>
                  {t("Already have an account?", "이미 계정이 있으신가요?")}{" "}
                  <button
                    type="button"
                    className="font-medium text-violet-600 hover:text-violet-700"
                    onClick={() => switchMode("sign-in")}
                  >
                    {t("Sign in", "로그인")}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
