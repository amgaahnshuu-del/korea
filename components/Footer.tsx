"use client";

import Link from "next/link";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { locale } = useLanguage();

  const text = {
    description: pick(locale, {
      mn: "Монголын иргэдийг БНСУ дахь тогтвортой ажил, өсөлтийн боломжтой холбодог найдвартай платформ.",
      en: "A trusted platform connecting Mongolian talent with stable careers and growth opportunities in South Korea.",
      ko: "몽골 인재를 한국의 안정적인 일자리와 성장 기회에 연결하는 신뢰할 수 있는 플랫폼입니다.",
    }),
    jobSeekers: pick(locale, { mn: "Ажил хайгчид", en: "Job Seekers", ko: "구직자" }),
    employers: pick(locale, { mn: "Ажил олгогчид", en: "Employers", ko: "고용주" }),
    company: pick(locale, { mn: "Компанийн мэдээлэл", en: "Company", ko: "회사" }),
    findJobs: pick(locale, { mn: "Ажлын байр хайх", en: "Find Jobs", ko: "채용 찾기" }),
    visaSupport: pick(locale, { mn: "Визний дэмжлэг", en: "Visa Support", ko: "비자 지원" }),
    resumeBuilder: pick(locale, { mn: "CV бэлтгэх", en: "Resume Builder", ko: "이력서 만들기" }),
    careerAdvice: pick(locale, { mn: "Карьерын зөвлөгөө", en: "Career Advice", ko: "커리어 조언" }),
    postJob: pick(locale, { mn: "Зар оруулах", en: "Post a Job", ko: "채용 등록" }),
    talentSearch: pick(locale, { mn: "Нэр дэвшигч хайх", en: "Talent Search", ko: "인재 검색" }),
    enterprisePricing: pick(locale, { mn: "Байгууллагын багц", en: "Enterprise Pricing", ko: "기업 요금제" }),
    successStories: pick(locale, { mn: "Амжилтын түүх", en: "Success Stories", ko: "성공 사례" }),
    aboutUs: pick(locale, { mn: "Бидний тухай", en: "About Us", ko: "회사 소개" }),
    terms: pick(locale, { mn: "Үйлчилгээний нөхцөл", en: "Terms of Service", ko: "이용 약관" }),
    privacy: pick(locale, { mn: "Нууцлалын бодлого", en: "Privacy Policy", ko: "개인정보 처리방침" }),
    contactSupport: pick(locale, { mn: "Дэмжлэгтэй холбогдох", en: "Contact Support", ko: "지원 문의" }),
    copyright: pick(locale, {
      mn: "© 2024 MongolJob (Ajil Korea). Бүх эрх хуулиар хамгаалагдсан. БНСУ дахь Монголчуудад зориулсан үйлчилгээ.",
      en: "© 2024 MongolJob (Ajil Korea). All rights reserved. Supporting the Mongolian diaspora in Korea.",
      ko: "© 2024 MongolJob (Ajil Korea). 모든 권리 보유. 한국 내 몽골 커뮤니티를 지원합니다.",
    }),
  };

  return (
    <footer className="bg-gray-900 pt-12 pb-6 text-gray-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-2 text-lg font-bold text-white">Ajil Korea</h3>
            <p className="mb-4 text-sm text-gray-400">{text.description}</p>
            <div className="flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs transition hover:bg-blue-600">
                f
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs transition hover:bg-sky-500">
                t
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{text.jobSeekers}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="transition hover:text-white">
                  {text.findJobs}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.visaSupport}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.resumeBuilder}
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-white">
                  {text.careerAdvice}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{text.employers}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs/post" className="transition hover:text-white">
                  {text.postJob}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.talentSearch}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.enterprisePricing}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.successStories}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{text.company}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-white">
                  {text.aboutUs}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.terms}
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  {text.privacy}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  {text.contactSupport}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 text-xs text-gray-500">
          <p>{text.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
