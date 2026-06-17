"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, X, RefreshCw, CheckCircle2, Zap, FileText, Mail, Phone, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatDate, getCategoryLabel, getJobStatusLabel, getJobTypeLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const CATEGORY_KEYS = [
  "Manufacturing",
  "IT & Tech",
  "Food & Beverage",
  "Construction",
  "Logistics",
  "Healthcare",
  "Agriculture",
  "Service & Sales",
];

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

const JOB_STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED:  "bg-gray-100 text-blue-900",
};

type JobForm = {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: string;
  salaryMax: string;
  location: string;
  type: string;
  category: string;
  contactPhone: string;
  recruiterName: string;
  phoneNumber: string;
  kakaoId: string;
};

interface ReceivedApp {
  id: string;
  message: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null; cvText: string | null };
  job: { id: string; title: string };
}

interface PostedJob {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  status: string;
  featured: boolean;
  createdAt: string;
  _count: { applications: number };
}

const createEmptyForm = (): JobForm => ({
  title: "",
  description: "",
  requirements: "",
  benefits: "",
  salaryMin: "",
  salaryMax: "",
  location: "",
  type: "FULL_TIME",
  category: "Manufacturing",
  contactPhone: "",
  recruiterName: "",
  phoneNumber: "",
  kakaoId: "",
});

export default function PostJobPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = getTranslation(locale, "postJob");
  const common = getTranslation(locale, "common");
  const [authChecking, setAuthChecking] = useState(true);
  const [canManageJobs, setCanManageJobs] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [form, setForm] = useState<JobForm>(createEmptyForm);
  const [apps, setApps] = useState<ReceivedApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<ReceivedApp | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  // Report user state
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  // QPay modal state
  const [qpayModal, setQpayModal] = useState(false);
  const [qpayJobId, setQpayJobId] = useState<string | null>(null);
  const [qpayInvoiceId, setQpayInvoiceId] = useState<string | null>(null);
  const [qpayQrImage, setQpayQrImage] = useState<string | null>(null);
  const [qpayUrls, setQpayUrls] = useState<{ name: string; description: string; logo: string; link: string }[]>([]);
  const [qpayLoading, setQpayLoading] = useState(false);
  const [qpayChecking, setQpayChecking] = useState(false);
  const [qpayPaid, setQpayPaid] = useState(false);
  const [qpayAmount, setQpayAmount] = useState(10000);
  const [qpayPurpose, setQpayPurpose] = useState<"boost" | "post">("boost");
  const [qpayPendingForm, setQpayPendingForm] = useState<JobForm | null>(null);
  const qpayPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch("/api/recruiter/jobs"),
        fetch("/api/recruiter/applications"),
      ]);
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      setJobs(jobsData.jobs || []);
      setApps(appsData.applications || []);
    } catch {
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        const user = meData.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        setCanManageJobs(true);

        const [jobsRes, appsRes] = await Promise.all([
          fetch("/api/recruiter/jobs"),
          fetch("/api/recruiter/applications"),
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();

        if (!alive) return;

        setJobs(jobsData.jobs || []);
        setApps(appsData.applications || []);
      } catch {
        if (!alive) return;
        setError(pick(locale, { mn: "Ажлын байр удирдах цонхыг ачаалж чадсангүй.", en: "Unable to load your posting workspace.", ko: "공고 작업 공간을 불러오지 못했습니다." }));
      } finally {
        if (!alive) return;
        setAuthChecking(false);
        setJobsLoading(false);
      }
    };

    init();
    return () => {
      alive = false;
    };
  }, [locale, router]);

  const updateField = (field: keyof JobForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitJob = async (jobForm: JobForm) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || pick(locale, { mn: "Зар оруулж чадсангүй.", en: "Failed to post job.", ko: "공고 등록에 실패했습니다." }));
      return;
    }
    setSuccess(t.postedSuccess);
    setForm(createEmptyForm());
    await loadJobs();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError(pick(locale, { mn: "Гарчиг, тодорхойлолт, байрлалыг бөглөнө үү.", en: "Please fill in the title, description, and location.", ko: "제목, 설명, 위치를 입력해 주세요." }));
      return;
    }

    // 2nd+ job requires 5,000₮ payment
    if (jobs.length >= 1) {
      setQpayPurpose("post");
      setQpayAmount(5000);
      setQpayPendingForm({ ...form });
      setQpayJobId(null);
      setQpayPaid(false);
      setQpayQrImage(null);
      setQpayInvoiceId(null);
      setQpayModal(true);
      setQpayLoading(true);
      setTimeout(() => {
        setQpayQrImage("https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1ba5db&data=qpay://ajilkorea/postjob/" + Date.now());
        setQpayLoading(false);
      }, 800);
      return;
    }

    await submitJob(form);
  };

  const boostJob = async (jobId: string) => {
    setQpayPurpose("boost");
    setQpayAmount(10000);
    setQpayJobId(jobId);
    setQpayPaid(false);
    setQpayInvoiceId("demo");
    setQpayUrls([]);
    setQpayPendingForm(null);
    setQpayModal(true);
    setQpayLoading(true);
    setTimeout(() => {
      setQpayQrImage("https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1ba5db&data=qpay://ajilkorea/boost/" + jobId);
      setQpayLoading(false);
    }, 800);
  };

  const closeQpay = () => {
    if (qpayPollRef.current) clearInterval(qpayPollRef.current);
    setQpayModal(false);
  };

  const checkQpayManual = async () => {
    setQpayChecking(true);
    if (qpayPurpose === "boost" && qpayJobId) {
      await fetch(`/api/recruiter/jobs/${qpayJobId}/boost`, { method: "POST" });
      setJobs((prev) => prev.map((j) => (j.id === qpayJobId ? { ...j, featured: true } : j)));
    } else if (qpayPurpose === "post" && qpayPendingForm) {
      await submitJob(qpayPendingForm);
      setQpayPendingForm(null);
    }
    setQpayChecking(false);
    setQpayPaid(true);
  };

  const deleteApp = async (appId: string) => {
    setDeletingAppId(appId);
    await fetch(`/api/recruiter/applications/${appId}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== appId));
    if (selectedApp?.id === appId) setSelectedApp(null);
    setDeletingAppId(null);
  };

  const submitUserReport = async () => {
    if (!reportReason || !selectedApp) return;
    setReportSubmitting(true);
    await fetch(`/api/recruiter/applications/${selectedApp.id}/report-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason, description: reportDesc }),
    });
    setReportSubmitting(false);
    setReportDone(true);
    setTimeout(() => {
      setReportingUserId(null);
      setReportDone(false);
      setReportReason("");
      setReportDesc("");
    }, 2000);
  };

  const deleteJob = async (jobId: string) => {
    const confirmed = confirm(t.deleteConfirm);
    if (!confirmed) return;

    const res = await fetch(`/api/recruiter/jobs/${jobId}`, { method: "DELETE" });
    if (!res.ok) {
      setError(pick(locale, { mn: "Энэ ажлын байрыг устгаж чадсангүй.", en: "Unable to delete this job.", ko: "이 공고를 삭제할 수 없습니다." }));
      return;
    }

    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const counts = {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === "PENDING").length,
    approved: jobs.filter((job) => job.status === "APPROVED").length,
    rejected: jobs.filter((job) => job.status === "REJECTED").length,
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22c55e] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href={canManageJobs ? "/recruiter" : "/jobs"} className="text-sm text-[#22c55e] hover:underline">
              {canManageJobs
                ? pick(locale, { mn: "Хяналтын самбар руу буцах", en: "Back to dashboard", ko: "대시보드로 돌아가기" })
                : t.backLink}
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-blue-900">{t.heading}</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-900">{t.description}</p>
          </div>

          <Link
            href="/recruiter"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
          >
            {pick(locale, { mn: "Ажил олгогчийн порталыг нээх", en: "Open recruiter portal", ko: "채용자 포털 열기" })}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-900">{pick(locale, { mn: "Зар үүсгэх", en: "Create a job post", ko: "공고 작성" })}</h2>
                <p className="text-sm text-blue-900">{pick(locale, { mn: "Доорх мэдээллийг бөглөөд компанийн профайлдаа нийтлэнэ үү.", en: "Fill in the details below and publish to your company profile.", ko: "아래 정보를 입력하고 회사 프로필에 게시하세요." })}</p>
              </div>

            </div>

            {success && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
            {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {t.title} <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  placeholder={pick(locale, { mn: "Жишээ: Ахлах Frontend хөгжүүлэгч", en: "Example: Senior Frontend Developer", ko: "예: 시니어 프론트엔드 개발자" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {t.type} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getJobTypeLabel(locale, type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {t.category} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  >
                    {CATEGORY_KEYS.map((categoryKey) => (
                      <option key={categoryKey} value={categoryKey}>
                        {getCategoryLabel(locale, categoryKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {t.location} <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  required
                  placeholder={pick(locale, { mn: "Жишээ: Сөүл, БНСУ", en: "Example: Seoul, South Korea", ko: "예: 서울, 대한민국" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {pick(locale, { mn: "Холбоо барих утас", en: "Contact Phone", ko: "연락처 전화번호" })}
                </label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder={pick(locale, { mn: "Жишээ: +82 10-1234-5678", en: "Example: +82 10-1234-5678", ko: "예: +82 10-1234-5678" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {pick(locale, { mn: "Ажил олгогчийн нэр", en: "Recruiter Name", ko: "담당자 이름" })}
                  </label>
                  <input
                    value={form.recruiterName}
                    onChange={(e) => updateField("recruiterName", e.target.value)}
                    placeholder={pick(locale, { mn: "Жишээ: Батбаяр", en: "e.g. John Kim", ko: "예: 김철수" })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {pick(locale, { mn: "Утасны дугаар", en: "Phone Number", ko: "전화번호" })}
                  </label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="+82 10-0000-0000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    KakaoTalk ID
                  </label>
                  <input
                    value={form.kakaoId}
                    onChange={(e) => updateField("kakaoId", e.target.value)}
                    placeholder={pick(locale, { mn: "Kakao ID", en: "Kakao ID", ko: "카카오톡 ID" })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {t.salaryMin}
                  </label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => updateField("salaryMin", e.target.value)}
                    min={0}
                    placeholder={pick(locale, { mn: "Доод сарын цалин", en: "Minimum monthly salary", ko: "최저 월급" })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {t.salaryMax}
                  </label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => updateField("salaryMax", e.target.value)}
                    min={0}
                    placeholder={pick(locale, { mn: "Дээд сарын цалин", en: "Maximum monthly salary", ko: "최대 월급" })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {t.descriptionLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  rows={5}
                  placeholder={pick(locale, {
                    mn: "Ажлын үүрэг, хариуцлага болон давуу талыг тайлбарлана уу.",
                    en: "Describe the role, responsibilities, and what makes it a great opportunity.",
                    ko: "직무, 책임, 그리고 매력적인 점을 설명해 주세요.",
                  })}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {t.requirements}
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => updateField("requirements", e.target.value)}
                  rows={4}
                  placeholder={pick(locale, {
                    mn: "Шаардлага, туршлага, ур чадвараа нэмнэ үү.",
                    en: "Add qualifications, experience, or skills.",
                    ko: "자격 요건, 경력, 기술을 입력해 주세요.",
                  })}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {t.benefits}
                </label>
                <textarea
                  value={form.benefits}
                  onChange={(e) => updateField("benefits", e.target.value)}
                  rows={3}
                  placeholder={pick(locale, {
                    mn: "Урамшуулал, байр, визний тусламж зэрэг давуу талыг бичнэ үү.",
                    en: "Mention perks, leave, housing support, visa help, and more.",
                    ko: "복지, 휴가, 숙소 지원, 비자 도움 등을 적어 주세요.",
                  })}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href={canManageJobs ? "/recruiter" : "/jobs"}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-gray-50"
                >
                  {common.cancel}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#22c55e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t.posting : t.createButton}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-blue-900">{t.myPostedJobs}</h2>
                <p className="text-sm text-blue-900">
                  {counts.total} {t.totalListings}
                </p>
              </div>

              <button
                type="button"
                onClick={loadJobs}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
              >
                {t.refresh}
              </button>
            </div>

            {/* Received CVs */}
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-900">
                  {pick(locale, { mn: "Ирсэн CV", en: "Received CVs", ko: "받은 CV" })}
                  <span className="ml-2 rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-bold text-[#22c55e]">{apps.length}</span>
                </p>
              </div>

              {apps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-blue-900" />
                  <p className="text-sm text-blue-900">
                    {pick(locale, { mn: "Одоогоор CV ирээгүй байна", en: "No CVs received yet", ko: "아직 CV가 없습니다" })}
                  </p>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-[#22c55e]/30 hover:bg-[#eef7f1]"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-xs font-bold text-white">
                          {app.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-blue-900">{app.user.name}</p>
                          <p className="truncate text-xs text-blue-900">{app.job.title}</p>
                        </div>
                        <span className="shrink-0 text-xs text-blue-900">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteApp(app.id)}
                        disabled={deletingAppId === app.id}
                        className="ml-1 shrink-0 rounded-lg p-1.5 text-blue-900 transition hover:bg-red-50 hover:text-red-400 disabled:opacity-40"
                        title={pick(locale, { mn: "Устгах", en: "Delete", ko: "삭제" })}
                      >
                        {deletingAppId === app.id ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-blue-900" />
                <p className="mt-4 font-semibold text-blue-900">{t.noJobs}</p>
                <p className="mt-2 text-sm text-blue-900">{t.noJobsDescription}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <article key={job.id} className="rounded-2xl border border-gray-200 p-4 transition hover:border-[#22c55e]/30 hover:shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/jobs/${job.id}`} className="truncate font-semibold text-blue-900 hover:text-[#22c55e]">
                            {job.title}
                          </Link>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_COLORS[job.status] || "bg-gray-100 text-blue-900"}`}>
                            {getJobStatusLabel(locale, job.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-blue-900">
                          {job.location} · {getJobTypeLabel(locale, job.type)} · {getCategoryLabel(locale, job.category)}
                        </p>
                        <p className="mt-1 text-xs text-blue-900">
                          {formatDate(locale, job.createdAt)} · {job._count.applications} {t.applications}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-gray-50"
                        >
                          {t.view}
                        </Link>
                        <button
                          type="button"
                          onClick={() => boostJob(job.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            job.featured
                              ? "border-yellow-300 bg-yellow-50 text-yellow-700 cursor-default"
                              : "border-orange-200 text-orange-600 hover:bg-orange-50"
                          }`}
                          disabled={job.featured}
                        >
                          {job.featured
                            ? pick(locale, { mn: "Boosted ✓", en: "Boosted ✓", ko: "부스트됨 ✓" })
                            : pick(locale, { mn: "Boost · 10,000₮", en: "Boost · ₮10,000", ko: "부스트 · ₮10,000" })}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJob(job.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── CV Detail Modal ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-sm font-bold text-white">
                  {selectedApp.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-blue-900">{selectedApp.user.name}</p>
                  <p className="text-xs text-blue-900">{selectedApp.job.title}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedApp(null); setReportingUserId(null); setReportDone(false); setReportReason(""); setReportDesc(""); }}>
                <X size={18} className="text-blue-900 hover:text-blue-900" />
              </button>
            </div>

            <div className="p-5">
              {/* Contact info */}
              <div className="mb-4 flex flex-wrap gap-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-blue-900">
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-blue-900" />{selectedApp.user.email}</span>
                {selectedApp.user.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-blue-900" />{selectedApp.user.phone}</span>}
              </div>

              {/* CV content */}
              {(selectedApp.message || selectedApp.user.cvText) ? (
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 font-sans text-xs leading-relaxed text-blue-900">
                  {selectedApp.message || selectedApp.user.cvText}
                </pre>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-blue-900">
                  {pick(locale, { mn: "CV бичигдээгүй байна", en: "No CV provided", ko: "CV 없음" })}
                </div>
              )}

              {/* Report user section */}
              {reportingUserId === selectedApp.id ? (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  {reportDone ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                      <CheckCircle2 size={16} /> {pick(locale, { mn: "Гомдол илгээгдлээ", en: "Report submitted", ko: "신고 접수됨" })}
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {pick(locale, { mn: "Хэрэглэгчид гомдол гаргах", en: "Report User", ko: "사용자 신고" })}
                      </p>
                      <div className="mb-3 space-y-1.5">
                        {[
                          { value: "Spam",         mn: "Спам / Хуурамч",        en: "Spam / Fake",          ko: "스팸 / 허위" },
                          { value: "Inappropriate", mn: "Зохисгүй агуулга",     en: "Inappropriate content", ko: "부적절한 내용" },
                          { value: "Fraud",         mn: "Луйвар оролдлого",     en: "Fraud attempt",         ko: "사기 시도" },
                          { value: "Other",         mn: "Бусад",                en: "Other",                 ko: "기타" },
                        ].map((r) => (
                          <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm">
                            <input type="radio" name="userReportReason" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} />
                            {pick(locale, { mn: r.mn, en: r.en, ko: r.ko })}
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={reportDesc}
                        onChange={(e) => setReportDesc(e.target.value)}
                        rows={2}
                        placeholder={pick(locale, { mn: "Нэмэлт тайлбар (заавал биш)", en: "Additional notes (optional)", ko: "추가 설명 (선택)" })}
                        className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setReportingUserId(null)} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold hover:bg-white">
                          {pick(locale, { mn: "Цуцлах", en: "Cancel", ko: "취소" })}
                        </button>
                        <button onClick={submitUserReport} disabled={!reportReason || reportSubmitting} className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                          {reportSubmitting ? "..." : pick(locale, { mn: "Илгээх", en: "Submit", ko: "제출" })}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setReportingUserId(selectedApp.id)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-blue-900 hover:text-red-500 transition"
                >
                  <AlertTriangle size={12} />
                  {pick(locale, { mn: "Энэ хэрэглэгчид гомдол гаргах", en: "Report this user", ko: "이 사용자 신고" })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QPay Modal ── */}
      {qpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-[#1ba5db] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Zap size={18} className="text-white" />
                <div>
                  <p className="text-sm font-bold">QPay төлбөр</p>
                  <p className="text-xs text-white/70">
                    {qpayPurpose === "boost"
                      ? pick(locale, { mn: "Boost Job · 10,000₮", en: "Boost Job · ₮10,000", ko: "부스트 · ₮10,000" })
                      : pick(locale, { mn: "Зар оруулах · 5,000₮", en: "Post Job · ₮5,000", ko: "공고 등록 · ₮5,000" })}
                  </p>
                </div>
              </div>
              <button onClick={closeQpay} className="rounded-lg p-1 hover:bg-white/20">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {qpayPaid ? (
                /* Success state */
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 size={52} className="text-green-500" />
                  <p className="text-lg font-bold text-blue-900">
                    {pick(locale, { mn: "Төлбөр амжилттай!", en: "Payment successful!", ko: "결제 완료!" })}
                  </p>
                  <p className="text-sm text-blue-900">
                    {pick(locale, { mn: "Таны зар хамгийн дээр гарлаа.", en: "Your job is now boosted to the top.", ko: "공고가 상단으로 이동했습니다." })}
                  </p>
                  <button
                    onClick={closeQpay}
                    className="mt-2 rounded-xl bg-[#22c55e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16a34a]"
                  >
                    {pick(locale, { mn: "Хаах", en: "Close", ko: "닫기" })}
                  </button>
                </div>
              ) : qpayLoading ? (
                /* Loading */
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1ba5db] border-t-transparent" />
                  <p className="text-sm text-blue-900">
                    {pick(locale, { mn: "QPay нэхэмжлэл үүсгэж байна...", en: "Creating QPay invoice...", ko: "QPay 청구서 생성 중..." })}
                  </p>
                </div>
              ) : (
                <>
                  {/* QR code */}
                  <div className="mb-4 flex flex-col items-center">
                    {qpayQrImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qpayQrImage} alt="QPay QR" width={200} height={200} className="rounded-xl border border-gray-100 p-2" />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gray-100 text-xs text-blue-900">
                        QR код
                      </div>
                    )}
                    <p className="mt-2 text-xs text-blue-900">
                      {pick(locale, { mn: "QPay апп-аар скан хийнэ үү", en: "Scan with QPay app", ko: "QPay 앱으로 스캔하세요" })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="mb-4 rounded-xl bg-[#eef7f1] px-4 py-3 text-center">
                    <p className="text-2xl font-extrabold text-[#22c55e]">{qpayAmount.toLocaleString()}₮</p>
                    <p className="text-xs text-blue-900">
                      {qpayPurpose === "boost"
                        ? pick(locale, { mn: "Зарыг дээшлүүлэх", en: "Boost Job", ko: "공고 부스트" })
                        : pick(locale, { mn: "Зар оруулах", en: "Post Job", ko: "공고 등록" })}
                    </p>
                  </div>


                  {/* Manual check */}
                  <button
                    onClick={checkQpayManual}
                    disabled={qpayChecking}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    <RefreshCw size={14} className={qpayChecking ? "animate-spin" : ""} />
                    {qpayChecking
                      ? pick(locale, { mn: "Шалгаж байна...", en: "Checking...", ko: "확인 중..." })
                      : pick(locale, { mn: "Төлбөр шалгах", en: "Check payment", ko: "결제 확인" })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
