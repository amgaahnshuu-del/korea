"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "EMPLOYER" ? "EMPLOYER" : "USER";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: defaultRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please agree to the Terms of Service"); return; }
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Registration failed"); return; }
    const role = data.user?.role;
    if (role === "EMPLOYER") router.push("/recruiter");
    else router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <div className="p-5">
        <Link href="/" className="text-blue-800 font-bold text-xl">Ajil Korea</Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-xl">
          {/* Left Panel */}
          <div className="hidden md:flex w-2/5 bg-blue-700 text-white flex-col justify-between p-10 relative">
            <div className="absolute inset-0 bg-black/20 rounded-l-2xl"><img src="/login-illustration.png" alt="" className="h-full w-full blur-[3px]"/></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 leading-tight">Your Gateway to Professional Growth in Korea</h2>
              <p className="text-blue-100 text-sm">Bridging the gap between Mongolian talent and South Korean excellence. Join the most trusted platform for visa-sponsored opportunities.</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
              <div className="bg-blue-600/50 rounded-xl p-4">
                <div className="text-xl mb-1">🛡️</div>
                <p className="text-sm font-semibold">Secure Processing</p>
                <p className="text-xs text-blue-200">Verified employers and legal compliance.</p>
              </div>
              <div className="bg-blue-600/50 rounded-xl p-4">
                <div className="text-xl mb-1">🔍</div>
                <p className="text-sm font-semibold">Visa Support</p>
                <p className="text-xs text-blue-200">Expert guidance on E-9 and D-2 pathways.</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 bg-white p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
            <p className="text-gray-500 text-sm mb-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )}

            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "USER" })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${form.role === "USER" ? "bg-blue-700 text-white border-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "EMPLOYER" })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${form.role === "EMPLOYER" ? "bg-blue-700 text-white border-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Employer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="flex-1 outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                  <span>G</span> Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                  <span>N</span> Naver
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">© 2024 Ajil Korea. Bridging Opportunity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
