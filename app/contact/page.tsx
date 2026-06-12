"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Phone, Mail, MapPin, CheckCircle, Send, Clock, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import { getTranslation, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const SUBJECT_OPTIONS = [
  { value: "Job Inquiry", mn: "Ажлын байрны лавлагаа", en: "Job Inquiry", ko: "채용 문의" },
  { value: "Visa Support", mn: "Визний дэмжлэг", en: "Visa Support", ko: "비자 지원" },
  { value: "Employer Partnership", mn: "Ажил олгогчийн хамтын ажиллагаа", en: "Employer Partnership", ko: "고용주 파트너십" },
  { value: "Technical Issue", mn: "Техникийн асуудал", en: "Technical Issue", ko: "기술 문제" },
  { value: "General Question", mn: "Ерөнхий асуулт", en: "General Question", ko: "일반 문의" },
] as const;

export default function ContactPage() {
  const { locale } = useLanguage();
  const t = getTranslation(locale, "contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      return;
    }
    setError(
      pick(locale, {
        mn: "Илгээж чадсангүй. Дахин оролдоно уу.",
        en: "Failed to send. Please try again.",
        ko: "전송하지 못했습니다. 다시 시도해 주세요.",
      }),
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fb]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-3 text-blue-200 text-sm">
            <Link href="/" className="hover:text-white transition">
              {pick(locale, { mn: "Нүүр", en: "Home", ko: "홈" })}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.title}</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">{t.title}</h1>
          <p className="text-blue-200 text-sm max-w-lg">{t.description}</p>
        </div>
      </div>

      {/* Info cards row */}
      <div className="mx-auto w-full max-w-6xl px-4 -mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.phoneLabel}</p>
              <p className="mt-0.5 text-xs text-gray-500 whitespace-pre-line leading-relaxed">{t.phoneValue}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.emailLabel}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t.emailValue}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {pick(locale, { mn: "Ажлын цаг", en: "Working Hours", ko: "운영 시간" })}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                {pick(locale, { mn: "Даваа – Баасан\n09:00 – 18:00", en: "Mon – Fri\n09:00 – 18:00", ko: "월 – 금\n09:00 – 18:00" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Left: location + social */}
          <div className="w-full space-y-4 lg:w-72 shrink-0">
            {/* Map placeholder */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative h-44 w-full overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Union+Building+Ulaanbaatar+Mongolia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow text-xs font-semibold text-gray-700">
                  <MapPin size={13} className="text-blue-600 shrink-0" />
                  <span className="truncate">{t.headquartersLabel}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-900">{t.headquartersLabel}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.headquartersValue}</p>
              </div>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{t.socialMedia}</p>
              <div className="flex gap-2">
                {[
                  { label: "f", color: "hover:bg-blue-600 hover:text-white" },
                  { label: "in", color: "hover:bg-blue-700 hover:text-white" },
                  { label: "x", color: "hover:bg-gray-900 hover:text-white" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-600 transition ${s.color}`}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              {success ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{t.messageSentTitle}</h3>
                  <p className="mb-6 text-sm text-gray-500">{t.messageSentText}</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    {t.sendAnother}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-1 text-lg font-bold text-gray-900">
                    {pick(locale, { mn: "Мессеж илгээх", en: "Send a Message", ko: "메시지 보내기" })}
                  </h2>
                  <p className="mb-6 text-sm text-gray-400">
                    {pick(locale, { mn: "24 цагийн дотор хариу өгнө.", en: "We'll reply within 24 hours.", ko: "24시간 이내에 답변 드리겠습니다." })}
                  </p>

                  {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t.form.fullName}</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={pick(locale, { mn: "Бүтэн нэрээ оруулна уу", en: "Enter your full name", ko: "이름을 입력해 주세요" })}
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t.form.email}</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="name@example.com"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t.form.subject}</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">{pick(locale, { mn: "Сэдвээ сонгоно уу...", en: "Select a subject...", ko: "주제를 선택해 주세요..." })}</option>
                        {SUBJECT_OPTIONS.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {pick(locale, { mn: subject.mn, en: subject.en, ko: subject.ko })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t.form.message}</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={pick(locale, {
                          mn: "Бид танд хэрхэн тусалж чадах вэ?",
                          en: "How can we help you?",
                          ko: "어떻게 도와드릴까요?",
                        })}
                        required
                        rows={5}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
                    >
                      {loading
                        ? pick(locale, { mn: "Илгээж байна...", en: "Sending...", ko: "전송 중..." })
                        : <><Send size={14} /> {t.form.sendMessage}</>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="mt-4 bg-blue-700 px-4 py-12 text-center text-white">
        <h2 className="mb-2 text-xl font-bold">{t.readyTitle}</h2>
        <p className="mb-5 text-sm text-blue-100">{t.readyText}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/jobs" className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
            {t.exploreJobs}
          </Link>
          <Link href="/about" className="rounded-xl border border-white px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600">
            {t.successStories}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
