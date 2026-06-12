"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  FileText, Bookmark, Settings, LogOut,
  Mail, Phone, Shield, Briefcase, ChevronRight,
  KeyRound, Globe, CalendarDays,
} from "lucide-react";
import { pick, SUPPORTED_LOCALES } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

type Tab = "cv" | "mycv" | "saved" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [tab, setTab] = useState<Tab>("cv");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [cvForm, setCvForm] = useState({ name: "", phone: "" });
  const [cvSaving, setCvSaving] = useState(false);
  const [cvMsg, setCvMsg] = useState("");

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [cvText, setCvText] = useState("");
  const [cvSavingText, setCvSavingText] = useState(false);
  const [cvTextMsg, setCvTextMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) { router.push("/login"); return; }
        setProfile(data.user);
        setCvForm({ name: data.user.name, phone: data.user.phone || "" });
        setLoading(false);
      });
    fetch("/api/auth/cv")
      .then((r) => r.json())
      .then((data) => { if (data.cvText) setCvText(data.cvText); });
  }, [router]);

  const saveCvText = async () => {
    setCvSavingText(true);
    setCvTextMsg("");
    await fetch("/api/auth/cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvText }),
    });
    setCvSavingText(false);
    setCvTextMsg(pick(locale, { mn: "Хадгалагдлаа", en: "Saved", ko: "저장됨" }));
    setTimeout(() => setCvTextMsg(""), 3000);
  };

  const saveCV = async (e: React.FormEvent) => {
    e.preventDefault();
    setCvSaving(true);
    setCvMsg("");
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cvForm.name, phone: cvForm.phone }),
    });
    const data = await res.json();
    setCvSaving(false);
    if (res.ok) {
      setProfile((p) => p ? { ...p, name: data.user.name } : p);
      setCvMsg(pick(locale, { mn: "Амжилттай хадгалагдлаа", en: "Saved successfully", ko: "저장되었습니다" }));
      setTimeout(() => setCvMsg(""), 3000);
    } else {
      setCvMsg(data.error || pick(locale, { mn: "Алдаа гарлаа", en: "Error saving", ko: "저장 실패" }));
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pwForm.next !== pwForm.confirm) {
      setPwErr(pick(locale, { mn: "Нууц үг таарахгүй байна", en: "Passwords do not match", ko: "비밀번호가 일치하지 않습니다" }));
      return;
    }
    if (pwForm.next.length < 6) {
      setPwErr(pick(locale, { mn: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой", en: "Password must be at least 6 characters", ko: "비밀번호는 6자 이상이어야 합니다" }));
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (res.ok) {
      setPwForm({ current: "", next: "", confirm: "" });
      setPwMsg(pick(locale, { mn: "Нууц үг амжилттай солигдлоо", en: "Password changed successfully", ko: "비밀번호가 변경되었습니다" }));
      setTimeout(() => setPwMsg(""), 3000);
    } else {
      setPwErr(data.error || pick(locale, { mn: "Алдаа гарлаа", en: "Error", ko: "오류" }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
      </div>
    );
  }

  const sidebarItems: { id: Tab; icon: ReactNode; label: string }[] = [
    { id: "cv",       icon: <FileText size={16} />, label: pick(locale, { mn: "Миний профайл", en: "My Profile",   ko: "내 프로필" }) },
    { id: "saved",    icon: <Bookmark size={16} />, label: pick(locale, { mn: "Хадгалсан зар", en: "Saved Jobs",   ko: "저장한 공고" }) },
    { id: "settings", icon: <Settings size={16} />, label: pick(locale, { mn: "Тохиргоо",      en: "Settings",     ko: "설정" }) },
  ];

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        locale === "mn" ? "mn-MN" : locale === "ko" ? "ko-KR" : "en-US",
        { year: "numeric", month: "long" }
      )
    : "";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8">
        {/* ─── Sidebar ─── */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Gradient banner */}
            <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-800" />

            {/* Avatar overlapping banner */}
            <div className="px-5 pb-5">
              <div className="-mt-10 mb-3 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="mb-4 text-center">
                <p className="text-base font-bold text-gray-900">{profile?.name}</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{profile?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <Shield size={11} />
                  {pick(locale, { mn: "Хэрэглэгч", en: "User", ko: "사용자" })}
                </span>
              </div>

              {/* Member since */}
              {joinDate && (
                <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <CalendarDays size={12} />
                  {pick(locale, { mn: `${joinDate}-аас`, en: `Joined ${joinDate}`, ko: `${joinDate} 가입` })}
                </div>
              )}

              {/* My CV button */}
              <button
                onClick={() => setTab("mycv")}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition mb-1 ${
                  tab === "mycv"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText size={16} />
                <span className="flex-1">{pick(locale, { mn: "Миний CV", en: "My CV", ko: "내 CV" })}</span>
                {tab === "mycv" && <ChevronRight size={14} className="ml-auto opacity-70" />}
                {cvText && tab !== "mycv" && <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />}
              </button>

              {/* Nav */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      tab === item.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {tab === item.id && <ChevronRight size={14} className="ml-auto opacity-70" />}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/");
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  {pick(locale, { mn: "Гарах", en: "Log out", ko: "로그아웃" })}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main className="flex-1 min-w-0">

          {/* ── Профайл ── */}
          {tab === "cv" && (
            <div className="space-y-4">
              {/* Profile overview card */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-800" />
                <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
                  <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-blue-600 text-xl font-bold text-white shadow">
                    {profile?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 pb-1">
                    <h2 className="text-lg font-bold text-gray-900">{profile?.name}</h2>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{profile?.email}</span>
                      {profile?.phone && (
                        <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{profile.phone}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Briefcase size={14} />
                    {pick(locale, { mn: "Ажлын зар харах", en: "Browse Jobs", ko: "공고 보기" })}
                  </Link>
                </div>
              </div>

              {/* Edit form */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
                  {pick(locale, { mn: "Мэдээлэл засах", en: "Edit Profile", ko: "프로필 수정" })}
                </h3>
                <form onSubmit={saveCV} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {pick(locale, { mn: "Бүтэн нэр", en: "Full Name", ko: "이름" })}
                    </label>
                    <input
                      value={cvForm.name}
                      onChange={(e) => setCvForm({ ...cvForm, name: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {pick(locale, { mn: "И-мэйл", en: "Email", ko: "이메일" })}
                    </label>
                    <input
                      value={profile?.email || ""}
                      disabled
                      className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {pick(locale, { mn: "Утасны дугаар", en: "Phone", ko: "전화번호" })}
                    </label>
                    <input
                      value={cvForm.phone}
                      onChange={(e) => setCvForm({ ...cvForm, phone: e.target.value })}
                      placeholder="+976 XXXX XXXX"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  {cvMsg && <p className="text-sm text-green-600">{cvMsg}</p>}
                  <button
                    type="submit"
                    disabled={cvSaving}
                    className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    {cvSaving
                      ? pick(locale, { mn: "Хадгалж байна...", en: "Saving...", ko: "저장 중..." })
                      : pick(locale, { mn: "Хадгалах", en: "Save Changes", ko: "저장" })}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Миний CV ── */}
          {tab === "mycv" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">
                  {pick(locale, { mn: "Миний CV", en: "My CV", ko: "내 CV" })}
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-400">
                {pick(locale, {
                  mn: "CV-гаа доор бичнэ үү. Ажил олгогч таны CV-г харах боломжтой.",
                  en: "Write your CV below. Employers will be able to view it.",
                  ko: "아래에 CV를 작성하세요. 고용주가 확인할 수 있습니다.",
                })}
              </p>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={18}
                placeholder={pick(locale, {
                  mn: "Нэр:\nТүүх:\nАжлын туршлага:\nБоловсрол:\nУр чадвар:\n...",
                  en: "Name:\nSummary:\nWork Experience:\nEducation:\nSkills:\n...",
                  ko: "이름:\n요약:\n경력:\n학력:\n기술:\n...",
                })}
                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={saveCvText}
                  disabled={cvSavingText}
                  className="rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
                >
                  {cvSavingText
                    ? pick(locale, { mn: "Хадгалж байна...", en: "Saving...", ko: "저장 중..." })
                    : pick(locale, { mn: "Хадгалах", en: "Save", ko: "저장" })}
                </button>
                {cvTextMsg && <span className="text-sm text-green-600">{cvTextMsg}</span>}
              </div>
            </div>
          )}

          {/* ── Хадгалсан зар ── */}
          {tab === "saved" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Bookmark className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900">
                {pick(locale, { mn: "Хадгалсан зар байхгүй", en: "No saved jobs yet", ko: "저장한 공고가 없습니다" })}
              </h3>
              <p className="mb-6 text-sm text-gray-400">
                {pick(locale, {
                  mn: "Таалагдсан зарыг хадгалснаар дараа харах боломжтой.",
                  en: "Save jobs you like to review them later.",
                  ko: "마음에 드는 공고를 저장하면 나중에 확인할 수 있습니다.",
                })}
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Briefcase size={14} />
                {pick(locale, { mn: "Ажлын зар харах", en: "Browse Jobs", ko: "공고 보기" })}
              </Link>
            </div>
          )}

          {/* ── Тохиргоо ── */}
          {tab === "settings" && (
            <div className="space-y-4">
              {/* Language card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">
                    {pick(locale, { mn: "Хэл", en: "Language", ko: "언어" })}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <span className="text-sm text-gray-500">
                    {SUPPORTED_LOCALES.find((l) => l.code === locale)?.label}
                  </span>
                </div>
              </div>

              {/* Password card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <KeyRound size={16} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">
                    {pick(locale, { mn: "Нууц үг солих", en: "Change Password", ko: "비밀번호 변경" })}
                  </h3>
                </div>
                <form onSubmit={changePassword} className="space-y-4">
                  {[
                    {
                      label: pick(locale, { mn: "Одоогийн нууц үг", en: "Current Password", ko: "현재 비밀번호" }),
                      key: "current" as const,
                    },
                    {
                      label: pick(locale, { mn: "Шинэ нууц үг", en: "New Password", ko: "새 비밀번호" }),
                      key: "next" as const,
                    },
                    {
                      label: pick(locale, { mn: "Нууц үг давтах", en: "Confirm New Password", ko: "새 비밀번호 확인" }),
                      key: "confirm" as const,
                    },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {label}
                      </label>
                      <input
                        type="password"
                        value={pwForm[key]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        required
                        minLength={key !== "current" ? 6 : undefined}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  ))}
                  {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}
                  {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    {pwSaving
                      ? pick(locale, { mn: "Солж байна...", en: "Updating...", ko: "변경 중..." })
                      : pick(locale, { mn: "Нууц үг солих", en: "Change Password", ko: "비밀번호 변경" })}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
