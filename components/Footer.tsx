"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

function FacebookIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0f2e3d" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  const { locale } = useLanguage();

  const desc = pick(locale, {
    mn: "Монголчуудыг БНСУ дахь ажил боломжуудтай холбох найдвартай платформ.",
    en: "A trusted platform connecting Mongolians with verified job opportunities in South Korea.",
    ko: "몽골인을 한국의 검증된 취업 기회와 연결하는 신뢰할 수 있는 플랫폼입니다.",
  });

  const quickLinks = [
    { href: "/jobs",      mn: "Ажлын зар",       en: "Job Listings",  ko: "채용 공고" },
    { href: "/jobs/post", mn: "Зар оруулах",      en: "Post a Job",    ko: "채용 등록" },
    { href: "/about",     mn: "Бидний тухай",     en: "About Us",      ko: "회사 소개" },
    { href: "/contact",   mn: "Холбоо барих",     en: "Contact",       ko: "문의하기" },
    { href: "/faq",       mn: "FAQ",              en: "FAQ",           ko: "자주 묻는 질문" },
  ];

  const services = [
    { mn: "Визний зөвлөгөө",          en: "Visa Consulting",         ko: "비자 상담" },
    { mn: "Ажлын байрны зуучлал",     en: "Job Placement",           ko: "취업 알선" },
    { mn: "Баримт бичгийн бүрдүүлэлт", en: "Document Preparation",   ko: "서류 준비" },
    { mn: "Солонгос хэлний сургалт",  en: "Korean Language Training", ko: "한국어 교육" },
  ];

  const copyright = pick(locale, {
    mn: "© 2026 Mongol Connect. Бүх эрх хуулиар хамгаалагдсан.",
    en: "© 2026 Mongol Connect. All rights reserved.",
    ko: "© 2026 Mongol Connect. 모든 권리 보유.",
  });

  return (
    <footer className="bg-[#0f2e3d]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <Image src="/logo.png" alt="Ajil Korea" width={48} height={48} className="shrink-0" />
              <div className="leading-tight">
                <span className="block text-[13px] font-extrabold tracking-widest text-white">MONGOL</span>
                <span className="block text-[13px] font-extrabold tracking-widest text-[#22c55e]">CONNECT</span>
              </div>
            </Link>

            <p className="mb-7 text-sm leading-relaxed text-white/55">{desc}</p>

            <div className="flex gap-2.5">
              {[
                { icon: <FacebookIcon />, label: "Facebook" },
                { icon: <YoutubeIcon />, label: "YouTube" },
                { icon: <InstagramIcon />, label: "Instagram" },
                { icon: <LinkedInIcon />, label: "LinkedIn" },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white/60 transition-all duration-200 hover:bg-[#22c55e] hover:text-white"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/45">
              {pick(locale, { mn: "Түргэн холбоос", en: "Quick Links", ko: "빠른 링크" })}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-all duration-200 hover:text-[#4ade80]"
                  >
                    {pick(locale, { mn: link.mn, en: link.en, ko: link.ko })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/45">
              {pick(locale, { mn: "Үйлчилгээ", en: "Services", ko: "서비스" })}
            </h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.mn}>
                  <Link
                    href="#"
                    className="text-sm text-white/60 transition-all duration-200 hover:text-[#4ade80]"
                  >
                    {pick(locale, { mn: s.mn, en: s.en, ko: s.ko })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/45">
              {pick(locale, { mn: "Холбоо барих", en: "Contact", ko: "연락처" })}
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#22c55e]" />
                <span className="text-sm text-white/60">
                  {pick(locale, { mn: "Улаанбаатар хот, Монгол улс", en: "Ulaanbaatar, Mongolia", ko: "울란바토르, 몽골" })}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-[#22c55e]" />
                <a href="tel:+97677487474" className="text-sm text-white/60 transition hover:text-[#4ade80]">
                  +976 77487474
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-[#22c55e]" />
                <a href="mailto:mgl.gymhub@gmail.com" className="text-sm text-white/60 transition hover:text-[#4ade80]">
                  mgl.gymhub@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe size={15} className="shrink-0 text-[#22c55e]" />
                <a href="https://www.mongolconnect.mn" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 transition hover:text-[#4ade80]">
                  www.mongolconnect.mn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/40">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
