"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Briefcase, Building2, Eye, Users, Check,
  CheckCircle2, BadgeCheck, Phone, Bookmark, AlertTriangle, Navigation2, X,
  MessageCircle, Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatRelativeTime, formatSalary, getCategoryLabel, getJobTypeLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";
import JobRouteModal from "@/components/JobRouteModal";

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-green-100 text-green-700",
  PART_TIME: "bg-[#dcfce7] text-[#16a34a]",
  CONTRACT: "bg-purple-100 text-purple-700",
  INTERNSHIP: "bg-yellow-100 text-yellow-700",
};

const REPORT_REASONS: { value: string; mn: string; en: string; ko: string }[] = [
  { value: "Scam",              mn: "Луйвар",             en: "Scam",              ko: "사기" },
  { value: "Duplicate",         mn: "Давхардсан зар",     en: "Duplicate",         ko: "중복 공고" },
  { value: "Wrong Information", mn: "Буруу мэдээлэл",     en: "Wrong Information", ko: "잘못된 정보" },
  { value: "Fake Job",          mn: "Хуурамч зар",        en: "Fake Job",          ko: "허위 공고" },
  { value: "Other",             mn: "Бусад",              en: "Other",             ko: "기타" },
];

interface Job {
  id: string; title: string; description: string; requirements: string | null;
  benefits: string | null; location: string; type: string; category: string;
  salaryMin: number | null; salaryMax: number | null; createdAt: string;
  views: number; contactPhone: string | null; recruiterName: string | null;
  phoneNumber: string | null; kakaoId: string | null; expiresAt: string | null;
  company: { id: string; name: string; logo: string | null; description: string | null; industry: string | null; location: string | null; size: string | null; verified: boolean; website: string | null };
  _count: { applications: number };
}

export default function JobDetailClient() {
  const { locale } = useLanguage();
  const t = getTranslation(locale, "jobs");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const loginHref = `/login?next=${encodeURIComponent(`/jobs/${id}`)}`;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cvText, setCvText] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // Save/Favorite
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Report
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const requireAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) return true;
    } catch {
      // Fall through to the login redirect below.
    }

    router.push(loginHref);
    return false;
  };

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => { setJob(d.job); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`/api/favorites/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.saved !== undefined) setSaved(d.saved); })
      .catch(() => {});

    // Өмнө нь CV илгээсэн эсэхийг шалгах
    fetch(`/api/jobs/${id}/applied`)
      .then((r) => r.json())
      .then((d) => { if (d.applied) setApplied(true); })
      .catch(() => {});
  }, [id]);

  const openModal = async () => {
    const authenticated = await requireAuth();
    if (!authenticated) return;

    setShowModal(true);
    setCvLoading(true);
    const res = await fetch("/api/auth/cv");
    if (res.status === 401) {
      setCvLoading(false);
      setShowModal(false);
      router.push(loginHref);
      return;
    }
    const data = await res.json();
    if (data.cv) {
      const cv = data.cv;
      const parts = [
        cv.fullName && `Нэр: ${cv.fullName}`,
        cv.email && `И-мэйл: ${cv.email}`,
        cv.phone && `Утас: ${cv.phone}`,
        cv.nationality && `Иргэншил: ${cv.nationality}`,
        cv.education && `\nБоловсрол:\n${cv.education}`,
        cv.experience && `\nАжлын туршлага:\n${cv.experience}`,
        cv.skills && `\nУр чадвар:\n${cv.skills}`,
        cv.selfIntroduction && `\nӨөрийн тухай:\n${cv.selfIntroduction}`,
        cv.resumeUrl && `\nCV PDF: ${cv.resumeUrl}`,
      ].filter(Boolean);
      setCvText(parts.join("\n"));
    } else {
      setCvText(data.cvText || "");
    }
    setCvLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: cvText }),
    });
    if (res.status === 401) { router.push(loginHref); setApplying(false); return; }
    if (res.ok) { setApplied(true); setShowModal(false); }
    if (res.status === 409) { setApplied(true); setShowModal(false); }
    setApplying(false);
  };

  const toggleSave = async () => {
    const authenticated = await requireAuth();
    if (!authenticated) return;

    setSaveLoading(true);
    if (saved) {
      await fetch(`/api/favorites/${id}`, { method: "DELETE" });
      setSaved(false);
    } else {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      if (res.status === 401) { router.push(loginHref); setSaveLoading(false); return; }
      setSaved(true);
    }
    setSaveLoading(false);
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setReporting(true);
    const res = await fetch(`/api/jobs/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason, description: reportDesc }),
    });
    setReporting(false);
    if (res.ok || res.status === 201) { setReportDone(true); setTimeout(() => { setShowReport(false); setReportDone(false); setReportReason(""); setReportDesc(""); }, 2000); }
  };

  if (loading) return <div className="flex min-h-screen flex-col"><Navbar /><div className="flex flex-1 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22c55e] border-t-transparent" /></div></div>;
  if (!job) return <div className="flex min-h-screen flex-col"><Navbar /><div className="flex flex-1 flex-col items-center justify-center gap-4"><p className="text-blue-900">{t.jobNotFound}</p><Link href="/jobs" className="text-[#22c55e] underline">{t.backToJobs}</Link></div></div>;

  const expired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false;

  const labels = {
    monthlySalary: pick(locale, { mn: "Сарын цалин", en: "Monthly salary", ko: "월급" }),
    posted:        pick(locale, { mn: "Нийтлэгдсэн", en: "Posted",        ko: "등록됨" }),
    verified:      pick(locale, { mn: "Баталгаажсан", en: "Verified",     ko: "인증됨" }),
    applicants:    pick(locale, { mn: "өргөдөл гаргагч", en: "applicants", ko: "지원자" }),
    views:         pick(locale, { mn: "үзэлт",       en: "views",         ko: "조회" }),
    employees:     pick(locale, { mn: "ажилтан",     en: "employees",     ko: "직원" }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
        {/* Left column */}
        <div className="flex-1">
          {/* Header card */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dcfce7] text-xl font-bold text-[#22c55e] sm:h-16 sm:w-16 sm:text-2xl">{job.company.name.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${JOB_TYPE_COLORS[job.type]}`}>{getJobTypeLabel(locale, job.type)}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-blue-900">{getCategoryLabel(locale, job.category)}</span>
                  {job.company.verified && <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7f1] px-2 py-1 text-xs text-[#22c55e]"><BadgeCheck size={12} /> {labels.verified}</span>}
                  {expired && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600"><Clock size={12} />{pick(locale, { mn: "Дуусгавар", en: "Expired", ko: "만료됨" })}</span>}
                </div>
                <h1 className="mt-2 text-xl font-bold text-blue-900 sm:text-2xl">{job.title}</h1>
                <p className="mt-1 text-sm text-blue-900 sm:text-base">{job.company.name} · {job.location}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-[#22c55e]">{formatSalary(locale, job.salaryMin, job.salaryMax) || pick(locale, { mn: "Тохиролцоно", en: "Negotiable", ko: "협의" })}</div>
                    <div className="mt-1 text-xs text-blue-900">{labels.monthlySalary}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-[#22c55e]">{formatRelativeTime(locale, job.createdAt)}</div>
                    <div className="mt-1 text-xs text-blue-900">{labels.posted}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-blue-900">{t.jobDescription}</h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-blue-900">{job.description}</div>
          </div>

          {job.requirements && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-blue-900">{t.requirementTitle}</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-blue-900">{job.requirements}</div>
            </div>
          )}


          {job.benefits && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-blue-900">{t.benefitsTitle}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {job.benefits.split("\n").filter(Boolean).map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-blue-900"><Check className="h-4 w-4 shrink-0 text-green-500" />{b}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="lg:sticky lg:top-24 mb-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-1 text-xl font-bold text-blue-900">{formatSalary(locale, job.salaryMin, job.salaryMax) || pick(locale, { mn: "Тохиролцоно", en: "Negotiable", ko: "협의" })}</div>
            <p className="mb-4 text-xs text-blue-900">{pick(locale, { mn: "сард", en: "per month", ko: "월" })}</p>

            {applied ? (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700"><CheckCircle2 size={16} /> {t.applySuccess}</div>
            ) : expired ? (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-blue-900"><Clock size={16} />{pick(locale, { mn: "Зар дуусгавар болсон", en: "This job has expired", ko: "만료된 공고" })}</div>
            ) : (
              <button onClick={openModal} className="mb-3 w-full rounded-xl bg-[#22c55e] py-3 text-sm font-semibold text-white transition hover:bg-[#16a34a]">
                {pick(locale, { mn: "CV илгээх", en: "Send CV", ko: "CV 보내기" })} →
              </button>
            )}

            <button onClick={toggleSave} disabled={saveLoading} className={`mb-3 w-full rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-60 ${saved ? "border-yellow-300 bg-yellow-50 text-yellow-700" : "border-gray-200 text-blue-900 hover:bg-gray-50"}`}>
              {saved ? <span className="inline-flex items-center justify-center gap-1"><Check size={14} /> {pick(locale, { mn: "Хадгалсан", en: "Saved", ko: "저장됨" })}</span> : <span className="inline-flex items-center justify-center gap-1"><Bookmark size={14} /> {pick(locale, { mn: "Хадгалах", en: "Save Job", ko: "저장" })}</span>}
            </button>

            {/* Stats */}
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm text-blue-900">
              <button
                type="button"
                onClick={() => setShowRouteMap(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left transition hover:border-[#22c55e]/30 hover:bg-[#eef7f1]"
              >
                <MapPin size={14} className="shrink-0 text-blue-900" />
                <span className="min-w-0 flex-1 truncate">{job.location}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#22c55e]">
                  <Navigation2 size={11} />
                  {pick(locale, { mn: "Зам харах", en: "View route", ko: "경로 보기" })}
                </span>
              </button>
              <div className="flex items-center gap-2"><Briefcase size={14} className="shrink-0 text-blue-900" /><span>{getJobTypeLabel(locale, job.type)}</span></div>
              <div className="flex items-center gap-2"><Building2 size={14} className="shrink-0 text-blue-900" /><span>{getCategoryLabel(locale, job.category)}</span></div>
              <div className="flex items-center gap-2"><Eye size={14} className="shrink-0 text-blue-900" /><span>{job.views} {labels.views} · {job._count.applications} {labels.applicants}</span></div>
              {job.expiresAt && (
                <div className={`flex items-center gap-2 ${expired ? "text-red-500" : "text-blue-900"}`}>
                  <Clock size={14} className="shrink-0" />
                  <span>{expired ? pick(locale, { mn: "Дуусгавар болсон", en: "Expired", ko: "만료됨" }) : pick(locale, { mn: "Дуусах огноо:", en: "Expires:", ko: "만료일:" })} {new Date(job.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Contact info */}
            {(job.contactPhone || job.phoneNumber || job.recruiterName || job.kakaoId) && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">{pick(locale, { mn: "Холбоо барих", en: "Contact", ko: "연락처" })}</p>
                {job.recruiterName && <p className="flex items-center gap-2 text-sm text-blue-900"><Users size={13} className="text-blue-900" />{job.recruiterName}</p>}
                {(job.phoneNumber || job.contactPhone) && (
                  <a href={`tel:${job.phoneNumber || job.contactPhone}`} className="flex items-center gap-2 text-sm text-[#22c55e] hover:underline">
                    <Phone size={13} />{job.phoneNumber || job.contactPhone}
                  </a>
                )}
                {job.kakaoId && (
                  <p className="flex items-center gap-2 text-sm text-yellow-700">
                    <MessageCircle size={13} />KakaoTalk: {job.kakaoId}
                  </p>
                )}
              </div>
            )}

            {/* Report button */}
            <button onClick={() => setShowReport(true)} className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-blue-900 hover:text-red-500 transition">
              <AlertTriangle size={12} />{pick(locale, { mn: "Зар гомдол гаргах", en: "Report Job", ko: "공고 신고" })}
            </button>
          </div>

          {/* Company card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 font-semibold text-blue-900">{t.aboutEmployer}</h3>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcfce7] font-bold text-[#22c55e]">{job.company.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{job.company.name}</p>
                <p className="flex items-center gap-1 text-xs text-blue-900">
                  <MapPin size={11} className="shrink-0 text-blue-900" />
                  <span>{job.location}</span>
                </p>
              </div>
            </div>
            {job.company.description && <p className="line-clamp-3 text-xs text-blue-900">{job.company.description}</p>}
            {job.company.size && <p className="mt-2 flex items-center gap-1 text-xs text-blue-900"><Users size={12} /> {job.company.size} {labels.employees}</p>}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-blue-900">{pick(locale, { mn: "CV илгээх", en: "Send CV", ko: "CV 보내기" })}</h3>
            <p className="mb-4 text-sm text-blue-900">{job.title} · {job.company.name}</p>
            {cvLoading ? (
              <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[#22c55e] border-t-transparent" /></div>
            ) : cvText ? (
              <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} rows={10} className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed outline-none focus:border-[#22c55e] focus:bg-white" />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-blue-900">{pick(locale, { mn: "CV бичигдээгүй байна", en: "No CV written yet", ko: "CV가 없습니다" })}</p>
                <a href="/dashboard" className="rounded-lg bg-[#22c55e] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#16a34a]">{pick(locale, { mn: "CV бичих", en: "Write CV", ko: "CV 작성" })}</a>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold hover:bg-gray-50">{t.cancel}</button>
              <button onClick={handleApply} disabled={applying || !cvText} className="flex-1 rounded-xl bg-[#22c55e] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16a34a] disabled:opacity-60">{applying ? t.submitting : pick(locale, { mn: "Илгээх", en: "Send", ko: "보내기" })}</button>
            </div>
          </div>
        </div>
      )}

      <JobRouteModal
        open={showRouteMap}
        onClose={() => setShowRouteMap(false)}
        destinationLabel={job.location}
        jobTitle={job.title}
      />

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-blue-900 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" />{pick(locale, { mn: "Зар гомдол гаргах", en: "Report Job", ko: "공고 신고" })}</h3>
              <button onClick={() => setShowReport(false)}><X size={18} className="text-blue-900 hover:text-blue-900" /></button>
            </div>
            {reportDone ? (
              <div className="flex flex-col items-center gap-3 py-6"><CheckCircle2 size={40} className="text-green-500" /><p className="font-semibold text-blue-900">{pick(locale, { mn: "Гомдлыг хүлээн авлаа", en: "Report submitted", ko: "신고 접수됨" })}</p></div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-blue-900">{pick(locale, { mn: "Шалтгаан", en: "Reason", ko: "이유" })}</label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="reason" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} className="text-[#22c55e]" />
                        {pick(locale, { mn: r.mn, en: r.en, ko: r.ko })}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">{pick(locale, { mn: "Нэмэлт тайлбар (заавал биш)", en: "Additional description (optional)", ko: "추가 설명 (선택)" })}</label>
                  <textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#22c55e] focus:bg-white" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowReport(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold hover:bg-gray-50">{pick(locale, { mn: "Цуцлах", en: "Cancel", ko: "취소" })}</button>
                  <button onClick={submitReport} disabled={!reportReason || reporting} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{reporting ? "..." : pick(locale, { mn: "Илгээх", en: "Submit", ko: "제출" })}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
