"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { locale } = useLanguage();
  const homeHref = user ? "/jobs" : "/";

  const text = useMemo(
    () => ({
      jobs: pick(locale, { mn: "Ажлын зар", en: "Jobs", ko: "채용 공고" }),
      postJob: pick(locale, { mn: "Зар оруулах", en: "Post a Job", ko: "채용 등록" }),
      about: pick(locale, { mn: "Бидний тухай", en: "About Us", ko: "회사 소개" }),
      contact: pick(locale, { mn: "Холбоо барих", en: "Contact", ko: "문의하기" }),
      login: pick(locale, { mn: "Нэвтрэх", en: "Login", ko: "로그인" }),
      register: pick(locale, { mn: "Бүртгүүлэх", en: "Register", ko: "회원가입" }),
      admin: pick(locale, { mn: "Админ самбар", en: "Admin Dashboard", ko: "관리자 대시보드" }),
      dashboard: pick(locale, { mn: "Хяналтын самбар", en: "Dashboard", ko: "대시보드" }),
      logout: pick(locale, { mn: "Гарах", en: "Log out", ko: "로그아웃" }),
      toggleMenu: pick(locale, { mn: "Цэс нээх", en: "Toggle menu", ko: "메뉴 열기" }),
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
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={homeHref}>
              <Image src="/logo.png" alt="Ajil Korea" width={200} height={64} className="h-16 w-auto object-contain" priority />
            </Link>

            <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
              <Link href="/jobs" className="hover:text-blue-700">
                {text.jobs}
              </Link>
              <Link href="/jobs/post" className="hover:text-blue-700">
                {text.postJob}
              </Link>
              <Link href="/about" className="hover:text-blue-700">
                {text.about}
              </Link>
              <Link href="/contact" className="hover:text-blue-700">
                {text.contact}
              </Link>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700"
                >
                  {text.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  {text.register}
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={text.toggleMenu}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <Link
            href="/jobs"
            className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
            onClick={() => setMobileOpen(false)}
          >
            {text.jobs}
          </Link>
          <Link
            href="/jobs/post"
            className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
            onClick={() => setMobileOpen(false)}
          >
            {text.postJob}
          </Link>
          <Link
            href="/about"
            className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
            onClick={() => setMobileOpen(false)}
          >
            {text.about}
          </Link>
          <Link
            href="/contact"
            className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
            onClick={() => setMobileOpen(false)}
          >
            {text.contact}
          </Link>

          <div className="border-t border-gray-100 pt-2">
            {user ? (
              <>
                <p className="px-1 py-1.5 text-xs text-gray-400">
                  {user.name} · {text.role[user.role === "ADMIN" ? "ADMIN" : "USER"]}
                </p>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {text.admin}
                  </Link>
                )}
                {user.role !== "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {text.dashboard}
                  </Link>
                )}
                <button onClick={logout} className="block w-full py-2.5 text-left text-sm font-medium text-red-600">
                  {text.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {text.login}
                </Link>
                <Link
                  href="/register"
                  className="block py-2.5 text-sm font-medium text-blue-700 hover:text-blue-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {text.register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
