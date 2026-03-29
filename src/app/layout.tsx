import type { Metadata } from "next";
import { Outfit, Manrope, Source_Code_Pro } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { TokenProvider } from "@/hooks/use-tokens";
import { ErrorBoundary } from "@/components/error-boundary";
import { Header } from "@/components/layout/header";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "OHMAZE — Navigate Food Compliance with Clarity",
  description:
    "AI-powered Canadian food & NHP compliance platform. Regulatory Q&A, label analysis, and compliance checklists — simplified.",
  icons: {
    icon: "/ohmaze-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${manrope.variable} ${sourceCodePro.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <TokenProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <OnboardingGuard>
                    <Header />
                    <main id="main-content" className="container mx-auto py-4 px-4 md:px-6">{children}</main>
                  </OnboardingGuard>
                </TooltipProvider>
              </LanguageProvider>
            </TokenProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
