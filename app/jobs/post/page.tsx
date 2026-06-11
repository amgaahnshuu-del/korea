"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const CATEGORIES = [
  "Manufacturing", "IT & Tech", "Food & Beverage", "Construction",
  "Logistics", "Healthcare", "Agriculture", "Service & Sales",
];

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Бүтэн цагийн" },
  { value: "PART_TIME", label: "Хагас цагийн" },
  { value: "CONTRACT", label: "Гэрээт" },
  { value: "INTERNSHIP", label: "Дадлага" },
];

export default function PostJobPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
    type: "FULL_TIME",
    category: "Manufacturing",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
          router.push("/login");
          return;
        }
        // Check company profile exists
        fetch("/api/recruiter/company")
          .then((r) => r.json())
          .then((d) => {
            setHasCompany(!!d.company);
            setAuthChecking(false);
          });
      });
  }, [router]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError("Гарчиг, тайлбар, байршил заавал бөглөнө үү.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Зар нийтлэхэд алдаа гарлаа.");
      return;
    }
    router.push("/recruiter");
  };

  if (authChecking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <div className="mb-6">
          <Link href="/recruiter" className="text-sm text-blue-600 hover:underline">← Буцах</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Ажлын байрны зар нийтлэх</h1>
          <p className="text-gray-500 text-sm mt-1">Зар нийтэлсний дараа admin баталгаажуулна.</p>
        </div>

        {!hasCompany && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 mb-6 flex items-center gap-2">
            ⚠️ Та эхлээд{" "}
            <Link href="/recruiter" className="font-semibold underline">компани профайлаа</Link>{" "}
            бүртгүүлэх шаардлагатай.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Ажлын байрны нэр <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="Жишээ: Senior Frontend Developer"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {/* Type + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Ажлын төрөл <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Салбар <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Байршил <span className="text-red-500">*</span>
            </label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              required
              placeholder="Жишээ: Seoul, South Korea"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Цалин (₩ / сар) — заавал биш
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="Доод хязгаар (₩)"
                min={0}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              />
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="Дээд хязгаар (₩)"
                min={0}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Ажлын тайлбар <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={5}
              placeholder="Ажлын байрны дэлгэрэнгүй тайлбар..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Шаардлага — заавал биш
            </label>
            <textarea
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              rows={4}
              placeholder="• Туршлага\n• Шаардлагатай ур чадвар..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Давуу тал / урамшуулал — заавал биш
            </label>
            <textarea
              value={form.benefits}
              onChange={(e) => set("benefits", e.target.value)}
              rows={3}
              placeholder="Орон сууц, эрүүл мэндийн даатгал, виза дэмжлэг..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/recruiter"
              className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Цуцлах
            </Link>
            <button
              type="submit"
              disabled={loading || !hasCompany}
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading ? "Нийтэлж байна..." : "Зар нийтлэх →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
