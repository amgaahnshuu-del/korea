"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { locale } = useLanguage();
  const homeHref = user ? "/jobs" : "/";

  const text = useMemo(
    () => ({
      jobs:        pick(locale, { mn: "Ажлын зар",        en: "Jobs",          ko: "채용 공고" }),
      postJob:     pick(locale, { mn: "Зар оруулах",       en: "Post a Job",    ko: "채용 등록" }),
      about:       pick(locale, { mn: "Бидний тухай",      en: "About Us",      ko: "회사 소개" }),
      contact:     pick(locale, { mn: "Холбоо барих",      en: "Contact",       ko: "문의하기" }),
      login:       pick(locale, { mn: "Нэвтрэх",           en: "Login",         ko: "로그인" }),
      register:    pick(locale, { mn: "Бүртгүүлэх",        en: "Register",      ko: "회원가입" }),
      admin:       pick(locale, { mn: "Админ самбар",       en: "Admin Dashboard", ko: "관리자 대시보드" }),
      dashboard:   pick(locale, { mn: "Хяналтын самбар",   en: "Dashboard",     ko: "대시보드" }),
      logout:      pick(locale, { mn: "Гарах",             en: "Log out",       ko: "로그아웃" }),
      toggleMenu:  pick(locale, { mn: "Цэс нээх",          en: "Toggle menu",   ko: "메뉴 열기" }),
      role: pick(locale, {
        mn: { ADMIN: "Админ", USER: "Ажил хайгч" },
        en: { ADMIN: "Admin", USER: "User" },
        ko: { ADMIN: "관리자", USER: "사용자" },
      }),
    }),
    [locale],
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const NAV_LINKS = [
    { href: "/jobs",      label: text.jobs },
    { href: "/jobs/post", label: text.postJob },
    { href: "/about",     label: text.about },
    { href: "/contact",   label: text.contact },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-bs-[#0c2733] bg-[#163c4e] shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-[#163c4e]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={homeHref} className="flex shrink-0 items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Mongol Connect"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
              <div className="hidden leading-tight sm:block">
                <span className="text-[11px] font-extrabold tracking-widest text-white">MONGOL</span>
                <span className="text-[11px] font-extrabold tracking-widest text-[#22c55e] ml-2">CONNECT</span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 text-sm font-medium text-white md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-2 transition-all duration-200  hover:text-[#16a34a]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex ">
            {authLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-gray-100" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    dropdownOpen
                      ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#16a34a]"
                      : "border-[#23be5c] bg-[#22c55e] text-gray-700  hover:text-[#16a34a]"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#22c55e] to-[#16a34a] text-xs font-bold text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] text-white truncate">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                    <div className="border-b border-gray-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#22c55e] to-[#16a34a] text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="truncate text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      {user.role === "ADMIN" ? (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-[#22c55e]/10 hover:text-[#16a34a]"
                        >
                          <ShieldCheck size={15} className="text-[#22c55e]" />
                          {text.admin}
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-[#22c55e]/10 hover:text-[#16a34a]"
                        >
                          <LayoutDashboard size={15} className="text-[#22c55e]" />
                          {text.dashboard}
                        </Link>
                      )}
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={15} />
                        {text.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:text-[#16a34a]"
                >
                  {text.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#22c55e] px-5 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#16a34a] hover:shadow-md hover:shadow-[#22c55e]/25"
                >
                  {text.register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-xl p-2 text-white transition-all duration-200 hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={text.toggleMenu}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-[#22c55e]/10 hover:text-[#16a34a]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-gray-100 pt-3">
            {authLoading ? (
              <div className="mx-1 my-2 h-8 w-32 animate-pulse rounded-full bg-gray-100" />
            ) : user ? (
              <>
                <p className="mb-2 px-3 text-xs text-gray-400">
                  {user.name} · {text.role[user.role === "ADMIN" ? "ADMIN" : "USER"]}
                </p>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#16a34a]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <ShieldCheck size={15} /> {text.admin}
                  </Link>
                )}
                {user.role !== "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#16a34a]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={15} /> {text.dashboard}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500"
                >
                  <LogOut size={15} /> {text.logout}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {text.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#22c55e] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {text.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
