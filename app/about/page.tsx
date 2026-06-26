import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plane, User } from "lucide-react";
import { getTranslation, pick, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

function getTeam(locale: Locale) {
  return [
    { name: "Ariunbold T.", role: pick(locale, { mn: "Гүйцэтгэх захирал, үүсгэн байгуулагч", en: "CEO & Founder", ko: "CEO, 창업자" }), bg: "bg-[#eef7f1]" },
    { name: "Mina Park",    role: pick(locale, { mn: "Сөүл дэх үйл ажиллагааны менежер", en: "Operations Manager, Seoul", ko: "운영 매니저, 서울" }), bg: "bg-[#dcfce7]" },
    { name: "Gantulaar L.", role: pick(locale, { mn: "Хөдөлмөрийн эрхийн зөвлөх", en: "Labor Law Advisor", ko: "노동법 자문" }), bg: "bg-[#eef7f1]" },
    { name: "Yalj Ohal",    role: pick(locale, { mn: "Платформын техникийн хариуцлагатан", en: "Lead Engineer", ko: "수석 엔지니어" }), bg: "bg-[#dcfce7]" },
  ];
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getTranslation(locale, "about");
  const timeline: { year: string; title: string; desc: string }[] = t.timeline ?? [];
  const team = getTeam(locale);

  const values = t.values ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-[#163c4e] px-4 py-12 text-white md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-12">
          <div className="flex-1">
            <div className="mb-4 inline-block rounded-full border border-[#22c55e]/30 bg-[#22c55e]/20 px-3 py-1 text-xs text-[#4ade80]">
              {t.badge}
            </div>
            <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-4xl">{t.heading}</h1>
            <p className="mb-6 text-sm text-white/75">{t.description}</p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/jobs"
                className="rounded-full bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#16a34a]"
              >
                {t.viewJobs}
              </Link>
              <a
                href="#team"
                className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                {t.learnTeam}
              </a>
            </div>
          </div>
          <div className="hidden flex-col items-center gap-3 md:flex">
            <div className="w-40 rounded-2xl bg-[#22c55e]/20 p-5 text-center">
              <div className="text-3xl font-bold">1,000+</div>
              <div className="text-xs text-white/65">{t.heroStat}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-2xl font-bold text-[#0f2e2a]">{t.valuesTitle}</h2>
          <p className="mb-10 text-center text-sm text-[#5b7268]">{t.valuesDescription}</p>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value: { title: string; desc: string }, i: number) => (
              <div key={i} className="rounded-2xl bg-[#eef7f1] p-6">
                <h3 className="mb-2 font-bold text-[#0f2e2a]">{value.title}</h3>
                <p className="text-sm leading-relaxed text-[#5b7268]">{value.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#22c55e]/20 bg-[#eef7f1] p-6 text-center">
            <h3 className="mb-2 text-lg font-bold text-[#0f3d3a]">{t.promiseTitle}</h3>
            <p className="text-sm text-[#16a34a]">{t.promiseText}</p>
          </div>
        </div>
      </section>

      {/* ── Training ─────────────────────────────────────────────────── */}
      <section className="bg-[#163c4e] px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <Plane className="mx-auto mb-3 h-8 w-8 text-[#4ade80]" />
          <h2 className="mb-2 text-xl font-bold">{t.trainingTitle}</h2>
          <p className="mx-auto max-w-lg text-sm text-white/70">{t.trainingText}</p>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <section className="bg-[#f0faf4] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-[#0f2e2a]">{t.timelineTitle}</h2>
          <p className="mb-10 text-sm text-[#5b7268]">{t.timelineSubtitle}</p>
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-[#22c55e]/30" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="mb-1 text-xs font-semibold text-[#16a34a]">{item.year}</div>
                  <h3 className="mb-1 font-bold text-[#0f2e2a]">{item.title}</h3>
                  <p className="text-sm text-[#5b7268]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section id="team" className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0f2e2a]">{t.teamTitle}</h2>
              <p className="mt-1 text-sm text-[#5b7268]">{t.teamSubtitle}</p>
            </div>
            <Link
              href="/register"
              className="shrink-0 text-sm font-semibold text-[#16a34a] transition hover:underline"
            >
              {t.joinTeam}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className={`mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-2xl ${member.bg}`}>
                  <User className="h-10 w-10 text-[#16a34a] opacity-60" />
                </div>
                <p className="text-sm font-semibold text-[#0f2e2a]">{member.name}</p>
                <p className="mt-1 text-xs text-[#5b7268]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#163c4e] px-4 py-12 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">{t.ctaTitle}</h2>
        <p className="mb-6 text-sm text-white/70">{t.ctaText}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/jobs" className="rounded-full bg-[#22c55e] px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-[#16a34a]">
            {t.ctaBrowseJobs}
          </Link>
          <Link href="/contact" className="rounded-full border border-white/40 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-white/10">
            {t.ctaContact}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
