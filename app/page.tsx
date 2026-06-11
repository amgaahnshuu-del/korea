import Link from "next/link";
import {
  Factory,
  Laptop,
  Utensils,
  Building2,
  Truck,
  Cross,
  Volume2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { JOB_TYPE_LABELS, JOB_TYPE_COLORS, formatSalary, timeAgo } from "@/lib/constants";

const CATEGORIES = [
  {
    name: "Manufacturing",
    icon: Factory,
    color: "bg-stone-100 text-stone-600",
  },
  {
    name: "IT & Tech",
    icon: Laptop,
    color: "bg-stone-100 text-stone-600",
  },
  {
    name: "Food & Beverage",
    icon: Utensils,
    color: "bg-stone-100 text-stone-600",
  },
  {
    name: "Construction",
    icon: Building2,
    color: "bg-stone-100 text-stone-600",
  },
  {
    name: "Logistics",
    icon: Truck,
    color: "bg-stone-100 text-stone-600",
  },
  {
    name: "Healthcare",
    icon: Cross,
    color: "bg-stone-100 text-stone-600",
  },
];


export default async function Home() {
  const [featuredJobs, totalJobs, verifiedCompanies] = await Promise.all([
    prisma.job.findMany({
      where: { status: "APPROVED", featured: true },
      include: {
        company: {
          select: { name: true, logo: true, location: true, verified: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.job.count({ where: { status: "APPROVED" } }),
    prisma.company.count({ where: { verified: true } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-white text-black py-20 px-4">
        <div className="max-w-4xl mx-auto mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-1 text-sm mb-6">
            <Volume2 className="w-4 h-4 text-black" />
            БНСУ-д ажил хайх хамгийн найдвартай систем
          </div>
          <h1 className="text-4xl text-black md:text-5xl font-extrabold mb-4 leading-tight">
            БНСУ-д ажил хайх хамгийн <br />
            <span className="text-blue-700">найдвартай </span> систем.
          </h1>
          <p className="text-black text-lg mb-10 max-w-xl mx-auto">
            Discover thousands of career opportunities in South Korea tailored
            for the Mongolian community.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-4">
              <svg
                className="w-5 h-5 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="flex-1 text-gray-800 outline-none py-2 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 border-l border-black">
              <svg
                className="w-5 h-5 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Seoul, Busan, Incheon..."
                className="w-36 text-gray-800 outline-none py-2 text-sm"
              />
            </div>
            <Link
              href="/jobs"
              className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition whitespace-nowrap text-center"
            >
              Search Jobs
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-5 mt-10 text-sm text-black">
            <span>Popular:</span>
            {[
              "Manufacturing",
              "IT & Software",
              "Hospitality",
              "Construction",
            ].map((t) => (
              <Link
                key={t}
                href={`/jobs?category=${t}`}
                className="hover:text-white text-blue-700 underline underline-offset-2"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-stone-100 mt-10 border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {
              value: totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : "12k+",
              label: "Active Jobs",
            },
            {
              value: verifiedCompanies > 0 ? `${verifiedCompanies}+` : "850+",
              label: "Verified Companies",
            },
            { value: "45k", label: "Successful Placements" },
            { value: "24/7", label: "Visa Support" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-800">
                {s.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 px-2 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Explore roles across all major industries in Korea.
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              View All Categories →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.name}
                  href={`/jobs?category=${cat.name}`}
                  className="rounded-2xl p-5 text-center hover:shadow-md transition cursor-pointer bg-white border border-black/10"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${cat.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="text-sm font-semibold text-gray-800">
                    {cat.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Opportunities
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Top companies hiring this week for international talent.
              </p>
            </div>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">💼</div>
              <p className="text-lg font-medium">No featured jobs yet</p>
              <p className="text-sm mt-2">
                Be the first to post a job or check back soon!
              </p>
              <Link
                href="/jobs"
                className="mt-6 inline-block bg-blue-700 text-white px-6 py-2 rounded-xl"
              >
                Browse All Jobs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-center text-blue-700 font-bold text-sm">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        job.company.name.charAt(0)
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${JOB_TYPE_COLORS[job.type]}`}
                    >
                      {JOB_TYPE_LABELS[job.type]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {job.company.name} · {job.location}
                  </p>
                  {formatSalary(job.salaryMin, job.salaryMax) && (
                    <p className="text-xs text-blue-600 font-semibold mb-3">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {timeAgo(job.createdAt)}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Apply Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/jobs"
              className="border border-blue-700 text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              Browse All Jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* Employer CTA */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto overflow-hidden rounded-3xl">
          <div className="grid md:grid-cols-2">
            {/* Left Content */}
            <div className="bg-blue-700 text-white p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-4xl font-bold leading-tight mb-6">
                Are you hiring for your <br />
                company in Korea?
              </h2>

              <p className="text-blue-100 text-lg leading-relaxed max-w-md mb-8">
                Reach over 150,000 qualified Mongolian professionals already
                living in Korea. Our platform streamlines your recruitment with
                visa-ready talent.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  href="/register?role=EMPLOYER"
                  className="bg-white text-blue-700 px-7 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
                >
                  Post a Job for Free
                </Link>

                <Link
                  href="/recruiter"
                  className="border border-blue-400 text-white px-7 py-4 rounded-xl font-medium hover:bg-blue-600 transition"
                >
                  View Employer Portal
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img
                    src="https://i.pravatar.cc/40?img=1"
                    className="w-8 h-8 rounded-full border-2 border-blue-700"
                    alt=""
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=2"
                    className="w-8 h-8 rounded-full border-2 border-blue-700"
                    alt=""
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=3"
                    className="w-8 h-8 rounded-full border-2 border-blue-700"
                    alt=""
                  />
                </div>

                <p className="text-blue-200 text-sm">
                  Trusted by 850+ South Korean companies
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:block relative min-h-125">
              <img
                src="/employer--cta.png"
                alt="Employer Dashboard"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
