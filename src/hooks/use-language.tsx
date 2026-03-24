"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Language = "en" | "ko";

interface LanguageContextValue {
  readonly language: Language;
  readonly toggleLanguage: () => void;
  readonly t: <T>(en: T, ko: T) => T;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANGUAGE_STORAGE_KEY = "cfc-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "ko" || saved === "en") return saved;
  } catch {
    // localStorage unavailable
  }
  return "en";
}

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  // Persist language preference
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // localStorage unavailable
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "ko" : "en"));
  }, []);

  const t = useCallback(
    <T,>(en: T, ko: T): T => (language === "en" ? en : ko),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
