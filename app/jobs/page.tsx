"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, List, LayoutGrid, CheckCircle2, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { formatRelativeTime, formatSalary, getCategoryLabel, getJobTypeLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
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

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  featured: boolean;
  company: { name: string; logo: string | null; verified: boolean; location: string };
}

export default function JobsPage() {
  const { locale } = useLanguage();
  const t = getTranslation(locale, "jobs");
  const common = getTranslation(locale, "common");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, q, category, type]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const resultsText = pick(locale, {
    mn: `${total} ажлаас ${jobs.length} нь харагдаж байна`,
    en: `Showing ${jobs.length} of ${total} jobs`,
    ko: `${total}개 채용 중 ${jobs.length}개 표시`,
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={pick(locale, { mn: "Ажлын нэр, компаниар хайх...", en: "Search by job title, company...", ko: "채용 제목이나 회사명으로 검색..." })}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`rounded-lg border p-2 ${view === "list" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                aria-label={pick(locale, { mn: "Жагсаалт", en: "List view", ko: "목록 보기" })}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`rounded-lg border p-2 ${view === "grid" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                aria-label={pick(locale, { mn: "Сүлжээ", en: "Grid view", ko: "격자 보기" })}
              >
                <LayoutGrid size={16} />
              </button>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                <option value="">{t.allTypes}</option>
                {JOB_TYPES.map((jobType) => (
                  <option key={jobType} value={jobType}>
                    {getJobTypeLabel(locale, jobType)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              {t.filterTitle} ({total} {pick(locale, { mn: "үр дүн", en: "results", ko: "결과" })})
            </h3>

            <div className="mb-5">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Ангилал", en: "Category", ko: "카테고리" })}</h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="cat"
                    checked={category === ""}
                    onChange={() => {
                      setCategory("");
                      setPage(1);
                    }}
                    className="text-blue-600"
                  />
                  <span>{t.allCategories}</span>
                </label>
                {CATEGORY_KEYS.map((key) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === key}
                      onChange={() => {
                        setCategory(key);
                        setPage(1);
                      }}
                      className="text-blue-600"
                    />
                    <span>{getCategoryLabel(locale, key)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{pick(locale, { mn: "Ажлын төрөл", en: "Job Type", ko: "채용 유형" })}</h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="type"
                    checked={type === ""}
                    onChange={() => {
                      setType("");
                      setPage(1);
                    }}
                  />
                  <span>{t.allTypes}</span>
                </label>
                {JOB_TYPES.map((jobType) => (
                  <label key={jobType} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="type"
                      checked={type === jobType}
                      onChange={() => {
                        setType(jobType);
                        setPage(1);
                      }}
                    />
                    <span>{getJobTypeLabel(locale, jobType)}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setQ("");
                setCategory("");
                setType("");
                setPage(1);
              }}
              className="w-full rounded-xl bg-blue-700 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              {t.applyFilters}
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{resultsText}</p>
            <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none">
              <option>{t.newestPost}</option>
              <option>{t.salaryHighLow}</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg text-gray-500">{t.noJobsFound}</p>
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-3"}>
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-blue-700">{job.title}</h3>
                      {job.featured && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">{t.featured}</span>}
                    </div>
                    <p className="mb-2.5 flex items-center gap-1 text-sm text-gray-500">
                      {job.company.name} {job.company.verified && <CheckCircle2 className="inline h-3.5 w-3.5 text-blue-500" />} · {job.location}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {getJobTypeLabel(locale, job.type)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {getCategoryLabel(locale, job.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                    <div className="text-right">
                      {formatSalary(locale, job.salaryMin, job.salaryMax) && (
                        <p className="text-sm font-bold text-blue-700">{formatSalary(locale, job.salaryMin, job.salaryMax)}</p>
                      )}
                      <p className="text-xs text-gray-400">{formatRelativeTime(locale, job.createdAt)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-blue-800">
                      {pick(locale, { mn: "Харах", en: "View", ko: "보기" })} <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-2 text-sm ${page === p ? "bg-blue-700 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
