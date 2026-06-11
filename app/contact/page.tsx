"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const SUBJECTS = [
  "Job Inquiry", "Visa Support", "Employer Partnership", "Technical Issue", "General Question"
];

export default function ContactPage() {
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
    if (res.ok) { setSuccess(true); setForm({ name: "", email: "", subject: "", message: "" }); }
    else setError("Failed to send. Please try again.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch</h1>
        <p className="text-gray-500 mb-10">Whether you&apos;re a Mongolian job seeker or a Korean employer, our team is here to guide you through every step of the process.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Info */}
          <div className="w-full lg:w-72 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 shrink-0">📞</div>
                <div>
                  <p className="font-semibold text-sm">Phone</p>
                  <p className="text-xs text-gray-500 mt-1">+82 02 306-9090<br />+82 11-1234</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 shrink-0">✉️</div>
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <p className="text-xs text-gray-500 mt-1">For hiring enquiry:<br />admin@ajilkorea.com</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Social Media</p>
                <div className="flex gap-2">
                  {["f", "in", "x"].map((s) => (
                    <a key={s} href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition">
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                <div className="text-4xl">🗺️</div>
                <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-xl shadow text-xs font-semibold">
                  📍 Ajil Korea HQ
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm">Our Headquarters</p>
                <p className="text-xs text-gray-500 mt-1">48 Teheran-ro, Gangnam-gu, Seoul 135-080</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {success ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => setSuccess(false)} className="bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@example.com"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Ajil хайлтын дэмжлэг...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Бид тантай ямар нэгэн байдлаар туслах боломжтой уу?"
                      required
                      rows={5}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-12 px-4 bg-blue-700 text-white text-center mt-8">
        <h2 className="text-xl font-bold mb-2">Ready to start your journey?</h2>
        <p className="text-blue-100 text-sm mb-5">Join 15,000+ Mongolians already working in South Korea through Ajil Korea.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/jobs" className="bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">Explore Jobs</Link>
          <Link href="/about" className="border border-white text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition text-sm">Success Stories</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
