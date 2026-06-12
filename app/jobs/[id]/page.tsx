"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Calendar, MapPin, Briefcase, Building2, Eye, ExternalLink, Users, Check, CheckCircle2, BadgeCheck, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatRelativeTime, formatSalary, getCategoryLabel, getJobTypeLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-green-100 text-green-700",
  PART_TIME: "bg-blue-100 text-blue-700",
  CONTRACT: "bg-purple-100 text-purple-700",
  INTERNSHIP: "bg-yellow-100 text-yellow-700",
};

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  location: string;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  views: number;
  contactPhone: string | null;
  company: {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    industry: string | null;
    location: string | null;
    size: string | null;
    verified: boolean;
    website: string | null;
  };
  _count: { applications: number };
}

export default function JobDetailPage() {
  const { locale } = useLanguage();
  const t = getTranslation(locale, "jobs");
  const common = getTranslation(locale, "common");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cvText, setCvText] = useState("");
  const [cvLoading, setCvLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setJob(d.job);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const openModal = async () => {
    setShowModal(true);
    setCvLoading(true);
    const res = await fetch("/api/auth/cv");
    const data = await res.json();
    setCvText(data.cvText || "");
    setCvLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: cvText }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok || res.status === 409) {
      setApplied(true);
      setShowModal(false);
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-gray-500">{t.jobNotFound}</p>
          <Link href="/jobs" className="text-blue-600 underline">
            {t.backToJobs}
          </Link>
        </div>
      </div>
    );
  }

  const labels = {
    monthlySalary: pick(locale, { mn: "Сарын цалин", en: "Monthly salary", ko: "월급" }),
    experience: pick(locale, { mn: "Туршлага", en: "Experience", ko: "경력" }),
    visaType: pick(locale, { mn: "Визний төрөл", en: "Visa type", ko: "비자 유형" }),
    posted: pick(locale, { mn: "Нийтлэгдсэн", en: "Posted", ko: "등록됨" }),
    shiftWork: pick(locale, { mn: "Ээлжийн ажил", en: "Shift work", ko: "교대 근무" }),
    rotation: pick(locale, { mn: "Өдөр / Шөнө ээлжилнэ", en: "Day / Night rotation", ko: "주/야 교대" }),
    overtime: pick(locale, { mn: "Илүү цагийн цалинтай", en: "Including overtime pay", ko: "야근 수당 포함" }),
    verified: pick(locale, { mn: "Баталгаажсан", en: "Verified", ko: "인증됨" }),
    applicants: pick(locale, { mn: "өргөдөл гаргагч", en: "applicants", ko: "지원자" }),
    views: pick(locale, { mn: "үзэлт", en: "views", ko: "조회" }),
    employees: pick(locale, { mn: "ажилтан", en: "employees", ko: "직원" }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
        <div className="flex-1">
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                {job.company.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${JOB_TYPE_COLORS[job.type]}`}>
                    {getJobTypeLabel(locale, job.type)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{getCategoryLabel(locale, job.category)}</span>
                  {job.company.verified && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600"><BadgeCheck size={12} /> {labels.verified}</span>}
                </div>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-1 text-gray-500">{job.company.name} · {job.location}</p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-blue-700">
                      {formatSalary(locale, job.salaryMin, job.salaryMax) || pick(locale, { mn: "Тохиролцоно", en: "Negotiable", ko: "협의" })}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">{labels.monthlySalary}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-blue-700">{job.type === "FULL_TIME" ? pick(locale, { mn: "3-5 жил", en: "3-5 years", ko: "3-5년" }) : pick(locale, { mn: "Аль ч", en: "Any", ko: "무관" })}</div>
                    <div className="mt-1 text-xs text-gray-400">{labels.experience}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-blue-700">E-9 / E-7</div>
                    <div className="mt-1 text-xs text-gray-400">{labels.visaType}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="text-sm font-bold text-blue-700">{formatRelativeTime(locale, job.createdAt)}</div>
                    <div className="mt-1 text-xs text-gray-400">{labels.posted}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{t.jobDescription}</h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.description}</div>
          </div>

          {job.requirements && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">{t.requirementTitle}</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.requirements}</div>
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{t.scheduleTitle}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <Moon className="h-6 w-6 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold">{labels.shiftWork}</p>
                  <p className="text-xs text-gray-500">{labels.rotation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <Calendar className="h-6 w-6 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold">{pick(locale, { mn: "Даваа – Баасан", en: "Mon – Fri", ko: "월 – 금" })}</p>
                  <p className="text-xs text-gray-500">{labels.overtime}</p>
                </div>
              </div>
            </div>
          </div>

          {job.benefits && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">{t.benefitsTitle}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {job.benefits.split("\n").map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <div className="sticky top-24 mb-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-1 text-xl font-bold text-gray-900">
              {formatSalary(locale, job.salaryMin, job.salaryMax) || pick(locale, { mn: "Тохиролцоно", en: "Negotiable", ko: "협의" })}
            </div>
            <p className="mb-4 text-xs text-gray-400">{pick(locale, { mn: "сард", en: "per month", ko: "월" })}</p>

            {applied ? (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                <CheckCircle2 size={16} /> {t.applySuccess}
              </div>
            ) : (
              <button
                onClick={openModal}
                className="mb-3 w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                {pick(locale, { mn: "CV илгээх", en: "Send CV", ko: "CV 보내기" })} →
              </button>
            )}

            <button
              onClick={() => setSaved(!saved)}
              className={`w-full rounded-xl border py-2.5 text-sm font-semibold transition ${saved ? "border-yellow-300 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {saved ? <span className="inline-flex items-center gap-1"><Check size={14} /> {common.saved}</span> : common.saveJob}
            </button>

            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-gray-400" /><span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="shrink-0 text-gray-400" /><span>{getJobTypeLabel(locale, job.type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="shrink-0 text-gray-400" /><span>{getCategoryLabel(locale, job.category)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={14} className="shrink-0 text-gray-400" />
                <span>
                  {job.views} {labels.views} · {job._count.applications} {labels.applicants}
                </span>
              </div>
            </div>

            {job.contactPhone && (
              <a href={`tel:${job.contactPhone}`} className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                <Phone size={14} /> {job.contactPhone}
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 font-semibold text-gray-800">{t.aboutEmployer}</h3>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                {job.company.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{job.company.name}</p>
                <p className="text-xs text-gray-400">{job.company.industry || getCategoryLabel(locale, job.category)}</p>
              </div>
            </div>
            {job.company.description && <p className="line-clamp-3 text-xs text-gray-500">{job.company.description}</p>}
            {job.company.size && <p className="mt-2 flex items-center gap-1 text-xs text-gray-400"><Users size={12} /> {job.company.size} {labels.employees}</p>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-gray-900">
              {pick(locale, { mn: "CV илгээх", en: "Send CV", ko: "CV 보내기" })}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{job.title} · {job.company.name}</p>

            {cvLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
              </div>
            ) : cvText ? (
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={10}
                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed outline-none focus:border-blue-400 focus:bg-white"
              />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-400">
                  {pick(locale, { mn: "CV бичигдээгүй байна", en: "No CV written yet", ko: "CV가 작성되지 않았습니다" })}
                </p>
                <a
                  href="/dashboard"
                  className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  {pick(locale, { mn: "CV бичих", en: "Write CV", ko: "CV 작성" })}
                </a>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold hover:bg-gray-50">
                {t.cancel}
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !cvText}
                className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {applying ? t.submitting : pick(locale, { mn: "Илгээх", en: "Send", ko: "보내기" })}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
