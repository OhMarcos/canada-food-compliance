import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { TokenProvider } from "@/hooks/use-tokens";
import { ErrorBoundary } from "@/components/error-boundary";
import { Header } from "@/components/layout/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ClearBite — Canadian Food Compliance",
  description:
    "Navigate Canadian food compliance with clarity. AI-powered regulatory Q&A with 3-step verification, product label analysis, and compliance checklists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <TokenProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <Header />
                  <main id="main-content" className="container mx-auto py-4 px-4 md:px-6">{children}</main>
                </TooltipProvider>
              </LanguageProvider>
            </TokenProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
