import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getLocale } from "@/lib/i18n-server";
import { pick } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ajilkorea.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const title = pick(locale, {
    mn: "Ajil Korea - БНСУ дахь ажлын зар",
    en: "Ajil Korea - Jobs in Korea for Mongolians",
    ko: "Ajil Korea - 몽골인을 위한 한국 취업 정보",
  });

  const description = pick(locale, {
    mn: "Монголчуудыг БНСУ дахь ажлын боломжтой холбох найдвартай платформ. E-9, E-7, H-2 виз.",
    en: "A trusted platform connecting Mongolian talent with job opportunities in South Korea. E-9, E-7, H-2 visa jobs.",
    ko: "몽골 인재와 한국의 채용 기회를 연결하는 신뢰할 수 있는 플랫폼입니다. E-9, E-7, H-2 비자 구직.",
  });

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: title, template: `%s | Ajil Korea` },
    description,
    keywords: ["Mongolia Korea jobs", "한국 몽골 취업", "E-9 visa", "E-7 visa", "H-2 visa", "Ajil Korea", "БНСУ ажлын зар"],
    openGraph: {
      title,
      description,
      url: BASE_URL,
      siteName: "Ajil Korea",
      locale: locale === "mn" ? "mn_MN" : locale === "ko" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: BASE_URL,
      languages: {
        "mn": `${BASE_URL}?lang=mn`,
        "en": `${BASE_URL}?lang=en`,
        "ko": `${BASE_URL}?lang=ko`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen overflow-x-hidden bg-white text-gray-900`}>
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
