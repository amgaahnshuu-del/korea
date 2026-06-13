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
  KeyRound, Globe, CalendarDays, Bell, User,
  CheckCircle2, Clock, MapPin, ArrowRight,
} from "lucide-react";
import { pick, SUPPORTED_LOCALES } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface Profile { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string }
interface CVData {
  id: string; fullName: string; phone: string | null; email: string;
  dateOfBirth: string | null; gender: string | null; nationality: string | null;
  education: string | null; experience: string | null; skills: string | null;
  selfIntroduction: string | null; resumeUrl: string | null;
}
interface SavedJob {
  id: string; createdAt: string;
  job: { id: string; title: string; location: string; type: string; salaryMin: number | null; salaryMax: number | null; expiresAt: string | null; company: { name: string; logo: string | null; verified: boolean } };
}
interface Notif { id: string; title: string; message: string; isRead: boolean; createdAt: string }

type Tab = "cv" | "mycv" | "saved" | "notifications" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [tab, setTab] = useState<Tab>("cv");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [cvForm, setCvForm] = useState({ name: "", phone: "" });
  const [cvSaving, setCvSaving] = useState(false);
  const [cvMsg, setCvMsg] = useState("");

  // Password
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  // Structured CV
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [cvText, setCvText] = useState("");
  const [cvFormData, setCvFormData] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "", gender: "",
    nationality: "", education: "", experience: "", skills: "", selfIntroduction: "", resumeUrl: "",
  });
  const [cvStructuredSaving, setCvStructuredSaving] = useState(false);
  const [cvStructuredMsg, setCvStructuredMsg] = useState("");

  // Saved jobs
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

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
      .then((data) => {
        if (data.cvText) setCvText(data.cvText);
        if (data.cv) {
          setCvData(data.cv);
          setCvFormData({
            fullName: data.cv.fullName || "",
            phone: data.cv.phone || "",
            email: data.cv.email || "",
            dateOfBirth: data.cv.dateOfBirth || "",
            gender: data.cv.gender || "",
            nationality: data.cv.nationality || "",
            education: data.cv.education || "",
            experience: data.cv.experience || "",
            skills: data.cv.skills || "",
            selfIntroduction: data.cv.selfIntroduction || "",
            resumeUrl: data.cv.resumeUrl || "",
          });
        }
      });
  }, [router]);

  useEffect(() => {
    if (tab === "saved" && savedJobs.length === 0) loadSaved();
    if (tab === "notifications") loadNotifs();
  }, [tab]);

  const loadSaved = async () => {
    setSavedLoading(true);
    const res = await fetch("/api/favorites");
    const data = await res.json();
    setSavedJobs(data.favorites || []);
    setSavedLoading(false);
  };

  const loadNotifs = async () => {
    setNotifsLoading(true);
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifs(data.notifications || []);
    setUnread(data.unreadCount || 0);
    setNotifsLoading(false);
  };

  const unsaveJob = async (jobId: string) => {
    await fetch(`/api/favorites/${jobId}`, { method: "DELETE" });
    setSavedJobs((prev) => prev.filter((f) => f.job.id !== jobId));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCvSaving(true); setCvMsg("");
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

  const saveStructuredCV = async (e: React.FormEvent) => {
    e.preventDefault();
    setCvStructuredSaving(true); setCvStructuredMsg("");
    const res = await fetch("/api/auth/cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cvFormData),
    });
    const data = await res.json();
    setCvStructuredSaving(false);
    if (res.ok) {
      setCvData(data.cv);
      setCvStructuredMsg(pick(locale, { mn: "CV амжилттай хадгалагдлаа", en: "CV saved successfully", ko: "CV 저장됨" }));
      setTimeout(() => setCvStructuredMsg(""), 3000);
    } else {
      setCvStructuredMsg(data.error || pick(locale, { mn: "Алдаа гарлаа", en: "Error", ko: "오류" }));
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pwForm.next !== pwForm.confirm) { setPwErr(pick(locale, { mn: "Нууц үг таарахгүй байна", en: "Passwords do not match", ko: "비밀번호 불일치" })); return; }
    if (pwForm.next.length < 6) { setPwErr(pick(locale, { mn: "Хамгийн багадаа 6 тэмдэгт", en: "At least 6 characters", ko: "6자 이상" })); return; }
    setPwSaving(true);
    const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }) });
    const data = await res.json();
    setPwSaving(false);
    if (res.ok) { setPwForm({ current: "", next: "", confirm: "" }); setPwMsg(pick(locale, { mn: "Нууц үг солигдлоо", en: "Password changed", ko: "변경됨" })); setTimeout(() => setPwMsg(""), 3000); }
    else setPwErr(data.error || pick(locale, { mn: "Алдаа гарлаа", en: "Error", ko: "오류" }));
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" /></div>;

  const sidebarItems: { id: Tab; icon: ReactNode; label: string; badge?: number }[] = [
    { id: "cv",            icon: <User size={16} />,      label: pick(locale, { mn: "Миний профайл",  en: "My Profile",    ko: "내 프로필" }) },
    { id: "mycv",          icon: <FileText size={16} />,  label: pick(locale, { mn: "Миний CV",       en: "My CV",         ko: "내 CV" }) },
    { id: "saved",         icon: <Bookmark size={16} />,  label: pick(locale, { mn: "Хадгалсан зар", en: "Saved Jobs",    ko: "저장한 공고" }) },
    { id: "notifications", icon: <Bell size={16} />,      label: pick(locale, { mn: "Мэдэгдэл",       en: "Notifications", ko: "알림" }), badge: unread },
    { id: "settings",      icon: <Settings size={16} />,  label: pick(locale, { mn: "Тохиргоо",       en: "Settings",      ko: "설정" }) },
  ];

  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(locale === "mn" ? "mn-MN" : locale === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "long" }) : "";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-24 bg-linear-to-br from-blue-600 to-blue-800" />
            <div className="px-5 pb-5">
              <div className="-mt-10 mb-3 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mb-4 text-center">
                <p className="text-base font-bold text-gray-900">{profile?.name}</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{profile?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"><Shield size={11} />{pick(locale, { mn: "Хэрэглэгч", en: "User", ko: "사용자" })}</span>
              </div>
              {joinDate && <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-gray-400"><CalendarDays size={12} />{pick(locale, { mn: `${joinDate}-аас`, en: `Joined ${joinDate}`, ko: `${joinDate} 가입` })}</div>}
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button key={item.id} onClick={() => { setTab(item.id); if (item.id === "notifications") loadNotifs(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${tab === item.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{item.badge}</span> : tab === item.id ? <ChevronRight size={14} className="ml-auto opacity-70" /> : null}
                  </button>
                ))}
              </nav>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50">
                  <LogOut size={16} />{pick(locale, { mn: "Гарах", en: "Log out", ko: "로그아웃" })}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {tab === "cv" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-16 bg-linear-to-r from-blue-600 to-blue-800" />
                <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
                  <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-blue-600 text-xl font-bold text-white shadow">{profile?.name.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 pb-1">
                    <h2 className="text-lg font-bold text-gray-900">{profile?.name}</h2>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{profile?.email}</span>
                      {profile?.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{profile.phone}</span>}
                    </div>
                  </div>
                  <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"><Briefcase size={14} />{pick(locale, { mn: "Ажлын зар харах", en: "Browse Jobs", ko: "공고 보기" })}</Link>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Мэдээлэл засах", en: "Edit Profile", ko: "프로필 수정" })}</h3>
                <form onSubmit={saveProfile} className="space-y-4">
                  {[{ label: pick(locale, { mn: "Бүтэн нэр", en: "Full Name", ko: "이름" }), value: cvForm.name, key: "name" as const }, { label: pick(locale, { mn: "Утасны дугаар", en: "Phone", ko: "전화번호" }), value: cvForm.phone, key: "phone" as const }].map(({ label, value, key }) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
                      <input value={value} onChange={(e) => setCvForm({ ...cvForm, [key]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "И-мэйл", en: "Email", ko: "이메일" })}</label>
                    <input value={profile?.email || ""} disabled className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 outline-none" />
                  </div>
                  {cvMsg && <p className="text-sm text-green-600">{cvMsg}</p>}
                  <button type="submit" disabled={cvSaving} className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{cvSaving ? pick(locale, { mn: "Хадгалж байна...", en: "Saving...", ko: "저장 중..." }) : pick(locale, { mn: "Хадгалах", en: "Save Changes", ko: "저장" })}</button>
                </form>
              </div>
            </div>
          )}

          {/* ── Structured CV ── */}
          {tab === "mycv" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2"><FileText size={16} className="text-blue-600" /><h3 className="font-bold text-gray-900">{pick(locale, { mn: "Миний CV", en: "My CV", ko: "내 CV" })}</h3></div>
                {cvData && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"><CheckCircle2 size={12} />{pick(locale, { mn: "Хадгалагдсан", en: "Saved", ko: "저장됨" })}</span>}
              </div>

              <form onSubmit={saveStructuredCV} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    { key: "fullName",    label: pick(locale, { mn: "Бүтэн нэр *",       en: "Full Name *",     ko: "이름 *" }),           required: true  },
                    { key: "email",       label: pick(locale, { mn: "И-мэйл *",           en: "Email *",         ko: "이메일 *" }),         required: true  },
                    { key: "phone",       label: pick(locale, { mn: "Утас",               en: "Phone",           ko: "전화번호" }),          required: false },
                    { key: "dateOfBirth", label: pick(locale, { mn: "Төрсөн огноо",       en: "Date of Birth",   ko: "생년월일" }),          required: false },
                    { key: "nationality", label: pick(locale, { mn: "Иргэншил",           en: "Nationality",     ko: "국적" }),             required: false },
                    { key: "resumeUrl",   label: pick(locale, { mn: "CV PDF холбоос",     en: "CV PDF URL",      ko: "CV PDF URL" }),       required: false },
                  ] as { key: keyof typeof cvFormData; label: string; required: boolean }[]).map(({ key, label, required }) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
                      <input required={required} value={cvFormData[key]} onChange={(e) => setCvFormData({ ...cvFormData, [key]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Хүйс", en: "Gender", ko: "성별" })}</label>
                    <select value={cvFormData.gender} onChange={(e) => setCvFormData({ ...cvFormData, gender: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400">
                      <option value="">{pick(locale, { mn: "Сонгох", en: "Select", ko: "선택" })}</option>
                      <option value="Эрэгтэй">{pick(locale, { mn: "Эрэгтэй", en: "Male", ko: "남성" })}</option>
                      <option value="Эмэгтэй">{pick(locale, { mn: "Эмэгтэй", en: "Female", ko: "여성" })}</option>
                    </select>
                  </div>
                </div>

                {([
                  { key: "education",        label: pick(locale, { mn: "Боловсрол",        en: "Education",        ko: "학력" }),        rows: 3 },
                  { key: "experience",       label: pick(locale, { mn: "Ажлын туршлага",   en: "Work Experience",  ko: "경력" }),        rows: 4 },
                  { key: "skills",           label: pick(locale, { mn: "Ур чадвар",        en: "Skills",           ko: "기술" }),        rows: 3 },
                  { key: "selfIntroduction", label: pick(locale, { mn: "Өөрийн тухай",     en: "Self Introduction",ko: "자기소개" }),     rows: 4 },
                ] as { key: keyof typeof cvFormData; label: string; rows: number }[]).map(({ key, label, rows }) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
                    <textarea rows={rows} value={cvFormData[key]} onChange={(e) => setCvFormData({ ...cvFormData, [key]: e.target.value })} className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-blue-400 focus:bg-white" />
                  </div>
                ))}

                {cvStructuredMsg && <p className={`text-sm ${cvStructuredMsg.includes("Алдаа") || cvStructuredMsg.includes("Error") ? "text-red-600" : "text-green-600"}`}>{cvStructuredMsg}</p>}
                <button type="submit" disabled={cvStructuredSaving} className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{cvStructuredSaving ? pick(locale, { mn: "Хадгалж байна...", en: "Saving...", ko: "저장 중..." }) : pick(locale, { mn: "CV хадгалах", en: "Save CV", ko: "CV 저장" })}</button>
              </form>
            </div>
          )}

          {/* ── Saved Jobs ── */}
          {tab === "saved" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{pick(locale, { mn: "Хадгалсан зарууд", en: "Saved Jobs", ko: "저장한 공고" })}</h3>
                <span className="text-xs text-gray-400">{savedJobs.length} {pick(locale, { mn: "зар", en: "jobs", ko: "개" })}</span>
              </div>
              {savedLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : savedJobs.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"><Bookmark className="h-8 w-8 text-blue-400" /></div>
                  <p className="font-semibold text-gray-800">{pick(locale, { mn: "Хадгалсан зар байхгүй", en: "No saved jobs yet", ko: "저장한 공고가 없습니다" })}</p>
                  <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><Briefcase size={14} />{pick(locale, { mn: "Зар хайх", en: "Browse Jobs", ko: "공고 보기" })}</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedJobs.map((fav) => (
                    <div key={fav.id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-blue-200">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">{fav.job.company.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/jobs/${fav.job.id}`} className="font-semibold text-gray-900 hover:text-blue-700 truncate block">{fav.job.title}</Link>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{fav.job.location} · {fav.job.company.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/jobs/${fav.job.id}`} className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 inline-flex items-center gap-1">{pick(locale, { mn: "Харах", en: "View", ko: "보기" })} <ArrowRight size={11} /></Link>
                        <button onClick={() => unsaveJob(fav.job.id)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">{pick(locale, { mn: "Хасах", en: "Remove", ko: "삭제" })}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Bell size={16} className="text-blue-600" /><h3 className="font-bold text-gray-900">{pick(locale, { mn: "Мэдэгдэл", en: "Notifications", ko: "알림" })}</h3>{unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unread}</span>}</div>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">{pick(locale, { mn: "Бүгдийг уншсан болгох", en: "Mark all read", ko: "모두 읽음" })}</button>}
              </div>
              {notifsLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Bell className="h-12 w-12 text-gray-300" />
                  <p className="text-gray-400">{pick(locale, { mn: "Мэдэгдэл байхгүй байна", en: "No notifications yet", ko: "알림이 없습니다" })}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifs.map((n) => (
                    <div key={n.id} className={`rounded-xl border p-4 transition ${n.isRead ? "border-gray-100 bg-white" : "border-blue-100 bg-blue-50"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${n.isRead ? "text-gray-700" : "text-blue-800"}`}>{n.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2"><Globe size={16} className="text-blue-600" /><h3 className="font-bold text-gray-900">{pick(locale, { mn: "Хэл", en: "Language", ko: "언어" })}</h3></div>
                <div className="flex items-center gap-4"><LanguageSwitcher /><span className="text-sm text-gray-500">{SUPPORTED_LOCALES.find((l) => l.code === locale)?.label}</span></div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2"><KeyRound size={16} className="text-blue-600" /><h3 className="font-bold text-gray-900">{pick(locale, { mn: "Нууц үг солих", en: "Change Password", ko: "비밀번호 변경" })}</h3></div>
                <form onSubmit={changePassword} className="space-y-4">
                  {[{ label: pick(locale, { mn: "Одоогийн нууц үг", en: "Current Password", ko: "현재 비밀번호" }), key: "current" as const }, { label: pick(locale, { mn: "Шинэ нууц үг", en: "New Password", ko: "새 비밀번호" }), key: "next" as const }, { label: pick(locale, { mn: "Нууц үг давтах", en: "Confirm Password", ko: "비밀번호 확인" }), key: "confirm" as const }].map(({ label, key }) => (
                    <div key={key}><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label><input type="password" value={pwForm[key]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" /></div>
                  ))}
                  {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}
                  {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
                  <button type="submit" disabled={pwSaving} className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pwSaving ? pick(locale, { mn: "Солж байна...", en: "Updating...", ko: "변경 중..." }) : pick(locale, { mn: "Нууц үг солих", en: "Change Password", ko: "비밀번호 변경" })}</button>
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
