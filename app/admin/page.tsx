"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  EMPLOYER: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-600",
};

type Tab = "dashboard" | "users" | "jobs" | "applications" | "settings";

export default function AdminPage() {
  const router = useRouter();
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
        if (!user || user.role !== "ADMIN") { router.push("/login"); return; }
        loadStats();
      });
  }, [router]);

  const loadStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); });
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const menuItems: { id: Tab; icon: string; label: string }[] = [
    { id: "dashboard", icon: "🏠", label: "Хяналтын самбар" },
    { id: "users", icon: "👥", label: "Хэрэглэгчид" },
    { id: "jobs", icon: "💼", label: "Зарууд" },
    { id: "applications", icon: "📋", label: "Өргөдлийн хяналт" },
    { id: "settings", icon: "⚙️", label: "Тохиргоо" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-blue-800 font-bold text-lg">Ajil Korea</Link>
          <p className="text-xs text-gray-400 mt-0.5">Админ самбар</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition ${tab === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === "jobs" && (stats?.pendingJobs ?? 0) > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {stats!.pendingJobs}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            {menuItems.find((m) => m.id === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">Ajil Korea</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {/* ── DASHBOARD ───────────────────────────────────────────── */}
          {tab === "dashboard" && stats && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Нийт зар (зөвшөөрсөн)", value: stats.totalJobs, icon: "💼", color: "text-blue-700" },
                  { label: "Хэрэглэгчид", value: stats.totalUsers, icon: "👥", color: "text-purple-700" },
                  { label: "Нийт өргөдөл", value: stats.totalApps, icon: "📋", color: "text-green-700" },
                  { label: "Хянагдаж буй зар", value: stats.pendingJobs, icon: "⏳", color: "text-yellow-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Pending jobs queue */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Зөвшөөрөл хүлээж буй зарууд</h2>
                  <span className="text-xs text-gray-400">{stats.pendingJobs} зар хүлээгдэж байна</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-100">
                        <th className="text-left pb-3 font-medium">Компани</th>
                        <th className="text-left pb-3 font-medium">Зарын гарчиг</th>
                        <th className="text-left pb-3 font-medium">Огноо</th>
                        <th className="text-left pb-3 font-medium">Төлөв</th>
                        <th className="text-left pb-3 font-medium">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.recentJobs || []).map((job) => (
                        <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                                {job.company.name.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-600 truncate max-w-[100px]">{job.company.name}</span>
                            </div>
                          </td>
                          <td className="py-3 font-medium text-gray-800 max-w-xs truncate">{job.title}</td>
                          <td className="py-3 text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString("mn-MN")}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Link href={`/jobs/${job.id}`} className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">Харах</Link>
                              {job.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "APPROVED")}
                                    disabled={approving === job.id}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-60"
                                  >
                                    {approving === job.id ? "..." : "✓"}
                                  </button>
                                  <button
                                    onClick={() => updateJobStatus(job.id, "REJECTED")}
                                    disabled={approving === job.id}
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-60"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!stats.recentJobs?.length && (
                        <tr><td colSpan={5} className="py-12 text-center text-gray-400">Хянагдах зар байхгүй байна.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS TAB ───────────────────────────────────────────── */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Бүх хэрэглэгчид</h2>
                <span className="text-xs text-gray-400">{users.length} хэрэглэгч</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-3 font-medium">Нэр</th>
                      <th className="text-left pb-3 font-medium">И-мэйл</th>
                      <th className="text-left pb-3 font-medium">Үүрэг</th>
                      <th className="text-left pb-3 font-medium">Өргөдөл</th>
                      <th className="text-left pb-3 font-medium">Бүртгэлтэй</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="py-3 text-xs text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="py-3 text-center text-xs text-gray-600">{u._count.applications}</td>
                        <td className="py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("mn-MN")}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400">Хэрэглэгч байхгүй байна.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── JOBS TAB ────────────────────────────────────────────── */}
          {tab === "jobs" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Бүх зарууд</h2>
                <span className="text-xs text-gray-400">{allJobs.length} зар</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-3 font-medium">Гарчиг</th>
                      <th className="text-left pb-3 font-medium">Компани</th>
                      <th className="text-left pb-3 font-medium">Байршил</th>
                      <th className="text-left pb-3 font-medium">Өргөдөл</th>
                      <th className="text-left pb-3 font-medium">Төлөв</th>
                      <th className="text-left pb-3 font-medium">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800 max-w-[180px] truncate">{job.title}</td>
                        <td className="py-3 text-xs text-gray-500">{job.company.name}</td>
                        <td className="py-3 text-xs text-gray-500">{job.location}</td>
                        <td className="py-3 text-center text-xs">{job._count.applications}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Link href={`/jobs/${job.id}`} className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">Харах</Link>
                            {job.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => updateJobStatus(job.id, "APPROVED")}
                                  disabled={approving === job.id}
                                  className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-60"
                                >
                                  {approving === job.id ? "..." : "✓"}
                                </button>
                                <button
                                  onClick={() => updateJobStatus(job.id, "REJECTED")}
                                  disabled={approving === job.id}
                                  className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-60"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                            {job.status === "APPROVED" && (
                              <button
                                onClick={() => updateJobStatus(job.id, "REJECTED")}
                                disabled={approving === job.id}
                                className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-60"
                              >
                                Хаах
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allJobs.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-400">Зар байхгүй байна.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── APPLICATIONS TAB ────────────────────────────────────── */}
          {tab === "applications" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Өргөдлийн хяналт (зарын жагсаалт)</h2>
                <span className="text-xs text-gray-400">
                  {allJobs.reduce((s, j) => s + j._count.applications, 0)} нийт өргөдөл
                </span>
              </div>
              <div className="space-y-3">
                {allJobs.filter((j) => j._count.applications > 0).map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company.name} · {job.location}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-lg font-bold text-blue-700">{job._count.applications}</p>
                      <p className="text-xs text-gray-400">өргөдөл</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                    <Link href={`/jobs/${job.id}`} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white shrink-0">
                      Харах
                    </Link>
                  </div>
                ))}
                {allJobs.filter((j) => j._count.applications > 0).length === 0 && (
                  <div className="text-center py-12 text-gray-400">Өргөдөл байхгүй байна.</div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="max-w-xl">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h2 className="font-bold text-gray-900">Системийн тохиргоо</h2>

                <div className="space-y-3">
                  {[
                    { label: "Шинэ хэрэглэгч бүртгэлийн зөвшөөрөл", note: "Идэвхтэй — хэрэглэгчид чөлөөтэй бүртгэж болно" },
                    { label: "Зар нийтлэхэд admin зөвшөөрөл шаардах", note: "Идэвхтэй — бүх зар PENDING төлвөөр орно" },
                    { label: "И-мэйл мэдэгдэл", note: "Идэвхгүй — хэрэгжүүлэлт хийгдээгүй" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>
                      </div>
                      <div className="w-10 h-6 bg-blue-600 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                  Системийн нэвтрэх мэдээлэл:<br />
                  <span className="font-mono text-xs">admin@ajilkorea.com / admin123</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
