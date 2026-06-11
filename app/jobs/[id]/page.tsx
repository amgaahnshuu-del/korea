"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const JOB_TYPE_LABELS: Record<string, string> = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract", INTERNSHIP: "Internship" };
const JOB_TYPE_COLORS: Record<string, string> = { FULL_TIME: "bg-green-100 text-green-700", PART_TIME: "bg-blue-100 text-blue-700", CONTRACT: "bg-purple-100 text-purple-700", INTERNSHIP: "bg-yellow-100 text-yellow-700" };

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
  company: { id: string; name: string; logo: string | null; description: string | null; industry: string | null; location: string | null; size: string | null; verified: boolean; website: string | null };
  _count: { applications: number };
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Negotiable";
  const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(0)}만원` : `${n.toLocaleString()}원`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}~`;
  return `~${fmt(max!)}`;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => { setJob(d.job); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.status === 401) { router.push("/login"); return; }
    if (res.ok || res.status === 409) {
      setApplied(true);
      setShowModal(false);
    }
    setApplying(false);
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (!job) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">Job not found.</p>
        <Link href="/jobs" className="text-blue-600 underline">Back to Jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex gap-8 flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Job Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl">
                {job.company.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${JOB_TYPE_COLORS[job.type]}`}>{JOB_TYPE_LABELS[job.type]}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{job.category}</span>
                  {job.company.verified && <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">✓ Verified</span>}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{job.title}</h1>
                <p className="text-gray-500 mt-1">{job.company.name} · {job.location}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-blue-700 font-bold text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</div>
                    <div className="text-xs text-gray-400 mt-1">Monthly Salary</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-blue-700 font-bold text-sm">{job.type === "FULL_TIME" ? "3-5 Years" : "Any"}</div>
                    <div className="text-xs text-gray-400 mt-1">Experience</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-blue-700 font-bold text-sm">E-9 / E-7</div>
                    <div className="text-xs text-gray-400 mt-1">Visa Type</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-blue-700 font-bold text-sm">
                      {Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 86400000)}d ago
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Posted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</div>
            </div>
          )}

          {/* Work Schedule */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Work Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <p className="text-sm font-semibold">Shift Work</p>
                  <p className="text-xs text-gray-500">Day / Night Rotation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-semibold">Mon – Fri</p>
                  <p className="text-xs text-gray-500">Including Overtime Pay</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits & Perks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.split("\n").map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 sticky top-24">
            <div className="text-xl font-bold text-gray-900 mb-1">{formatSalary(job.salaryMin, job.salaryMax)}</div>
            <p className="text-xs text-gray-400 mb-4">per month</p>

            {applied ? (
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-3 text-sm text-center font-semibold mb-3">
                ✓ Applied Successfully!
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition mb-3"
              >
                Apply Now →
              </button>
            )}

            <button
              onClick={() => setSaved(!saved)}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm border transition ${saved ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {saved ? "✓ Saved" : "Save Job"}
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📍</span><span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💼</span><span>{JOB_TYPE_LABELS[job.type]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏢</span><span>{job.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👁️</span><span>{job.views} views · {job._count.applications} applicants</span>
              </div>
            </div>

            <a href={job.company.website || "#"} className="mt-4 block text-center text-sm text-blue-600 hover:underline">
              🔗 Visit Company Website
            </a>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">About the Employer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold">
                {job.company.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{job.company.name}</p>
                <p className="text-xs text-gray-400">{job.company.industry || job.category}</p>
              </div>
            </div>
            {job.company.description && <p className="text-xs text-gray-500 line-clamp-3">{job.company.description}</p>}
            {job.company.size && <p className="text-xs text-gray-400 mt-2">👥 {job.company.size} employees</p>}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Apply for {job.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{job.company.name}</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a short message to the employer (optional)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none resize-none h-32 focus:border-blue-400"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60"
              >
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
