"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, ClipboardList, Settings, LogOut, Clock } from "lucide-react";
import { formatDate, getJobStatusLabel, getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface DashStats {
  totalJobs: number;
  totalUsers: number;
  totalApps: number;
  pendingJobs: number;
  recentJobs: JobRow[];
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
  createdAt: string;
  _count: { applications: number };
}

interface AllJob extends JobRow {
  location: string;
  type: string;
  category: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  USER: "bg-gray-100 text-gray-600",
};

type Tab = "dashboard" | "users" | "jobs" | "applications" | "settings";

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

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "jobs" || tab === "applications") loadAllJobs();
  }, [tab, loadUsers, loadAllJobs]);

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
        <div className="h-8 w-8 rounded-full border-4 border-blue-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  const roleLabel = (role: string) =>
    (pick(locale, {
      mn: { ADMIN: "Админ", USER: "Хэрэглэгч" },
      en: { ADMIN: "Admin", USER: "User" },
      ko: { ADMIN: "관리자", USER: "사용자" },
    }) as Record<string, string>)[role] ?? role;

  const menuItems: { id: Tab; icon: ReactNode; label: string }[] = [
    { id: "dashboard", icon: <LayoutDashboard size={16} />, label: t.dashboard },
    { id: "users", icon: <Users size={16} />, label: t.users },
    { id: "jobs", icon: <Briefcase size={16} />, label: t.jobs },
    { id: "applications", icon: <ClipboardList size={16} />, label: t.applications },
    { id: "settings", icon: <Settings size={16} />, label: t.settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <Link href="/" className="text-lg font-bold text-blue-800">
            Ajil Korea
          </Link>
          <p className="mt-0.5 text-xs text-gray-400">{t.dashboard}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${tab === item.id ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === "jobs" && (stats?.pendingJobs ?? 0) > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                  {stats!.pendingJobs}
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

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">{menuItems.find((m) => m.id === tab)?.label}</h1>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">A</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{roleLabel("ADMIN")}</p>
              <p className="text-xs text-gray-400">Ajil Korea</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {tab === "dashboard" && stats && (
            <div>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: pick(locale, { mn: "Нийт зар (зөвшөөрсөн)", en: "Approved jobs", ko: "승인된 공고" }), value: stats.totalJobs, icon: <Briefcase className="h-6 w-6 text-blue-700" />, color: "text-blue-700" },
                  { label: pick(locale, { mn: "Хэрэглэгчид", en: "Users", ko: "사용자" }), value: stats.totalUsers, icon: <Users className="h-6 w-6 text-purple-700" />, color: "text-purple-700" },
                  { label: pick(locale, { mn: "Нийт өргөдөл", en: "Applications", ko: "지원서" }), value: stats.totalApps, icon: <ClipboardList className="h-6 w-6 text-green-700" />, color: "text-green-700" },
                  { label: pick(locale, { mn: "Хянагдаж буй зар", en: "Pending jobs", ko: "대기 중 공고" }), value: stats.pendingJobs, icon: <Clock className="h-6 w-6 text-yellow-600" />, color: "text-yellow-600" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-2">{s.icon}</div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">{t.pendingJobs}</h2>
                  <span className="text-xs text-gray-400">
                    {stats.pendingJobs} {pick(locale, { mn: "зар хүлээгдэж байна", en: "jobs pending", ko: "개의 공고가 대기 중" })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-500">
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
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                                {job.company.name.charAt(0)}
                              </div>
                              <span className="max-w-[100px] truncate text-xs text-gray-600">{job.company.name}</span>
                            </div>
                          </td>
                          <td className="max-w-xs truncate py-3 font-medium text-gray-800">{job.title}</td>
                          <td className="py-3 text-xs text-gray-400">{formatDate(locale, job.createdAt)}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[job.status]}`}>{getJobStatusLabel(locale, job.status)}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Link href={`/jobs/${job.id}`} className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                                {t.view}
                              </Link>
                              {job.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "APPROVED")}
                                    disabled={approving === job.id}
                                    className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white transition hover:bg-green-700 disabled:opacity-60"
                                  >
                                    {approving === job.id ? "..." : t.approve}
                                  </button>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "REJECTED")}
                                    disabled={approving === job.id}
                                    className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white transition hover:bg-red-600 disabled:opacity-60"
                                  >
                                    {t.reject}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!stats.recentJobs?.length && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400">
                            {t.noPending}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{t.allUsers}</h2>
                <span className="text-xs text-gray-400">
                  {users.length} {pick(locale, { mn: "хэрэглэгч", en: "users", ko: "명" })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "Нэр", en: "Name", ko: "이름" })}</th>
                      <th className="pb-3 font-medium text-left">{pick(locale, { mn: "И-мэйл", en: "Email", ko: "이메일" })}</th>
                      <th className="pb-3 font-medium text-left">{t.role}</th>
                      <th className="pb-3 font-medium text-left">{t.applications}</th>
                      <th className="pb-3 font-medium text-left">{t.createdAt}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="py-3 text-xs text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[u.role]}`}>{roleLabel(u.role)}</span>
                        </td>
                        <td className="py-3 text-center text-xs text-gray-600">{u._count.applications}</td>
                        <td className="py-3 text-xs text-gray-400">{formatDate(locale, u.createdAt)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          {t.noUsers}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "jobs" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{t.allJobs}</h2>
                <span className="text-xs text-gray-400">
                  {allJobs.length} {t.jobs}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
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
                        <td className="max-w-[180px] truncate py-3 font-medium text-gray-800">{job.title}</td>
                        <td className="py-3 text-xs text-gray-500">{job.company.name}</td>
                        <td className="py-3 text-xs text-gray-500">{job.location}</td>
                        <td className="py-3 text-center text-xs">{job._count.applications}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[job.status]}`}>{getJobStatusLabel(locale, job.status)}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Link href={`/jobs/${job.id}`} className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                              {t.view}
                            </Link>
                            {job.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => updateJobStatus(job.id, "APPROVED")}
                                  disabled={approving === job.id}
                                  className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white transition hover:bg-green-700 disabled:opacity-60"
                                >
                                  {approving === job.id ? "..." : t.approve}
                                </button>
                                <button
                                  onClick={() => updateJobStatus(job.id, "REJECTED")}
                                  disabled={approving === job.id}
                                  className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white transition hover:bg-red-600 disabled:opacity-60"
                                >
                                  {t.reject}
                                </button>
                              </>
                            )}
                            {job.status === "APPROVED" && (
                              <button
                                onClick={() => updateJobStatus(job.id, "REJECTED")}
                                disabled={approving === job.id}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                              >
                                {t.reject}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allJobs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          {t.noJobs}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "applications" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{t.applicationsControl}</h2>
                <span className="text-xs text-gray-400">
                  {allJobs.reduce((s, j) => s + j._count.applications, 0)} {t.applications}
                </span>
              </div>
              <div className="space-y-3">
                {allJobs.filter((j) => j._count.applications > 0).map((job) => (
                  <div key={job.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company.name} · {job.location}</p>
                    </div>
                    <div className="shrink-0 text-center">
                      <p className="text-lg font-bold text-blue-700">{job._count.applications}</p>
                      <p className="text-xs text-gray-400">{t.applications}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${STATUS_COLORS[job.status]}`}>{getJobStatusLabel(locale, job.status)}</span>
                    <Link href={`/jobs/${job.id}`} className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-white">
                      {t.view}
                    </Link>
                  </div>
                ))}
                {allJobs.filter((j) => j._count.applications > 0).length === 0 && (
                  <div className="py-12 text-center text-gray-400">{t.noApplications}</div>
                )}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-xl">
              <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="font-bold text-gray-900">{t.settingsTitle}</h2>
                <div className="space-y-3">
                  {t.settingsNotes.map((s: { label: string; note: string }) => (
                    <div key={s.label} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{s.note}</p>
                      </div>
                      <div className="h-6 w-10 shrink-0 rounded-full bg-blue-600" />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                  {t.adminCredentials}
                  <br />
                  <span className="font-mono text-xs">{t.adminCredentialsValues}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
