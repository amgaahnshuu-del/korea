"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { formatSalary, pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";
import type { Locale } from "@/lib/i18n";

interface Company {
  name: string;
  logo: string | null;
  location: string | null;
  verified: boolean;
}

export interface JobItem {
  id: string;
  title: string;
  type: string;
  location: string;
  category?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt: Date | string;
  image?: string | null;
  company: Company;
}

interface FeaturedJobsProps {
  jobs: JobItem[];
}

const CATEGORY_LABELS: Record<string, { mn: string; en: string; ko: string; color: string }> = {
  Manufacturing:    { mn: "Үйлдвэрлэл",            en: "Manufacturing",  ko: "제조업",  color: "bg-[#22c55e]" },
  "IT & Tech":      { mn: "IT & Технологи",         en: "IT & Tech",      ko: "IT",      color: "bg-indigo-600" },
  "Food & Beverage":{ mn: "Хоол хүнс & Үйлчилгээ", en: "Food & Service", ko: "식음료",  color: "bg-orange-500" },
  Construction:     { mn: "Барилга",                en: "Construction",   ko: "건설",    color: "bg-yellow-600" },
  Logistics:        { mn: "Логистик",               en: "Logistics",      ko: "물류",    color: "bg-purple-600" },
};

const MOCK_JOBS: JobItem[] = [
  {
    id: "mock-1",
    title: "Үйлдвэрийн ажилтан",
    type: "FULL_TIME",
    location: "Ганин, Сөүл",
    category: "Manufacturing",
    salaryMin: 2500000,
    salaryMax: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2),
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=75",
    company: { name: "Samsung Manufacturing", logo: null, location: "Сөүл", verified: true },
  },
  {
    id: "mock-2",
    title: "Рестораны тогооч",
    type: "FULL_TIME",
    location: "Сөүл, Солонгос",
    category: "Food & Beverage",
    salaryMin: 2800000,
    salaryMax: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5),
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=75",
    company: { name: "Korea Restaurant Group", logo: null, location: "Сөүл", verified: true },
  },
  {
    id: "mock-3",
    title: "Барилгын ажилтан",
    type: "FULL_TIME",
    location: "Пусан, Солонгос",
    category: "Construction",
    salaryMin: 2700000,
    salaryMax: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8),
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75",
    company: { name: "Daewoo Construction", logo: null, location: "Пусан", verified: true },
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function formatPostedTime(locale: Locale, createdAt: Date | string) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (locale === "mn") {
    if (diffDays >= 1) return `${diffDays} өдөр өмнө`;
    if (diffHours >= 1) return `${diffHours} цагийн өмнө`;
    return "Саяхан";
  }

  if (locale === "ko") {
    if (diffDays >= 1) return `${diffDays}일 전`;
    if (diffHours >= 1) return `${diffHours}시간 전`;
    return "방금 전";
  }

  if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const { locale } = useLanguage();
  const displayJobs = jobs.length > 0 ? jobs.slice(0, 5) : MOCK_JOBS.slice(0, 5);

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1175px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between"
        >
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-[#E8F8EF] px-5 py-2 text-[9px] font-medium uppercase tracking-[0.18em] text-[#18B15A]">
              {pick(locale, { mn: "Шинэ ажлын байрнууд", en: "Latest Listings", ko: "최신 공고" })}
            </span>
            <h2 className="text-[14px] font-extrabold leading-[1.05] tracking-tight text-[#20506d] sm:text-[26px]">
              {pick(locale, { mn: "Сүүлийн ажлын байрнууд", en: "Recent Job Openings", ko: "최신 채용 공고" })}
            </h2>
          </div>
          <Link
            href="/jobs"
            className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-[#22c55e] bg-[#22c55e] px-6 py-4 text-[11px] font-semibold text-white shadow-[0_1px_0_rgba(15,23,42,0.02)] transition hover:-translate-y-0.5 hover:border-[#18B15A]/25 hover:shadow-lg"
          >
            {pick(locale, { mn: "Бүх ажлын байр", en: "View All", ko: "전체 보기" })}
            <ArrowRight size={11} />
          </Link>
        </motion.div>

        {/* Job cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4"
        >
          {displayJobs.map((job) => {
            const catInfo = CATEGORY_LABELS[job.category ?? ""];
            const salary = formatSalary(locale as Locale, job.salaryMin, job.salaryMax);
            const postedTime = formatPostedTime(locale as Locale, job.createdAt);

            return (
              <motion.div key={job.id} variants={cardVariant}>
                <Link
                  href={job.id.startsWith("mock-") ? "/jobs" : `/jobs/${job.id}`}
                  className="group flex h-full min-h-[196px] flex-col overflow-hidden rounded-[22px] border border-[#E7EBF2] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.10)]"
                >
                  <div className="flex items-start justify-between gap-2">

                    {catInfo && (
                      <span className="rounded-full border border-[#E7EBF2] bg-transparent px-3 py-1.5 text-[10px] font-semibold text-[#20506d] shadow-none">
                        {pick(locale, { mn: catInfo.mn, en: catInfo.en, ko: catInfo.ko })}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-[18px] font-bold leading-snug text-[#163c4e] transition group-hover:text-[#20506d]">
                      {job.title}
                    </h3>

                    <div className="mt-1 text-[13px] leading-snug text-[#6B7280]">
                      {job.company.name.toLowerCase()} · {job.location.toLowerCase()}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                      <MapPin size={13} className="shrink-0 text-[#19C15F]" />
                      <span>{job.company.location ?? job.location}</span>
                    </div>

                    <div className="mt-3">
                      {salary && (
                        <span className="text-[16px] font-bold tracking-tight text-[#20506d]">
                          {salary}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="text-[12px] font-medium text-[#94A3B8]">{postedTime}</span>
                      <span className="inline-flex items-center rounded-full bg-[#16a34a] px-4 py-1.5 text-[13px] font-semibold text-white transition group-hover:bg-[#22c55e]">
                        {pick(locale, { mn: "Оролцох", en: "Apply", ko: "지원" })}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
