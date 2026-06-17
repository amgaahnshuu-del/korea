"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const BG_IMAGES = ["/hero-bg.jpg", "/hero-bg-2.jpg", "/hero-bg-3.jpg"];

const CATEGORIES = [
  { key: "Manufacturing",    href: "/jobs?category=Manufacturing",     mn: "Үйлдвэрлэл",             en: "Manufacturing",  ko: "제조업" },
  { key: "IT & Tech",        href: "/jobs?category=IT+%26+Tech",        mn: "IT & Технологи",          en: "IT & Tech",      ko: "IT & 기술" },
  { key: "Food & Beverage",  href: "/jobs?category=Food+%26+Beverage",  mn: "Хоол хүнс & Үйлчилгээ",  en: "Food & Service", ko: "식음료" },
  { key: "Construction",     href: "/jobs?category=Construction",       mn: "Барилга",                 en: "Construction",   ko: "건설" },
];

export default function Hero() {
  const { locale } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-120 items-center overflow-hidden bg-[#0f2e3d] sm:min-h-175">
      {/* ── Slideshow background images ──────────────────────────────── */}
      <div className="absolute inset-0">
        {BG_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Seoul South Korea skyline"
            fill
            className={`object-cover object-center transition-opacity duration-1000 ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
            quality={85}
            sizes="100vw"
          />
        ))}
        {/* Gradient overlay: dark teal left → transparent right */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,46,61,0.96) 0%, rgba(15,46,61,0.78) 45%, rgba(15,46,61,0.15) 100%)",
          }}
        />
      </div>

      {/* ── Foreground content (left-aligned) ───────────────────────── */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10 sm:py-24 lg:px-14">
          <div className="max-w-2xl">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-[11px] font-medium text-[#4ade80] sm:mb-7 sm:gap-2.5 sm:px-4 sm:py-2 sm:text-[13px]"
            >
              <Volume2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {pick(locale, {
                mn: "БНСУ-д ажил хийх хамгийн найдвартай систем",
                en: "The most trusted job platform for Mongolians in Korea",
                ko: "한국 취업을 위한 가장 신뢰할 수 있는 시스템",
              })}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mb-4 text-[2rem] font-extrabold leading-[1.18] tracking-tight text-white sm:mb-5 sm:text-[3rem] lg:text-[3.75rem]"
            >
              {pick(locale, { mn: "БНСУ-д ажил хийх", en: "Find Your Dream Job", ko: "한국에서 원하는 일자리" })}
              <br />
              <span className="text-[#22c55e]">
                {pick(locale, { mn: "хамгийн найдвартай", en: "in South Korea", ko: "지금 바로 찾으세요" })}
              </span>
              <br />
              {pick(locale, { mn: "систем.", en: "with Mongol Connect.", ko: "몽골 커넥트와 함께." })}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mb-7 text-sm leading-relaxed text-white/70 sm:mb-10 sm:text-base"
            >
              {pick(locale, {
                mn: "Монголчуудыг БНСУ дахь ажил боломжуудтай холбох найдвартай платформ.",
                en: "A trusted platform connecting Mongolians with verified job opportunities in South Korea.",
                ko: "몽골인을 한국의 검증된 취업 기회와 연결하는 신뢰할 수 있는 플랫폼입니다.",
              })}
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              action="/jobs"
              method="get"
              className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30 sm:mb-8 sm:flex sm:h-13"
            >
              {/* Job keyword */}
              <label className="flex cursor-text items-center gap-3 border-b border-gray-100 px-5 py-3 sm:flex-1 sm:border-b-0 sm:py-0">
                <Search className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder={pick(locale, {
                    mn: "Ажлын нэр, түлхүүр үг эсвэл...",
                    en: "Job title, keyword...",
                    ko: "직책, 키워드...",
                  })}
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />
              </label>

              {/* Divider — desktop only */}
              <div className="my-3 hidden w-px bg-gray-200 sm:block" />

              {/* Location + button row on mobile */}
              <div className="flex">
                <label className="flex flex-1 cursor-text items-center gap-1.5 px-5 py-3 sm:w-44 sm:flex-none sm:py-0 sm:pr-4">
                  <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    placeholder={pick(locale, {
                      mn: "Сөүл, Пусан, Инчон..",
                      en: "Seoul, Busan, Incheon..",
                      ko: "서울, 부산, 인천..",
                    })}
                    className="w-full bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </label>

                {/* Search button */}
                <button
                  type="submit"
                  className="shrink-0 px-5 py-3 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110 sm:h-full sm:min-w-38 sm:px-7 sm:text-[15px]"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  <span className="sm:hidden">{pick(locale, { mn: "Хайх", en: "Search", ko: "검색" })}</span>
                  <span className="hidden sm:inline">{pick(locale, { mn: "Ажлын байр хайх", en: "Search Jobs", ko: "채용 검색" })}</span>
                </button>
              </div>
            </motion.form>

            {/* Popular categories — underline text links */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span className="text-sm text-white/50">
                {pick(locale, { mn: "Алдартай:", en: "Popular:", ko: "인기:" })}
              </span>
              {CATEGORIES.map((cat, i) => (
                <span key={cat.key} className="flex items-center gap-3">
                  {i > 0 && <span className="text-white/25">·</span>}
                  <Link
                    href={cat.href}
                    className="text-sm text-white/75 underline underline-offset-2 transition-all duration-200 hover:text-[#22c55e]"
                  >
                    {pick(locale, { mn: cat.mn, en: cat.en, ko: cat.ko })}
                  </Link>
                </span>
              ))}
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
