"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Login failed"); return; }
    const role = data.user?.role;
    if (role === "ADMIN") router.push("/admin");
    else if (role === "EMPLOYER") router.push("/recruiter");
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
          {/* Left panel */}
          <div className="hidden md:flex w-1/2 bg-linear-to-br from-blue-900 to-blue-700 text-white flex-col justify-between p-10 relative">
            <div className="absolute inset-0 bg-black/20"><img src="/login-illustration.png" alt="Login Illustration" className="w-full h-full object-cover blur-[2px]" /></div>
            <div className="relative z-10">
              <div className="inline-block bg-green-400/20 border border-green-400/40 text-green-300 text-xs px-3 py-1 rounded-full mb-6">
                Bridging Opportunities
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-4">Your Future in Korea Starts Here</h2>
              <p className="text-blue-100 text-sm">The most trusted platform for Mongolians to find verified employment, visa assistance, and a community in South Korea.</p>
            </div>
            <div className="relative z-10 flex gap-8 pt-6 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold">15k+</div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Jobs Posted</div>
              </div>
              <div>
                <div className="text-2xl font-bold">8.2k</div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Active Members</div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 bg-white p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-sm mb-6">Please enter your details to sign in.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
                </div>
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
                    className="flex-1 outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded" />
                <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                  <span>G</span> Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 bg-yellow-400 rounded-xl py-2.5 text-sm font-medium hover:bg-yellow-500 transition">
                  <span>💬</span> Kakao
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register now</Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        © 2024 Ajil Korea · <a href="#" className="hover:underline">Terms</a> · <a href="#" className="hover:underline">Privacy</a> · <a href="/contact" className="hover:underline">Contact</a>
      </footer>
    </div>
  );
}
