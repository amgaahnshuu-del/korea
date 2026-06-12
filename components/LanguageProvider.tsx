"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LANGUAGE_COOKIE, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function persistLocale(locale: Locale) {
  document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
}

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
