"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, List, LayoutGrid, CheckCircle2, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Footer from "@/components/Footer";
import { formatRelativeTime, formatSalary, getCategoryLabel, getJobTypeLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const CATEGORY_KEYS = [
  "Manufacturing", "IT & Tech", "Food & Beverage", "Construction",
  "Logistics", "Healthcare", "Agriculture", "Service & Sales",
];
const VISA_TYPES = ["E-9", "E-7", "D-2", "H-2", "F-4"];

interface Job {
  id: string; title: string; location: string; type: string; category: string;
  salaryMin: number | null; salaryMax: number | null; createdAt: string;
  featured: boolean; expiresAt: string | null;
  company: { name: string; logo: string | null; verified: boolean; location: string };
}

export default function JobsPage() {
  const { locale } = useLanguage();
  const t = getTranslation(locale, "jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [visa, setVisa] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [mobileFilter, setMobileFilter] = useState(false);

  const now = Date.now();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (q)        params.set("q", q);
    if (category) params.set("category", category);
    if (type)     params.set("type", type);
    if (location) params.set("location", location);
    if (visa)     params.set("q", (q ? q + " " : "") + visa);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, q, category, type, location, visa, salaryMin, salaryMax]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const resetFilters = () => { setQ(""); setCategory(""); setType(""); setLocation(""); setVisa(""); setSalaryMin(""); setSalaryMax(""); setPage(1); };

  const activeFiltersCount = [category, type, location, visa, salaryMin, salaryMax].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{t.filterTitle} ({total} {pick(locale, { mn: "үр дүн", en: "results", ko: "결과" })})</h3>
        {activeFiltersCount > 0 && <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><X size={11} />{pick(locale, { mn: "Арилгах", en: "Clear", ko: "초기화" })}</button>}
      </div>

      {/* Location */}
      <div className="mb-5">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Байршил", en: "Location", ko: "위치" })}</h4>
        <input value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }} placeholder={pick(locale, { mn: "Сөүл, Пусан...", en: "Seoul, Busan...", ko: "서울, 부산..." })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
      </div>

      {/* Category */}
      <div className="mb-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Ангилал", en: "Category", ko: "카테고리" })}</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="cat" checked={category === ""} onChange={() => { setCategory(""); setPage(1); }} className="text-blue-600" /><span>{t.allCategories}</span>
          </label>
          {CATEGORY_KEYS.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="cat" checked={category === key} onChange={() => { setCategory(key); setPage(1); }} className="text-blue-600" /><span>{getCategoryLabel(locale, key)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Ажлын төрөл", en: "Job Type", ko: "채용 유형" })}</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="type" checked={type === ""} onChange={() => { setType(""); setPage(1); }} /><span>{t.allTypes}</span>
          </label>
          {JOB_TYPES.map((jobType) => (
            <label key={jobType} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="type" checked={type === jobType} onChange={() => { setType(jobType); setPage(1); }} /><span>{getJobTypeLabel(locale, jobType)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Visa Type */}
      <div className="mb-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Визний төрөл", en: "Visa Type", ko: "비자 유형" })}</h4>
        <div className="flex flex-wrap gap-2">
          {VISA_TYPES.map((v) => (
            <button key={v} onClick={() => { setVisa(visa === v ? "" : v); setPage(1); }} className={`rounded-full px-3 py-1 text-xs font-medium transition ${visa === v ? "bg-blue-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Цалингийн хязгаар (₩)", en: "Salary Range (₩)", ko: "급여 범위 (₩)" })}</h4>
        <div className="flex items-center gap-2">
          <input type="number" value={salaryMin} onChange={(e) => { setSalaryMin(e.target.value); setPage(1); }} placeholder={pick(locale, { mn: "Доод", en: "Min", ko: "최소" })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" min={0} />
          <span className="text-gray-400">–</span>
          <input type="number" value={salaryMax} onChange={(e) => { setSalaryMax(e.target.value); setPage(1); }} placeholder={pick(locale, { mn: "Дээд", en: "Max", ko: "최대" })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" min={0} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input type="text" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={pick(locale, { mn: "Ажил, компани, байршлаар хайх...", en: "Search by title, company, location...", ko: "직무, 회사, 위치 검색..." })} className="flex-1 bg-transparent text-sm outline-none" />
              {q && <button onClick={() => { setQ(""); setPage(1); }}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMobileFilter(!mobileFilter)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm md:hidden ${activeFiltersCount > 0 ? "border-blue-700 bg-blue-700 text-white" : "border-gray-200 text-gray-600"}`}>
                <SlidersHorizontal size={14} />{activeFiltersCount > 0 ? `(${activeFiltersCount})` : pick(locale, { mn: "Шүүлт", en: "Filter", ko: "필터" })}
              </button>
              <button onClick={() => setView("list")} className={`rounded-lg border p-2 ${view === "list" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}><List size={16} /></button>
              <button onClick={() => setView("grid")} className={`rounded-lg border p-2 ${view === "grid" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}><LayoutGrid size={16} /></button>
              <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none">
                <option value="">{t.allTypes}</option>
                {JOB_TYPES.map((jt) => <option key={jt} value={jt}>{getJobTypeLabel(locale, jt)}</option>)}
              </select>
            </div>
          </div>
          {mobileFilter && <div className="mt-3 md:hidden"><FilterPanel /></div>}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24"><FilterPanel /></div>
        </aside>

        {/* Job list */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{pick(locale, { mn: `${total} ажлаас ${jobs.length} нь харагдаж байна`, en: `Showing ${jobs.length} of ${total} jobs`, ko: `${total}개 채용 중 ${jobs.length}개 표시` })}</p>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"><div className="flex gap-4"><div className="h-12 w-12 rounded-xl bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded bg-gray-200" /><div className="h-3 w-1/2 rounded bg-gray-200" /></div></div></div>)}</div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg text-gray-500">{t.noJobsFound}</p>
              {activeFiltersCount > 0 && <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">{pick(locale, { mn: "Шүүлтүүр арилгах", en: "Clear filters", ko: "필터 초기화" })}</button>}
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-3"}>
              {jobs.map((job) => {
                const expired = job.expiresAt ? new Date(job.expiresAt) < new Date(now) : false;
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-blue-700">{job.title}</h3>
                        {job.featured && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">{t.featured}</span>}
                        {expired && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{pick(locale, { mn: "Дуусгавар", en: "Expired", ko: "만료됨" })}</span>}
                      </div>
                      <p className="mb-2.5 flex items-center gap-1 text-sm text-gray-500">
                        {job.company.name} {job.company.verified && <CheckCircle2 className="inline h-3.5 w-3.5 text-blue-500" />} · {job.location}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{getJobTypeLabel(locale, job.type)}</span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{getCategoryLabel(locale, job.category)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                      <div className="text-right">
                        {formatSalary(locale, job.salaryMin, job.salaryMax) && <p className="text-sm font-bold text-blue-700">{formatSalary(locale, job.salaryMin, job.salaryMax)}</p>}
                        <p className="text-xs text-gray-400">{formatRelativeTime(locale, job.createdAt)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-blue-800">{pick(locale, { mn: "Харах", en: "View", ko: "보기" })} <ArrowRight size={12} /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">‹</button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-2 text-sm ${page === p ? "bg-blue-700 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">›</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
