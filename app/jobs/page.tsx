"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORIES, JOB_TYPE_LABELS, JOB_TYPE_COLORS, formatSalary, timeAgo } from "@/lib/constants";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

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

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search by job title, company..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg border ${view === "list" ? "bg-blue-700 text-white border-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
              >
                ☰
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg border ${view === "grid" ? "bg-blue-700 text-white border-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
              >
                ⊞
              </button>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="">Бүх төрөл</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Filter ({total} Results)</h3>

            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="cat" checked={category === ""} onChange={() => { setCategory(""); setPage(1); }} className="text-blue-600" />
                  <span>All Categories</span>
                </label>
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="cat" checked={category === c} onChange={() => { setCategory(c); setPage(1); }} className="text-blue-600" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Type</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="type" checked={type === ""} onChange={() => { setType(""); setPage(1); }} />
                  <span>All Types</span>
                </label>
                {JOB_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="type" checked={type === t} onChange={() => { setType(t); setPage(1); }} />
                    <span>{JOB_TYPE_LABELS[t]}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setQ(""); setCategory(""); setType(""); setPage(1); }}
              className="w-full bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Job Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-800">{jobs.length}</span> of <span className="font-semibold text-gray-800">{total}</span> jobs
            </p>
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option>Newest Post</option>
              <option>Salary High-Low</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                    {job.company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition truncate">{job.title}</h3>
                      {job.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{job.company.name} {job.company.verified && "✓"} · {job.location}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${JOB_TYPE_COLORS[job.type]}`}>{JOB_TYPE_LABELS[job.type]}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{job.category}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {formatSalary(job.salaryMin, job.salaryMax) && (
                      <p className="text-sm font-bold text-blue-700 mb-1">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                    )}
                    <p className="text-xs text-gray-400">{timeAgo(job.createdAt)}</p>
                    <span className="inline-block mt-2 text-xs bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium">Apply Now</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">‹</button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm ${page === p ? "bg-blue-700 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">›</button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
