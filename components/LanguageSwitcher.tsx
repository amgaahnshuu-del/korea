"use client";

import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold ${className}`}>
      {SUPPORTED_LOCALES.map((option) => {
        const active = option.code === locale;

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLocale(option.code as Locale)}
            className={`rounded-full px-3 py-1.5 transition ${
              active ? "bg-[#22c55e] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-pressed={active}
            aria-label={option.label}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
