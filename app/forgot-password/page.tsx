"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Алдаа гарлаа");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-bold text-white">A</div>
          <span className="text-lg font-bold text-blue-900">AjilKorea</span>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="mb-3 text-3xl">📧</div>
            <h2 className="mb-2 text-lg font-bold text-blue-900">Имэйл илгээгдлээ</h2>
            <p className="mb-4 text-sm text-blue-900">
              <strong>{email}</strong> хаяг руу нууц үг шинэчлэх линк илгээлээ. Имэйлээ шалгана уу.
            </p>
            <Link href="/login" className="text-sm font-semibold text-[#22c55e] hover:underline">
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-2xl font-bold text-blue-900">Нууц үг мартсан уу?</h1>
            <p className="mb-7 text-sm text-blue-900">
              Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үг шинэчлэх линк илгээнэ.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-blue-900">Имэйл хаяг</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-blue-900 outline-none shadow-sm focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16a34a] disabled:opacity-60"
              >
                {loading ? "Илгээж байна..." : "Линк илгээх →"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-blue-900">
              Нууц үгээ санасан уу?{" "}
              <Link href="/login" className="font-semibold text-[#22c55e] hover:underline">
                Нэвтрэх
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
