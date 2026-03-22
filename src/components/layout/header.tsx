"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const NAV_ITEMS = [
  { href: "/", label_ko: "대시보드", label_en: "Dashboard" },
  { href: "/chat", label_ko: "Q&A 상담", label_en: "Q&A Chat" },
  { href: "/product-check", label_ko: "제품 분석", label_en: "Product Check" },
  { href: "/checklist", label_ko: "체크리스트", label_en: "Checklist" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm"
      >
        {t("Skip to main content", "본문으로 건너뛰기")}
      </a>

      <header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link
              href="/"
              className="mr-6 flex items-center space-x-2"
              aria-label={t("Go to home", "홈으로")}
            >
              <span className="font-[family-name:var(--font-display)] font-extrabold text-lg tracking-tight">
                <span className="text-primary">Clear</span>
                <span>Bite</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center space-x-4 text-sm font-medium"
              aria-label={t("Main navigation", "주요 탐색")}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`transition-colors ${
                    isActive(pathname, item.href)
                      ? "text-foreground font-semibold"
                      : "text-foreground/60 hover:text-foreground/80"
                  }`}
                >
                  {language === "en" ? item.label_en : item.label_ko}
                </Link>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="text-xs"
              aria-label={t("한국어로 전환", "Switch to English")}
            >
              {language === "en" ? "KO" : "EN"}
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t(
                mobileMenuOpen ? "Close menu" : "Open menu",
                mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기",
              )}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background" id="mobile-navigation">
            <nav
              className="container py-3 flex flex-col space-y-1"
              aria-label={t("Mobile navigation", "모바일 탐색")}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive(pathname, item.href)
                      ? "bg-primary/10 text-foreground font-semibold"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {language === "en" ? item.label_en : item.label_ko}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
