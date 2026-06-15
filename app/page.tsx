import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Briefcase, Cross, Factory, Laptop, Truck, Utensils, Volume2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatRelativeTime,
  formatSalary,
  getCategoryLabel,
  getJobTypeLabel,
  getTranslation,
  pick,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const CATEGORY_CARDS = [
  { key: "Manufacturing", icon: Factory, color: "bg-stone-100 text-stone-600" },
  { key: "IT & Tech", icon: Laptop, color: "bg-stone-100 text-stone-600" },
  { key: "Food & Beverage", icon: Utensils, color: "bg-stone-100 text-stone-600" },
  { key: "Construction", icon: Building2, color: "bg-stone-100 text-stone-600" },
  { key: "Logistics", icon: Truck, color: "bg-stone-100 text-stone-600" },
  { key: "Healthcare", icon: Cross, color: "bg-stone-100 text-stone-600" },
];

export default async function Home() {
  const locale = await getLocale();
  const t = getTranslation(locale, "home");
  const common = getTranslation(locale, "common");

  const user = await getUser();
  if (user) redirect("/jobs");

  const randomIds = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Job" WHERE status = 'APPROVED' ORDER BY RANDOM() LIMIT 5
  `;

  const [featuredJobs, totalJobs, verifiedCompanies] = await Promise.all([
    randomIds.length > 0
      ? prisma.job.findMany({
          where: { id: { in: randomIds.map((r) => r.id) }, status: "APPROVED" },
          include: {
            company: { select: { name: true, logo: true, location: true, verified: true } },
          },
        })
      : Promise.resolve([]),
    prisma.job.count({ where: { status: "APPROVED" } }),
    prisma.company.count({ where: { verified: true } }),
  ]);

  const popularCategories = CATEGORY_CARDS.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-white px-4 py-20 text-black">
        <div className="mx-auto mt-10 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-1 text-sm">
            <Volume2 className="h-4 w-4 text-black" />
            {t.heroBadge}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-black md:text-5xl">
            {t.heroHeading}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-black">{t.heroDescription}</p>

          <form action="/jobs" method="get" className="mx-auto flex max-w-2xl flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-4">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder={t.searchJobPlaceholder}
                className="flex-1 py-2 text-sm text-gray-800 outline-none"
              />
            </div>
            <div className="hidden items-center gap-2 border-l border-black px-4 sm:flex">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                name="location"
                placeholder={t.searchLocationPlaceholder}
                className="w-36 py-2 text-sm text-gray-800 outline-none"
              />
            </div>
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl bg-blue-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              {common.searchJobs}
            </button>
          </form>

          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-black">
            <span>{t.popularPrefix}</span>
            {popularCategories.map((cat) => (
              <Link
                key={cat.key}
                href={`/jobs?category=${cat.key}`}
                className="text-blue-700 underline underline-offset-2 hover:text-white"
              >
                {getCategoryLabel(locale, cat.key)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 border-b border-gray-100 bg-stone-100 py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
          {[
            {
              value: totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : "12k+",
              label: t.stats.activeJobs,
            },
            { value: "3", label: t.stats.verifiedCompanies },
            { value: "45k", label: t.stats.successfulPlacements },
            { value: "24/7", label: t.stats.visaSupport },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-800">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-2 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.browse.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.browse.description}</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline">
              {t.browse.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-6">
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.key}
                  href={`/jobs?category=${cat.key}`}
                  className="cursor-pointer rounded-2xl border border-black/10 bg-white p-5 text-center transition hover:shadow-md"
                >
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${cat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{getCategoryLabel(locale, cat.key)}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.featured.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.featured.description}</p>
            </div>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">{t.featured.emptyTitle}</p>
              <p className="mt-2 text-sm">{t.featured.emptyText}</p>
              <Link href="/jobs" className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-2 text-white">
                {t.featured.browseAll}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-lg"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                      {job.company.logo ? (
                        <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                      ) : (
                        job.company.name.charAt(0)
                      )}
                    </div>
                    <span className="rounded-full px-2 py-1 text-xs font-medium text-white bg-blue-700/90">
                      {getJobTypeLabel(locale, job.type)}
                    </span>
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-blue-700">
                    {job.title}
                  </h3>
                  <p className="mb-3 text-xs text-gray-500">
                    {job.company.name} · {job.location}
                  </p>
                  {formatSalary(locale, job.salaryMin, job.salaryMax) && (
                    <p className="mb-3 text-xs font-semibold text-blue-600">
                      {formatSalary(locale, job.salaryMin, job.salaryMax)}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatRelativeTime(locale, job.createdAt)}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {common.applyNow}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/jobs"
              className="rounded-xl border border-blue-700 px-8 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {t.featured.browseAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center bg-blue-700 p-10 text-white lg:p-14">
              <h2 className="mb-6 text-4xl font-bold leading-tight">
                {pick(locale, {
                  mn: "Та БНСУ-д ажил хайж байна уу?",
                  en: "Looking for work in Korea?",
                  ko: "한국에서 일자리를 찾고 계신가요?",
                })}
              </h2>

              <p className="mb-8 max-w-md text-lg leading-relaxed text-blue-100">
                {pick(locale, {
                  mn: "Үнэгүй бүртгүүлж, баталгаажсан ажлын байруудыг шууд судлаарай.",
                  en: "Create a free account and browse verified opportunities across South Korea.",
                  ko: "무료 계정을 만들고 한국 전역의 검증된 채용 공고를 살펴보세요.",
                })}
              </p>

              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/jobs"
                  className="rounded-xl bg-white px-7 py-4 text-center font-semibold text-blue-700 transition hover:bg-gray-100"
                >
                  {pick(locale, { mn: "Ажлын заруудыг үзэх", en: "Browse Jobs", ko: "채용 공고 보기" })}
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl border border-blue-400 px-7 py-4 text-center font-medium text-white transition hover:bg-blue-600"
                >
                  {pick(locale, { mn: "Үнэгүй бүртгүүлэх", en: "Create Account", ko: "무료 회원가입" })}
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/40?img=1" className="h-8 w-8 rounded-full border-2 border-blue-700" alt="" />
                  <img src="https://i.pravatar.cc/40?img=2" className="h-8 w-8 rounded-full border-2 border-blue-700" alt="" />
                  <img src="https://i.pravatar.cc/40?img=3" className="h-8 w-8 rounded-full border-2 border-blue-700" alt="" />
                </div>
                <p className="text-sm text-blue-200">
                  {pick(locale, {
                    mn: "БНСУ дахь 850+ компани итгэдэг",
                    en: "Trusted by 850+ South Korean companies",
                    ko: "850개 이상의 한국 기업이 신뢰합니다",
                  })}
                </p>
              </div>
            </div>

            <div className="relative hidden min-h-125 md:block">
              <img
                src="/employer--cta.png"
                alt={pick(locale, { mn: "Ажил хайгчийн самбар", en: "Job seeker dashboard", ko: "구직자 대시보드" })}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
