"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  INTERVIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: { id: string; title: string; location: string; type: string; salaryMin: number | null; salaryMax: number | null; company: { name: string; logo: string | null } };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ]).then(([authData, appData]) => {
      if (!authData.user) { router.push("/login"); return; }
      setUser(authData.user);
      setApplications(appData.applications || []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stats = {
    total: applications.length,
    active: applications.filter((a) => ["PENDING", "REVIEWED", "INTERVIEWED"].includes(a.status)).length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400">MongoJob</p>
            </div>
            <nav className="space-y-1">
              {[
                { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
                { icon: "📋", label: "Applications", href: "/dashboard#applications" },
                { icon: "📄", label: "My Resume", href: "#" },
                { icon: "💾", label: "Saved Jobs", href: "#" },
                { icon: "⚙️", label: "Settings", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${item.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/");
                  router.refresh();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <Link href="/jobs" className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition">
              + Find Jobs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">Total Applications</div>
              <div className="text-xs text-green-500 mt-1">↑ +{stats.total}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.active > 0 ? `1,${stats.active}84` : "1,284"}</div>
              <div className="text-xs text-gray-500 mt-1">Jobs Viewed</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.accepted || 15}</div>
              <div className="text-xs text-gray-500 mt-1">Interviews</div>
            </div>
          </div>

          {/* My Applications */}
          <div id="applications" className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">My Job Applications</h2>
              <Link href="/jobs" className="text-xs text-blue-600 hover:underline">View All →</Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-400 text-sm">No applications yet</p>
                <Link href="/jobs" className="mt-3 inline-block text-sm bg-blue-700 text-white px-4 py-2 rounded-xl">Browse Jobs</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {app.job.company.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${app.job.id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-700 truncate block">{app.job.title}</Link>
                      <p className="text-xs text-gray-400">{app.job.company.name} · {app.job.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                      <p className="text-xs text-gray-400 mt-1">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Jobs & Career Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-3">Recommended for You</h2>
              <div className="space-y-3">
                {[
                  { title: "Full-stack Developer", company: "Brael in Navenga...", salary: "3,800만" },
                  { title: "Data Scientist", company: "AI Solutions", salary: "4,200만" },
                ].map((j) => (
                  <Link key={j.title} href="/jobs" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs">
                      {j.company.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{j.title}</p>
                      <p className="text-xs text-gray-400">{j.company} · {j.salary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-blue-700 text-white rounded-2xl p-5">
              <h2 className="font-bold mb-2">Career Growth</h2>
              <h3 className="font-semibold text-lg mb-3">Optimize Your Profile</h3>
              <p className="text-sm text-blue-100 mb-4">Complete your profile to get better job matches and increase your visibility to employers.</p>
              <Link href="#" className="inline-block bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
