"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Нууц үг таарахгүй байна"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setError(data.error || "Алдаа гарлаа");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-blue-900">Линк хүчингүй байна.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-[#22c55e] hover:underline">
          Дахин линк авах
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
      <div className="mb-3 text-3xl">✅</div>
      <h2 className="mb-2 text-lg font-bold text-blue-900">Нууц үг шинэчлэгдлээ</h2>
      <p className="text-sm text-blue-900">Нэвтрэх хуудас руу шилжиж байна...</p>
    </div>
  ) : (
    <>
      <h1 className="mb-1 text-2xl font-bold text-blue-900">Шинэ нууц үг тохируулах</h1>
      <p className="mb-7 text-sm text-blue-900">Хамгийн багадаа 6 тэмдэгт байна.</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-blue-900">Шинэ нууц үг</label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="flex-1 bg-transparent text-sm text-blue-900 placeholder:text-blue-900 outline-none"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-blue-900 hover:text-blue-900">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-blue-900">Нууц үг давтах</label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="flex-1 bg-transparent text-sm text-blue-900 placeholder:text-blue-900 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16a34a] disabled:opacity-60"
        >
          {loading ? "Хадгалж байна..." : "Нууц үг шинэчлэх →"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-bold text-white">A</div>
          <span className="text-lg font-bold text-blue-900">AjilKorea</span>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
