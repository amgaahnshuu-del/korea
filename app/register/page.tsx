"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  Globe,
  Users,
} from "lucide-react";
import { getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

function RegisterForm() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = getTranslation(locale, "register");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError(
        pick(locale, {
          mn: "Нууц үг таарахгүй байна",
          en: "Passwords do not match",
          ko: "비밀번호가 일치하지 않습니다",
        }),
      );
      return;
    }
    if (!agreed) {
      setError(
        pick(locale, {
          mn: "Үйлчилгээний нөхцөлийг зөвшөөрнө үү",
          en: "Please agree to the Terms of Service",
          ko: "이용약관에 동의해 주세요",
        }),
      );
      return;
    }
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.error ||
          pick(locale, {
            mn: "Бүртгэл амжилтгүй боллоо",
            en: "Registration failed",
            ko: "회원가입에 실패했습니다",
          }),
      );
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  const perks = [
    {
      icon: <Briefcase size={18} className="shrink-0 text-green-400" />,
      text: pick(locale, {
        mn: "15,000+ баталгаажсан ажлын байр",
        en: "15,000+ verified job listings",
        ko: "15,000개 이상 인증 공고",
      }),
    },
    {
      icon: <Globe size={18} className="shrink-0 text-green-400" />,
      text: pick(locale, {
        mn: "E-9, E-7, D-2 визний дэмжлэг",
        en: "E-9, E-7, D-2 visa guidance",
        ko: "E-9, E-7, D-2 비자 안내",
      }),
    },
    {
      icon: <Users size={18} className="shrink-0 text-green-400" />,
      text: pick(locale, {
        mn: "150,000+ Монгол нийгэмлэг",
        en: "150,000+ Mongolian community",
        ko: "150,000+ 몽골 커뮤니티",
      }),
    },
    {
      icon: <CheckCircle2 size={18} className="shrink-0 text-green-400" />,
      text: pick(locale, {
        mn: "Үнэгүй бүртгэл, нуугдмал төлбөргүй",
        en: "Free to join, no hidden fees",
        ko: "무료 가입, 숨겨진 비용 없음",
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#031B34] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <div
          className="relative hidden overflow-hidden lg:flex"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(3,27,52,0.55) 0%, rgba(5,38,74,0.45) 50%, rgba(4,23,45,0.65) 100%), url('/login-illustration.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_top,rgba(0,210,106,0.10),transparent_30%),linear-gradient(180deg,rgba(3,27,52,0.02),rgba(3,27,52,0.18))]" />

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-8 text-white">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Mongol Connect" width={120} height={40} className="h-10 w-auto object-contain" priority />
              <div className="leading-tight">
                <span className="block text-[11px] font-extrabold tracking-widest text-white">MONGOL</span>
                <span className="block text-[11px] font-extrabold tracking-widest text-[#22c55e]">CONNECT</span>
              </div>
            </div>

            <div className="max-w-[560px] pb-8">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-1.5 text-[12px] text-white/80 backdrop-blur-sm">
                <span className="font-semibold text-white">KR · MN</span>
                <span>150,000+ хэрэглэгч итгэдэг</span>
              </div>

              <h2 className="max-w-[470px] text-[46px] font-extrabold leading-[1.05] tracking-tight text-white">
                {pick(locale, {
                  mn: (
                    <>
                      Солонгосын <span className="text-[#00D26A]">#1</span>{" "}
                      Ажлын Платформд Нэгдэх
                    </>
                  ),
                  en: (
                    <>
                      Join Korea&apos;s{" "}
                      <span className="text-[#00D26A]">#1</span> Job Platform
                    </>
                  ),
                  ko: (
                    <>
                      한국 <span className="text-[#00D26A]">1위</span> 취업
                      플랫폼 가입
                    </>
                  ),
                })}
              </h2>

              <p className="mt-5 max-w-[390px] text-[15px] leading-7 text-[#B8C5D6]">
                {pick(locale, {
                  mn: "Одоо бүртгүүлж, Солонгос даяар баталгаажсан ажлын боломжуудыг судлаарай.",
                  en: "Create a free account and start exploring verified opportunities across South Korea today.",
                  ko: "무료 계정을 만들고 오늘 한국 전역의 검증된 기회를 탐색해 보세요.",
                })}
              </p>

              <div className="mt-8 space-y-3">
                {perks.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-[15px] text-white/90"
                  >
                    {p.icon}
                    <span>{p.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/35">© 2026 Mongol Connect</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center bg-gradient-to-br from-[#031B34] via-[#05264A] to-[#04172D] px-6 py-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 lg:mb-12">
              <h1 className="text-[28px] font-bold leading-tight text-white">
                {t.title}
              </h1>
              <p className="mt-1 text-[14px] text-[#B8C5D6]">
                {t.subtitle}{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#00D26A] transition hover:text-[#00C95C]"
                >
                  {t.signInLink}
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  {t.fullName}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] px-3.5 py-3.5 shadow-sm transition focus-within:border-[#00D26A] focus-within:ring-2 focus-within:ring-[#00D26A]/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#B8C5D6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={pick(locale, {
                      mn: "Бүтэн нэрээ оруулна уу",
                      en: "Enter your full name",
                      ko: "이름을 입력해 주세요",
                    })}
                    required
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#B8C5D6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  {t.emailLabel}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] px-3.5 py-3.5 shadow-sm transition focus-within:border-[#00D26A] focus-within:ring-2 focus-within:ring-[#00D26A]/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#B8C5D6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    required
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#B8C5D6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  {t.passwordLabel}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] px-3.5 py-3.5 shadow-sm transition focus-within:border-[#00D26A] focus-within:ring-2 focus-within:ring-[#00D26A]/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#B8C5D6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#B8C5D6] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="text-[#B8C5D6] transition hover:text-white"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  {t.confirmPassword}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] px-3.5 py-3.5 shadow-sm transition focus-within:border-[#00D26A] focus-within:ring-2 focus-within:ring-[#00D26A]/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#B8C5D6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#B8C5D6] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#1D3B5A] bg-transparent accent-[#00D26A]"
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-snug text-[#B8C5D6]"
                >
                  {pick(locale, {
                    mn: "Би ",
                    en: "I agree to the ",
                    ko: "다음에 동의합니다: ",
                  })}
                  <Link
                    href="#"
                    className="font-medium text-[#00D26A] hover:text-[#00C95C]"
                  >
                    {pick(locale, {
                      mn: "Үйлчилгээний нөхцөл",
                      en: "Terms of Service",
                      ko: "이용약관",
                    })}
                  </Link>
                  {pick(locale, { mn: " болон ", en: " and ", ko: " 및 " })}
                  <Link
                    href="#"
                    className="font-medium text-[#00D26A] hover:text-[#00C95C]"
                  >
                    {pick(locale, {
                      mn: "Нууцлалын бодлого",
                      en: "Privacy Policy",
                      ko: "개인정보 처리방침",
                    })}
                  </Link>
                  {pick(locale, { mn: "-г зөвшөөрч байна.", en: ".", ko: "." })}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#00C95C] to-[#00D26A] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,201,92,0.25)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading
                  ? pick(locale, {
                      mn: "Бүртгэж байна...",
                      en: "Creating account...",
                      ko: "계정 생성 중...",
                    })
                  : t.createAccount}
              </button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[#1D3B5A]" />
                <span className="text-xs font-medium text-[#B8C5D6]">
                  {t.orContinueWith}
                </span>
                <div className="h-px flex-1 bg-[#1D3B5A]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/api/auth/google"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] py-2.5 text-sm font-medium text-white transition hover:border-[#00D26A]/50 hover:bg-[rgba(7,30,56,0.95)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t.google}
                </a>
                <a
                  href="/api/auth/facebook"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#1D3B5A] bg-[rgba(7,30,56,0.8)] py-2.5 text-sm font-medium text-white transition hover:border-[#00D26A]/50 hover:bg-[rgba(7,30,56,0.95)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  {t.facebook}
                </a>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-[#B8C5D6]/70">
              © 2026 Mongol Connect ·{" "}
              <a href="#" className="hover:text-white hover:underline">
                {pick(locale, {
                  mn: "Үйлчилгээний нөхцөл",
                  en: "Terms",
                  ko: "약관",
                })}
              </a>
              {" · "}
              <a href="#" className="hover:text-white hover:underline">
                {pick(locale, { mn: "Нууцлал", en: "Privacy", ko: "개인정보" })}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
