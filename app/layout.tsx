import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getLocale } from "@/lib/i18n-server";
import { pick } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: pick(locale, {
      mn: "Ajil Korea - БНСУ дахь ажлын зар",
      en: "Ajil Korea - Jobs in Korea",
      ko: "Ajil Korea - 한국 취업 정보",
    }),
    description: pick(locale, {
      mn: "Монголчуудыг БНСУ дахь ажлын боломжтой холбох найдвартай платформ.",
      en: "A trusted platform connecting Mongolian talent with opportunities in South Korea.",
      ko: "몽골 인재와 한국의 채용 기회를 연결하는 신뢰할 수 있는 플랫폼입니다.",
    }),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
