"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const t = getTranslation(locale, "login");
  const common = getTranslation(locale, "common");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    const msg = searchParams.get("msg");
    if (err === "google") {
      const detail = msg ? ` (${decodeURIComponent(msg)})` : "";
      setError(pick(locale, {
        mn: `Google нэвтрэлт амжилтгүй боллоо${detail}. Дахин оролдоно уу.`,
        en: `Google sign-in failed${detail}. Please try again.`,
        ko: `Google 로그인에 실패했습니다${detail}. 다시 시도해주세요.`,
      }));
    } else if (err === "facebook") {
      const detail = msg ? ` (${decodeURIComponent(msg)})` : "";
      setError(pick(locale, {
        mn: `Facebook нэвтрэлт амжилтгүй боллоо${detail}. Дахин оролдоно уу.`,
        en: `Facebook sign-in failed${detail}. Please try again.`,
        ko: `Facebook 로그인에 실패했습니다${detail}. 다시 시도해주세요.`,
      }));
    } else if (err === "blocked") {
      setError(pick(locale, {
        mn: "Таны бүртгэл блоклогдсон байна.",
        en: "Your account has been blocked.",
        ko: "계정이 차단되었습니다.",
      }));
    }
  }, [searchParams, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      if (res.status === 403 && data.error === "BLOCKED") {
        setError(pick(locale, {
          mn: "Таны бүртгэл блоклогдсон байна. Дэлгэрэнгүй мэдээлэл авахыг хүсвэл холбоо барина уу.",
          en: "Your account has been blocked by an administrator. Please contact support.",
          ko: "관리자에 의해 계정이 차단되었습니다. 고객센터에 문의하세요.",
        }));
      } else {
        setError(data.error || common.loginFailed);
      }
      return;
    }
    const role = data.user?.role;
    router.replace(role === "ADMIN" ? "/admin" : "/jobs");
    router.refresh();
  };

  const bullets = [
    pick(locale, { mn: "Баталгаажсан ажил олгогчид", en: "Verified employers", ko: "인증된 고용주" }),
    pick(locale, { mn: "Визний дэмжлэг орсон", en: "Visa support included", ko: "비자 지원 포함" }),
    pick(locale, { mn: "Бодит цагийн ажлын мэдэгдэл", en: "Real-time job alerts", ko: "실시간 채용 알림" }),
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="relative hidden w-[45%] flex-col justify-between p-10 text-white md:flex" style={{ backgroundImage: "url('/login-illustration.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-[#0b1d3a]/70" />
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
            A
          </div>
          <span className="text-lg font-bold tracking-tight">AjilKorea</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-white text-[10px] font-semibold tracking-wide">KR · MN</span>
            <span className="text-white/60">
              {pick(locale, { mn: "150,000+ хэрэглэгч итгэдэг", en: "Trusted by 150,000+ users", ko: "150,000+ 사용자 신뢰" })}
            </span>
          </div>

          <h2 className="mb-5 whitespace-pre-line text-3xl font-extrabold leading-snug tracking-tight">
            {pick(locale, {
              mn: "Таны ирээдүй\nСолонгосоос эхэлнэ",
              en: "Your Future in Korea\nStarts Here",
              ko: "한국에서의 미래가\n여기서 시작됩니다",
            })}
          </h2>

          <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/55">
            {pick(locale, {
              mn: "Монголчуудад зориулсан баталгаажсан ажлын байр, визний дэмжлэг, нийгэмлэгтэй холбогдох хамгийн найдвартай платформ.",
              en: "The most trusted platform for Mongolians to find verified employment, visa assistance, and community in South Korea.",
              ko: "몽골인을 위한 가장 신뢰받는 한국 취업·비자·커뮤니티 플랫폼입니다.",
            })}
          </p>

          <div className="space-y-3">
            {bullets.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="relative z-10 text-xs text-white/30">© 2026 AjilKorea</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f7f8fb] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">A</div>
          <span className="text-lg font-bold text-blue-900">AjilKorea</span>
        </div>

        <div className="w-full max-w-[360px]">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="mb-7 text-sm text-gray-500">{t.subtitle}</p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.emailLabel}</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">{t.forgotPassword}</Link>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t.passwordPlaceholder}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 transition hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">{t.rememberMe}</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
            >
              {loading
                ? pick(locale, { mn: "Нэвтэрч байна...", en: "Signing in...", ko: "로그인 중..." })
                : <>{t.submit} →</>
              }
            </button>

            {/* OR divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">{t.continueWith}</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t.google}
              </a>
              <a
                href="/api/auth/facebook"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t.facebook}
              </a>
            </div>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            {t.registerPrompt}{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              {t.registerLink}
            </Link>
          </p>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          © 2026 AjilKorea ·{" "}
          <a href="#" className="hover:underline">{pick(locale, { mn: "Үйлчилгээний нөхцөл", en: "Terms", ko: "약관" })}</a>
          {" · "}
          <a href="#" className="hover:underline">{pick(locale, { mn: "Нууцлал", en: "Privacy", ko: "개인정보" })}</a>
          {" · "}
          <Link href="/contact" className="hover:underline">{pick(locale, { mn: "Холбоо барих", en: "Contact", ko: "문의" })}</Link>
        </p>
      </div>
    </div>
  );
}
