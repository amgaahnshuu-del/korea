"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User { id: string; name: string; email: string; role: string }

interface Stats {
  totalJobs: number;
  totalApplications: number;
  pending: number;
  accepted: number;
  rejected: number;
  recentApplications: RecentApp[];
}

interface RecentApp {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; avatar: string | null };
  job: { id: string; title: string };
}

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
}

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null; phone: string | null };
  job: { id: string; title: string; location: string; type: string };
}

interface Company {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  industry: string | null;
  location: string | null;
  size: string | null;
  website: string | null;
  verified: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  INTERVIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const STATUS_MN: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  REVIEWED: "Харсан",
  INTERVIEWED: "Ярилцлага",
  ACCEPTED: "Хүлээн авсан",
  REJECTED: "Татгалзсан",
};

const JOB_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const JOB_STATUS_MN: Record<string, string> = {
  PENDING: "Хянагдаж буй",
  APPROVED: "Зөвшөөрсөн",
  REJECTED: "Татгалзсан",
};

const TYPE_MN: Record<string, string> = {
  FULL_TIME: "Бүтэн цагийн",
  PART_TIME: "Хагас цагийн",
  CONTRACT: "Гэрээт",
  INTERNSHIP: "Дадлага",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function RecruiterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"dashboard" | "jobs" | "applications" | "company">("dashboard");
  const [loading, setLoading] = useState(true);

  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null);

  // My Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Company
  const [company, setCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: "", logo: "", description: "", industry: "", location: "", size: "", website: "" });
  const [companySaving, setCompanySaving] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user: u }) => {
        if (!u || (u.role !== "EMPLOYER" && u.role !== "ADMIN")) {
          router.push("/login");
          return;
        }
        setUser(u);
        // Load dashboard stats
        fetch("/api/recruiter/stats")
          .then((r) => r.json())
          .then((d) => { setStats(d); setLoading(false); });
      });
  }, [router]);

  const loadJobs = useCallback(() => {
    setJobsLoading(true);
    fetch("/api/recruiter/jobs")
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs || []); setJobsLoading(false); });
  }, []);

  const loadApplications = useCallback(() => {
    setAppsLoading(true);
    fetch("/api/recruiter/applications")
      .then((r) => r.json())
      .then((d) => { setApplications(d.applications || []); setAppsLoading(false); });
  }, []);

  const loadCompany = useCallback(() => {
    fetch("/api/recruiter/company")
      .then((r) => r.json())
      .then((d) => {
        setCompany(d.company);
        if (d.company) {
          setCompanyForm({
            name: d.company.name || "",
            logo: d.company.logo || "",
            description: d.company.description || "",
            industry: d.company.industry || "",
            location: d.company.location || "",
            size: d.company.size || "",
            website: d.company.website || "",
          });
        }
      });
  }, []);

  useEffect(() => {
    if (tab === "jobs") loadJobs();
    if (tab === "applications") loadApplications();
    if (tab === "company") loadCompany();
  }, [tab, loadJobs, loadApplications, loadCompany]);

  const deleteJob = async (id: string) => {
    if (!confirm("Энэ зарыг устгах уу?")) return;
    setDeletingJobId(id);
    await fetch(`/api/recruiter/jobs/${id}`, { method: "DELETE" });
    setDeletingJobId(null);
    loadJobs();
    // Refresh stats
    fetch("/api/recruiter/stats").then((r) => r.json()).then(setStats);
  };

  const updateAppStatus = async (id: string, status: string) => {
    await fetch(`/api/recruiter/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    fetch("/api/recruiter/stats").then((r) => r.json()).then(setStats);
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySaving(true);
    const res = await fetch("/api/recruiter/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyForm),
    });
    const d = await res.json();
    setCompany(d.company);
    setCompanySaving(false);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filteredApps = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-blue-800 font-bold text-lg">Ajil Korea</Link>
          <p className="text-xs text-gray-400 mt-0.5">Ажил олгогчийн портал</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {([
            { id: "dashboard", icon: "🏠", label: "Хяналтын самбар" },
            { id: "jobs", icon: "💼", label: "Миний зарууд" },
            { id: "applications", icon: "📋", label: "Өргөдлүүд" },
            { id: "company", icon: "🏢", label: "Компани профайл" },
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition ${tab === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link href="/jobs/post" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-xl font-semibold">
            ➕ Зар нийтлэх
          </Link>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl"
          >
            🚪 Гарах
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            {tab === "dashboard" && "Хяналтын самбар"}
            {tab === "jobs" && "Миний зар"}
            {tab === "applications" && "Өргөдлүүд"}
            {tab === "company" && "Компани профайл"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">Ажил олгогч</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {/* ── DASHBOARD TAB ─────────────────────────────────────────── */}
          {tab === "dashboard" && stats && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Нийт зар", value: stats.totalJobs, icon: "💼", color: "text-blue-700" },
                  { label: "Нийт өргөдөл", value: stats.totalApplications, icon: "📋", color: "text-purple-700" },
                  { label: "Хүлээгдэж буй", value: stats.pending, icon: "⏳", color: "text-yellow-600" },
                  { label: "Хүлээн авсан", value: stats.accepted, icon: "✅", color: "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Сүүлийн өргөдлүүд</h2>
                  <button onClick={() => setTab("applications")} className="text-xs text-blue-600 hover:underline">
                    Бүгдийг харах →
                  </button>
                </div>
                {stats.recentApplications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm">Одоогоор өргөдөл ирээгүй байна</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {app.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{app.user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{app.job.title}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[app.status]}`}>
                          {STATUS_MN[app.status]}
                        </span>
                        <p className="text-xs text-gray-400 shrink-0">{new Date(app.createdAt).toLocaleDateString("mn-MN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => setTab("jobs")}
                  className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-2xl mb-2">💼</div>
                  <p className="font-semibold text-gray-800">Миний зарууд</p>
                  <p className="text-xs text-gray-400 mt-1">Нийтэлсэн зарыг харах, устгах</p>
                </button>
                <Link
                  href="/jobs/post"
                  className="bg-blue-700 text-white rounded-2xl p-5 hover:bg-blue-800 transition"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <p className="font-semibold">Шинэ зар нийтлэх</p>
                  <p className="text-xs text-blue-200 mt-1">Ажлын байрны зар оруулах</p>
                </Link>
              </div>
            </div>
          )}

          {/* ── MY JOBS TAB ───────────────────────────────────────────── */}
          {tab === "jobs" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Нийт <span className="font-semibold text-gray-800">{jobs.length}</span> зар</p>
                <Link href="/jobs/post" className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition">
                  ➕ Зар нийтлэх
                </Link>
              </div>

              {jobsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-20" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                  <div className="text-5xl mb-4">💼</div>
                  <p className="text-gray-500">Одоогоор зар байхгүй байна</p>
                  <Link href="/jobs/post" className="mt-4 inline-block bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                    Зар нийтлэх
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-700 truncate">
                            {job.title}
                          </Link>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${JOB_STATUS_COLORS[job.status]}`}>
                            {JOB_STATUS_MN[job.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {job.location} · {TYPE_MN[job.type]} · {new Date(job.createdAt).toLocaleDateString("mn-MN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-700">{job._count.applications}</p>
                          <p className="text-xs text-gray-400">өргөдөл</p>
                        </div>
                        <button
                          onClick={() => deleteJob(job.id)}
                          disabled={deletingJobId === job.id}
                          className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingJobId === job.id ? "..." : "Устгах"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── APPLICATIONS TAB ──────────────────────────────────────── */}
          {tab === "applications" && (
            <div>
              {/* Filter */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-sm text-gray-500">
                  Нийт <span className="font-semibold text-gray-800">{filteredApps.length}</span> өргөдөл
                </p>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none ml-auto"
                >
                  <option value="">Бүх төлөв</option>
                  {Object.entries(STATUS_MN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {appsLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-24" />
                  ))}
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-500">Өргөдөл байхгүй байна</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map((app) => (
                    <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {app.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{app.user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                              {STATUS_MN[app.status]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{app.user.email}{app.user.phone && ` · ${app.user.phone}`}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            <Link href={`/jobs/${app.job.id}`} className="hover:underline">{app.job.title}</Link>
                            {" · "}{app.job.location} · {TYPE_MN[app.job.type]}
                          </p>
                          {app.message && (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2 italic">"{app.message}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{new Date(app.createdAt).toLocaleDateString("mn-MN")}</p>
                        </div>
                        {/* Status actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          {(["REVIEWED","INTERVIEWED","ACCEPTED","REJECTED"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateAppStatus(app.id, s)}
                              disabled={app.status === s}
                              className={`text-xs px-3 py-1 rounded-lg border transition disabled:opacity-40 disabled:cursor-default
                                ${s === "ACCEPTED" ? "border-green-300 text-green-700 hover:bg-green-50" :
                                  s === "REJECTED" ? "border-red-300 text-red-600 hover:bg-red-50" :
                                  "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                            >
                              {STATUS_MN[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COMPANY TAB ───────────────────────────────────────────── */}
          {tab === "company" && (
            <div className="max-w-2xl">
              {company?.verified && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
                  ✓ Таны компани баталгаажсан байна
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5">Компаний мэдээлэл</h2>

                <form onSubmit={saveCompany} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Компаний нэр *</label>
                    <input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                      placeholder="Жишээ: Samsung Electronics"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Лого URL</label>
                    <input
                      value={companyForm.logo}
                      onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                    {companyForm.logo && (
                      <img src={companyForm.logo} alt="logo preview" className="w-12 h-12 rounded-xl object-cover mt-2 border border-gray-200" />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Тайлбар</label>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                      placeholder="Компаний үйл ажиллагааны товч тайлбар..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Салбар</label>
                      <input
                        value={companyForm.industry}
                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        placeholder="Жишээ: Үйлдвэрлэл"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Байршил</label>
                      <input
                        value={companyForm.location}
                        onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                        placeholder="Жишээ: Seoul, SK"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ажилчдын тоо</label>
                      <select
                        value={companyForm.size}
                        onChange={(e) => setCompanyForm({ ...companyForm, size: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      >
                        <option value="">Сонгох</option>
                        <option value="1-10">1–10</option>
                        <option value="11-50">11–50</option>
                        <option value="51-200">51–200</option>
                        <option value="201-500">201–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Вэбсайт</label>
                      <input
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        placeholder="https://company.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={companySaving}
                    className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60"
                  >
                    {companySaving ? "Хадгалж байна..." : companySaved ? "✓ Хадгалагдлаа!" : "Хадгалах"}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
