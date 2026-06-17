"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, LogOut, Flag, CheckCircle, XCircle, Trash2, ShieldOff, ShieldCheck, Menu, X } from "lucide-react";
import { formatDate, getJobStatusLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface DashStats {
  totalJobs: number;
  approvedJobs: number;
  pendingJobs: number;
  rejectedJobs: number;
  expiredJobs: number;
  totalUsers: number;
  totalApps: number;
  totalReports: number;
  recentJobs: JobRow[];
}

interface ReportRow {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  job: { id: string; title: string; status: string; company: { name: string } };
  user: { id: string; name: string; email: string };
}

interface JobRow {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  company: { name: string; logo: string | null };
  _count: { applications: number };
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  _count: { applications: number };
}

interface UserReportRow {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reportedUser: { id: string; name: string; email: string; isBlocked: boolean };
  reporter: { id: string; name: string; email: string };
}

interface AllJob extends JobRow {
  location: string;
  type: string;
  category: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  recruiterName: string | null;
  phoneNumber: string | null;
  kakaoId: string | null;
  views: number;
  expiresAt: string | null;
  featured: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED:  "bg-gray-100 text-blue-900",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  USER: "bg-gray-100 text-blue-900",
};

type Tab = "dashboard" | "users" | "jobs" | "reports" | "userReports";

export default function AdminPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = getTranslation(locale, "admin");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<DashStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [allJobs, setAllJobs] = useState<AllJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [userReports, setUserReports] = useState<UserReportRow[]>([]);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [previewJob, setPreviewJob] = useState<AllJob | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user || user.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        loadStats();
      });
  }, [router]);

  const loadStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  const loadUsers = useCallback(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, []);

  const loadAllJobs = useCallback(() => {
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((d) => setAllJobs(d.jobs || []));
  }, []);

  const loadReports = useCallback(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []));
  }, []);

  const loadUserReports = useCallback(() => {
    fetch("/api/admin/user-reports")
      .then((r) => r.json())
      .then((d) => setUserReports(d.reports || []));
  }, []);

  const blockUser = async (userId: string, block: boolean) => {
    setBlockingUserId(userId);
    await fetch(`/api/admin/users/${userId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: block }),
    });
    loadUsers();
    loadUserReports();
    setBlockingUserId(null);
  };

  const openJobPreview = async (jobId: string) => {
    const found = allJobs.find((j) => j.id === jobId);
    if (found) { setPreviewJob(found); return; }
    const res = await fetch(`/api/admin/jobs?page=1`);
    const data = await res.json();
    const job = (data.jobs as AllJob[]).find((j) => j.id === jobId);
    if (job) setPreviewJob(job);
  };

  const updateUserReportStatus = async (id: string, status: string) => {
    setDismissing(id);
    await fetch("/api/admin/user-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadUserReports();
    setDismissing(null);
  };

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "jobs") loadAllJobs();
    if (tab === "reports") loadReports();
    if (tab === "userReports") loadUserReports();
  }, [tab, loadUsers, loadAllJobs, loadReports, loadUserReports]);

  const deleteJob = async (id: string) => {
    if (!confirm(pick(locale, { mn: "Энэ зарыг устгах уу? Буцаах боломжгүй.", en: "Delete this job? This cannot be undone.", ko: "이 공고를 삭제하시겠습니까? 되돌릴 수 없습니다." }))) return;
    setDeleting(id);
    await fetch("/api/admin/jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadStats();
    loadAllJobs();
    loadReports();
    setDeleting(null);
  };

  const updateReportStatus = async (id: string, status: string) => {
    setDismissing(id);
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadReports();
    loadStats();
    setDismissing(null);
  };

  const updateJobStatus = async (id: string, status: string) => {
    setApproving(id);
    await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadStats();
    loadAllJobs();
    setApproving(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 rounded-full border-4 border-[#22c55e] border-t-transparent animate-spin" />
      </div>
    );
  }

  const roleLabel = (role: string) =>
    (pick(locale, {
      mn: { ADMIN: "Админ", USER: "Хэрэглэгч" },
      en: { ADMIN: "Admin", USER: "User" },
      ko: { ADMIN: "관리자", USER: "사용자" },
    }) as Record<string, string>)[role] ?? role;

  const menuItems: { id: Tab; icon: ReactNode; label: string; badge?: number }[] = [
    { id: "dashboard", icon: <LayoutDashboard size={16} />, label: t.dashboard },
    { id: "users",     icon: <Users size={16} />,           label: t.users },
    { id: "jobs",      icon: <Briefcase size={16} />,       label: t.jobs },
    {
      id: "reports",
      icon: <Flag size={16} />,
      label: pick(locale, { mn: "Зарын гомдол", en: "Job Reports", ko: "공고 신고" }),
      badge: stats?.totalReports ?? 0,
    },
    {
      id: "userReports",
      icon: <ShieldOff size={16} />,
      label: pick(locale, { mn: "Хэрэглэгчийн гомдол", en: "User Reports", ko: "사용자 신고" }),
      badge: userReports.filter((r) => r.status === "OPEN").length,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:w-56 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <Link href="/" className="text-lg font-bold text-blue-900">Ajil Korea</Link>
            <p className="mt-0.5 text-xs text-blue-900">{t.dashboard}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-blue-900 hover:bg-gray-100 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${tab === item.id ? "bg-[#eef7f1] font-semibold text-[#22c55e]" : "text-blue-900 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {!!item.badge && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-blue-900 hover:bg-gray-100 lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-blue-900">{menuItems.find((m) => m.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e] text-sm font-bold text-white">A</div>
            <div>
              <p className="text-sm font-semibold text-blue-900">{roleLabel("ADMIN")}</p>
              <p className="text-xs text-blue-900">Ajil Korea</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">

          {/* ── Dashboard ── */}
          {tab === "dashboard" && stats && (
            <div>
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  {
                    label: pick(locale, { mn: "Нийт зар", en: "Total Jobs", ko: "전체 공고" }),
                    value: stats.totalJobs,
                    icon: <Briefcase className="h-5 w-5 text-[#22c55e]" />,
                    color: "text-[#22c55e]",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Зөвшөөрөгдсөн", en: "Approved", ko: "승인됨" }),
                    value: stats.approvedJobs,
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                    color: "text-green-600",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Хянагдаж буй", en: "Pending", ko: "심사 중" }),
                    value: stats.pendingJobs,
                    icon: <Briefcase className="h-5 w-5 text-yellow-600" />,
                    color: "text-yellow-600",
                    bg: stats.pendingJobs > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Татгалзсан", en: "Rejected", ko: "거부됨" }),
                    value: stats.rejectedJobs,
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                    color: "text-red-500",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Хугацаа дууссан", en: "Expired", ko: "만료됨" }),
                    value: stats.expiredJobs,
                    icon: <XCircle className="h-5 w-5 text-blue-900" />,
                    color: "text-blue-900",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Хэрэглэгчид", en: "Users", ko: "사용자" }),
                    value: stats.totalUsers,
                    icon: <Users className="h-5 w-5 text-purple-700" />,
                    color: "text-purple-700",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Нийт өргөдөл", en: "Applications", ko: "지원서" }),
                    value: stats.totalApps,
                    icon: <LayoutDashboard className="h-5 w-5 text-green-700" />,
                    color: "text-green-700",
                    bg: "bg-white",
                  },
                  {
                    label: pick(locale, { mn: "Нээлттэй гомдол", en: "Open Reports", ko: "미처리 신고" }),
                    value: stats.totalReports,
                    icon: <Flag className="h-5 w-5 text-orange-500" />,
                    color: "text-orange-500",
                    bg: stats.totalReports > 0 ? "bg-orange-50 border-orange-200" : "bg-white",
                  },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl border ${s.bg} p-4`}>
                    <div className="mb-2">{s.icon}</div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-blue-900">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent jobs */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 font-bold text-blue-900">
                  {pick(locale, { mn: "Хянагдах зарууд", en: "Pending Review", ko: "승인 대기 공고" })}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-blue-900">
                        <th className="pb-3 font-medium text-left">{t.company}</th>
                        <th className="pb-3 font-medium text-left">{t.title}</th>
                        <th className="pb-3 font-medium text-left">{t.createdAt}</th>
                        <th className="pb-3 font-medium text-left">{t.status}</th>
                        <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Үйлдэл", en: "Action", ko: "작업" })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.recentJobs || []).map((job) => (
                        <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] text-xs font-bold text-[#22c55e]">
                                {job.company.name.charAt(0)}
                              </div>
                              <span className="max-w-25 truncate text-xs text-blue-900">{job.company.name}</span>
                            </div>
                          </td>
                          <td className="max-w-xs py-3">
                            <button onClick={() => openJobPreview(job.id)} className="truncate text-left text-sm font-medium text-blue-900 hover:text-[#22c55e] hover:underline w-full">
                              {job.title}
                            </button>
                          </td>
                          <td className="py-3 text-xs text-blue-900">{formatDate(locale, job.createdAt)}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[job.status]}`}>
                              {getJobStatusLabel(locale, job.status)}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <button onClick={() => openJobPreview(job.id)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                                {t.view}
                              </button>
                              {job.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "APPROVED")}
                                    disabled={approving === job.id}
                                    className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                                  >
                                    {approving === job.id ? "..." : t.approve}
                                  </button>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "REJECTED")}
                                    disabled={approving === job.id}
                                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                                  >
                                    {approving === job.id ? "..." : t.reject}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteJob(job.id)}
                                disabled={deleting === job.id}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                                title={pick(locale, { mn: "Устгах", en: "Delete", ko: "삭제" })}
                              >
                                {deleting === job.id ? "..." : <Trash2 size={12} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!stats.recentJobs?.length && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-blue-900">
                            {pick(locale, { mn: "Хянагдах зар байхгүй байна", en: "No pending jobs", ko: "대기 중인 공고 없음" })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-bold text-blue-900">{t.allUsers}</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={pick(locale, { mn: "И-мэйлээр хайх...", en: "Search by email...", ko: "이메일로 검색..." })}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-blue-900 outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] w-56"
                  />
                  <span className="text-xs text-blue-900 whitespace-nowrap">
                    {users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase())).length} {pick(locale, { mn: "хэрэглэгч", en: "users", ko: "명" })}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-blue-900">
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Нэр", en: "Name", ko: "이름" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "И-мэйл", en: "Email", ko: "이메일" })}</th>
                      <th className="pb-3 font-medium text-left">{t.role}</th>
                      <th className="pb-3 font-medium text-left">{t.applications}</th>
                      <th className="pb-3 font-medium text-left">{t.createdAt}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Үйлдэл", en: "Action", ko: "작업" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                      <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 ${u.isBlocked ? "bg-red-50/40" : ""}`}>
                        <td className="py-3">
                          <p className="font-medium text-blue-900">{u.name}</p>
                          {u.isBlocked && (
                            <span className="mt-0.5 inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                              {pick(locale, { mn: "Блоклогдсон", en: "Blocked", ko: "차단됨" })}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-xs text-blue-900">{u.email}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[u.role]}`}>{roleLabel(u.role)}</span>
                        </td>
                        <td className="py-3 text-center text-xs text-blue-900">{u._count.applications}</td>
                        <td className="py-3 text-xs text-blue-900">{formatDate(locale, u.createdAt)}</td>
                        <td className="py-3">
                          {u.role !== "ADMIN" && (
                            <button
                              onClick={() => blockUser(u.id, !u.isBlocked)}
                              disabled={blockingUserId === u.id}
                              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs disabled:opacity-60 ${u.isBlocked ? "border-green-200 text-green-600 hover:bg-green-50" : "border-red-200 text-red-500 hover:bg-red-50"}`}
                            >
                              {blockingUserId === u.id ? "..." : u.isBlocked
                                ? <><ShieldCheck size={11} /> {pick(locale, { mn: "Нээх", en: "Unblock", ko: "차단 해제" })}</>
                                : <><ShieldOff size={11} /> {pick(locale, { mn: "Блоклох", en: "Block", ko: "차단" })}</>
                              }
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-blue-900">{t.noUsers}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Jobs ── */}
          {tab === "jobs" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-blue-900">{t.allJobs}</h2>
                <span className="text-xs text-blue-900">{allJobs.length} {t.jobs}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-blue-900">
                      <th className="pb-3 font-medium text-left">{t.title}</th>
                      <th className="pb-3 font-medium text-left">{t.company}</th>
                      <th className="pb-3 font-medium text-left">{t.location}</th>
                      <th className="pb-3 font-medium text-left">{t.applications}</th>
                      <th className="pb-3 font-medium text-left">{t.status}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Үйлдэл", en: "Action", ko: "작업" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="max-w-45 py-3">
                          <button onClick={() => setPreviewJob(job)} className="truncate text-left text-sm font-medium text-blue-900 hover:text-[#22c55e] hover:underline w-full">
                            {job.title}
                          </button>
                        </td>
                        <td className="py-3 text-xs text-blue-900">{job.company.name}</td>
                        <td className="py-3 text-xs text-blue-900">{job.location}</td>
                        <td className="py-3 text-center text-xs">{job._count.applications}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[job.status]}`}>
                            {getJobStatusLabel(locale, job.status)}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setPreviewJob(job)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                              {t.view}
                            </button>
                            {job.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => updateJobStatus(job.id, "APPROVED")}
                                  disabled={approving === job.id}
                                  className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                                >
                                  {approving === job.id ? "..." : t.approve}
                                </button>
                                <button
                                  onClick={() => updateJobStatus(job.id, "REJECTED")}
                                  disabled={approving === job.id}
                                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                                >
                                  {approving === job.id ? "..." : t.reject}
                                </button>
                              </>
                            )}
                            {job.status === "APPROVED" && (
                              <button
                                onClick={() => updateJobStatus(job.id, "REJECTED")}
                                disabled={approving === job.id}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                              >
                                {approving === job.id ? "..." : t.reject}
                              </button>
                            )}
                            {(job.status === "REJECTED" || job.status === "EXPIRED") && (
                              <button
                                onClick={() => updateJobStatus(job.id, "APPROVED")}
                                disabled={approving === job.id}
                                className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                              >
                                {approving === job.id ? "..." : t.approve}
                              </button>
                            )}
                            <button
                              onClick={() => deleteJob(job.id)}
                              disabled={deleting === job.id}
                              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                              title={pick(locale, { mn: "Устгах", en: "Delete", ko: "삭제" })}
                            >
                              {deleting === job.id ? "..." : <Trash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allJobs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-blue-900">{t.noJobs}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {tab === "reports" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-blue-900">
                  {pick(locale, { mn: "Ирсэн гомдлууд", en: "Job Reports", ko: "신고 목록" })}
                </h2>
                <span className="text-xs text-blue-900">
                  {reports.length} {pick(locale, { mn: "гомдол", en: "reports", ko: "건" })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-blue-900">
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Зар", en: "Job", ko: "공고" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Мэдэгдсэн", en: "Reported by", ko: "신고자" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Шалтгаан", en: "Reason", ko: "이유" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Тайлбар", en: "Description", ko: "설명" })}</th>
                      <th className="pb-3 font-medium text-left">{t.status}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Үйлдэл", en: "Action", ko: "작업" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3">
                          <button
                            onClick={() => openJobPreview(r.job.id)}
                            className="max-w-35 truncate text-left text-sm font-medium text-[#22c55e] hover:underline block"
                          >
                            {r.job.title}
                          </button>
                          <p className="text-xs text-blue-900">{r.job.company.name}</p>
                        </td>
                        <td className="py-3 text-xs text-blue-900">
                          <p className="font-medium">{r.user.name}</p>
                          <p className="text-blue-900">{r.user.email}</p>
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{r.reason}</span>
                        </td>
                        <td className="max-w-[200px] py-3 text-xs text-blue-900">
                          <span className="line-clamp-2">{r.description || "—"}</span>
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs ${r.status === "OPEN" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-blue-900"}`}>
                            {r.status === "OPEN"
                              ? pick(locale, { mn: "Нээлттэй", en: "Open", ko: "미처리" })
                              : pick(locale, { mn: "Хаасан", en: "Closed", ko: "처리완료" })}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {r.status === "OPEN" ? (
                              <button
                                onClick={() => updateReportStatus(r.id, "CLOSED")}
                                disabled={dismissing === r.id}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-blue-900 hover:bg-gray-50 disabled:opacity-60"
                              >
                                {dismissing === r.id ? "..." : pick(locale, { mn: "Хаах", en: "Dismiss", ko: "닫기" })}
                              </button>
                            ) : (
                              <button
                                onClick={() => updateReportStatus(r.id, "OPEN")}
                                disabled={dismissing === r.id}
                                className="rounded-lg border border-orange-200 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                              >
                                {dismissing === r.id ? "..." : pick(locale, { mn: "Нээх", en: "Reopen", ko: "재처리" })}
                              </button>
                            )}
                            <button
                              onClick={() => deleteJob(r.job.id)}
                              disabled={deleting === r.job.id}
                              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                              title={pick(locale, { mn: "Зарыг устгах", en: "Delete job", ko: "공고 삭제" })}
                            >
                              {deleting === r.job.id ? "..." : <Trash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-blue-900">
                          {pick(locale, { mn: "Гомдол байхгүй", en: "No reports", ko: "신고 없음" })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── User Reports ── */}
          {tab === "userReports" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-blue-900">
                  {pick(locale, { mn: "Хэрэглэгчийн гомдлууд", en: "User Reports", ko: "사용자 신고 목록" })}
                </h2>
                <span className="text-xs text-blue-900">
                  {userReports.length} {pick(locale, { mn: "гомдол", en: "reports", ko: "건" })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-blue-900">
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Гомдол гаргагч", en: "Reported by", ko: "신고자" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Гомдол гарсан хэрэглэгч", en: "Reported user", ko: "신고된 사용자" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Шалтгаан", en: "Reason", ko: "이유" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Тайлбар", en: "Description", ko: "설명" })}</th>
                      <th className="pb-3 font-medium text-left">{t.status}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Үйлдэл", en: "Action", ko: "작업" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReports.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 text-xs text-blue-900">
                          <p className="font-medium">{r.reporter.name}</p>
                          <p className="text-blue-900">{r.reporter.email}</p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm font-medium text-blue-900">{r.reportedUser.name}</p>
                          <p className="text-xs text-blue-900">{r.reportedUser.email}</p>
                          {r.reportedUser.isBlocked && (
                            <span className="mt-0.5 inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                              {pick(locale, { mn: "Блоклогдсон", en: "Blocked", ko: "차단됨" })}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{r.reason}</span>
                        </td>
                        <td className="max-w-45 py-3 text-xs text-blue-900">
                          <span className="line-clamp-2">{r.description || "—"}</span>
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs ${r.status === "OPEN" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-blue-900"}`}>
                            {r.status === "OPEN"
                              ? pick(locale, { mn: "Нээлттэй", en: "Open", ko: "미처리" })
                              : pick(locale, { mn: "Хаасан", en: "Closed", ko: "처리완료" })}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {r.status === "OPEN" ? (
                              <button
                                onClick={() => updateUserReportStatus(r.id, "CLOSED")}
                                disabled={dismissing === r.id}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-blue-900 hover:bg-gray-50 disabled:opacity-60"
                              >
                                {dismissing === r.id ? "..." : pick(locale, { mn: "Хаах", en: "Dismiss", ko: "닫기" })}
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserReportStatus(r.id, "OPEN")}
                                disabled={dismissing === r.id}
                                className="rounded-lg border border-orange-200 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                              >
                                {dismissing === r.id ? "..." : pick(locale, { mn: "Нээх", en: "Reopen", ko: "재처리" })}
                              </button>
                            )}
                            {!r.reportedUser.isBlocked ? (
                              <button
                                onClick={() => blockUser(r.reportedUser.id, true)}
                                disabled={blockingUserId === r.reportedUser.id}
                                className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-60"
                              >
                                {blockingUserId === r.reportedUser.id ? "..." : <><ShieldOff size={11} /> {pick(locale, { mn: "Блоклох", en: "Block", ko: "차단" })}</>}
                              </button>
                            ) : (
                              <button
                                onClick={() => blockUser(r.reportedUser.id, false)}
                                disabled={blockingUserId === r.reportedUser.id}
                                className="flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                              >
                                {blockingUserId === r.reportedUser.id ? "..." : <><ShieldCheck size={11} /> {pick(locale, { mn: "Нээх", en: "Unblock", ko: "차단 해제" })}</>}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {userReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-blue-900">
                          {pick(locale, { mn: "Гомдол байхгүй", en: "No user reports", ko: "신고 없음" })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Job Preview Modal ── */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl sm:my-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[previewJob.status]}`}>
                    {previewJob.status}
                  </span>
                  {previewJob.featured && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      {pick(locale, { mn: "Онцлох", en: "Featured", ko: "주목" })}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-blue-900">{previewJob.title}</h2>
                <p className="mt-0.5 text-sm text-blue-900">{previewJob.company.name} · {previewJob.location}</p>
              </div>
              <button onClick={() => setPreviewJob(null)} className="ml-4 rounded-lg p-1.5 text-blue-900 hover:bg-gray-100 hover:text-blue-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">{previewJob.type}</span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">{previewJob.category}</span>
                {(previewJob.salaryMin || previewJob.salaryMax) && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                    {previewJob.salaryMin?.toLocaleString()} — {previewJob.salaryMax?.toLocaleString()} ₩
                  </span>
                )}
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                  {pick(locale, { mn: "Харагдсан", en: "Views", ko: "조회" })}: {previewJob.views}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                  {pick(locale, { mn: "Өргөдөл", en: "Apps", ko: "지원" })}: {previewJob._count.applications}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {pick(locale, { mn: "Тайлбар", en: "Description", ko: "설명" })}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">{previewJob.description}</p>
              </div>

              {previewJob.requirements && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {pick(locale, { mn: "Шаардлага", en: "Requirements", ko: "자격요건" })}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">{previewJob.requirements}</p>
                </div>
              )}

              {previewJob.benefits && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {pick(locale, { mn: "Давуу тал", en: "Benefits", ko: "혜택" })}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">{previewJob.benefits}</p>
                </div>
              )}

              {/* Contact */}
              {(previewJob.recruiterName || previewJob.phoneNumber || previewJob.kakaoId) && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {pick(locale, { mn: "Холбоо барих", en: "Contact", ko: "연락처" })}
                  </p>
                  <div className="space-y-1 text-blue-900">
                    {previewJob.recruiterName && <p>{pick(locale, { mn: "Нэр", en: "Name", ko: "이름" })}: {previewJob.recruiterName}</p>}
                    {previewJob.phoneNumber && <p>{pick(locale, { mn: "Утас", en: "Phone", ko: "전화" })}: {previewJob.phoneNumber}</p>}
                    {previewJob.kakaoId && <p>KakaoTalk: {previewJob.kakaoId}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-blue-900">{formatDate(locale, previewJob.createdAt)}</p>
              <div className="flex flex-wrap gap-2">
                {(previewJob.status === "PENDING" || previewJob.status === "REJECTED" || previewJob.status === "EXPIRED") && (
                  <button
                    onClick={async () => { await updateJobStatus(previewJob.id, "APPROVED"); setPreviewJob(null); }}
                    disabled={approving === previewJob.id}
                    className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60"
                  >
                    {approving === previewJob.id ? "..." : t.approve}
                  </button>
                )}
                {(previewJob.status === "PENDING" || previewJob.status === "APPROVED") && (
                  <button
                    onClick={async () => { await updateJobStatus(previewJob.id, "REJECTED"); setPreviewJob(null); }}
                    disabled={approving === previewJob.id}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60"
                  >
                    {approving === previewJob.id ? "..." : t.reject}
                  </button>
                )}
                <button
                  onClick={async () => { await deleteJob(previewJob.id); setPreviewJob(null); }}
                  disabled={deleting === previewJob.id}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting === previewJob.id ? "..." : pick(locale, { mn: "Устгах", en: "Delete", ko: "삭제" })}
                </button>
                <button onClick={() => setPreviewJob(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-blue-900 hover:bg-gray-50">
                  {pick(locale, { mn: "Хаах", en: "Close", ko: "닫기" })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
