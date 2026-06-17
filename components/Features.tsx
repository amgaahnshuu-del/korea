"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Lightbulb, Recycle, Sprout } from "lucide-react";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

const FEATURES = [
  {
    icon: Leaf,
    mn: { title: "Найдвартай боломжууд", desc: "БНСУ-ын баталгаатай компаниудын ажлын байрны мэдээлэл." },
    en: { title: "Verified Opportunities", desc: "Only verified, legally registered Korean companies with real job openings." },
    ko: { title: "검증된 채용 정보", desc: "법적으로 등록된 한국 기업의 실제 채용 공고만 제공합니다." },
  },
  {
    icon: Lightbulb,
    mn: { title: "Хялбар, хурдан процесс", desc: "Онлайн бүртгэл, визний зөвлөгөө, ажлын байрны зуучлал." },
    en: { title: "Fast & Simple Process", desc: "Register in minutes and start applying to jobs right away." },
    ko: { title: "빠르고 간편한 프로세스", desc: "몇 분 안에 등록하고 바로 지원을 시작할 수 있습니다." },
  },
  {
    icon: Recycle,
    mn: { title: "Аюулгүй & Хуулийн дагуу", desc: "Хуулийн дагуу зөвшөөрөлтэй, найдвартай партнёр байгууллагууд." },
    en: { title: "Safe & Legal Compliance", desc: "E-9, E-7, H-2 visa categories — all processes within legal frameworks." },
    ko: { title: "안전 & 법률 준수", desc: "E-9, E-7, H-2 비자 카테고리 - 모든 절차가 법적 테두리 안에서 진행됩니다." },
  },
  {
    icon: Sprout,
    mn: { title: "Бүрэн дэмжлэг", desc: "БНСУ-д очсоны дараа ч танд байнгын дэмжлэг үзүүлнэ." },
    en: { title: "Full Support", desc: "Professional support team available 24/7 in three languages." },
    ko: { title: "완전한 지원", desc: "몽골어, 한국어, 영어로 24/7 전문 지원팀이 대기하고 있습니다." },
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export default function Features() {
  const { locale } = useLanguage();

  return (
    <section className="bg-[#eef7f1] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1175px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[#22C55E]/10 px-4 py-1.5 text-sm font-semibold text-[#22C55E]">
            {pick(locale, { mn: "ЯАГААД БИДНИЙГ СОНГОХ ВЭ?", en: "WHY CHOOSE US?", ko: "왜 저희를 선택해야 할까요?" })}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#20506d] sm:text-4xl">
            {pick(locale, { mn: "Бидний үйлчилгээний давуу тал", en: "Our Service Advantages", ko: "우리 서비스의 장점" })}
          </h2>

          {/* Decorative divider: line — logo — line */}
          <div className="mt-4.25 flex items-center justify-center gap-3">
            <div className="h-px w-10 rounded-full bg-[#163c4e]" />
            <Image
              src="/logo.png"
              alt="Mongol Connect"
              width={32}
              height={32}
              className="h-8 w-auto opacity-50"
            />
            <div className="h-px w-10 rounded-full bg-[#22c55e]" />
          </div>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const content = pick(locale, { mn: feat.mn, en: feat.en, ko: feat.ko });

            return (
              <motion.div
                key={feat.mn.title}
                variants={item}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Icon */}
                <div className="mb-6 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]/10">
                  <Icon className="h-7 w-7 text-[#22C55E]" />
                </div>

                {/* Text */}
                <h3 className="mb-3 text-lg font-bold text-[#316d96] text-center">{content.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-[#20506d] text-center">{content.desc}</p>

                {/* Link */}
                <Link
                  href="/about"
                  className="mt-6 flex items-center gap-1 text-sm font-semibold text-[#22C55E] transition hover:gap-2 justify-center"
                >
                  {pick(locale, { mn: "Дэлгэрэнгүй", en: "Learn more", ko: "자세히 보기" })}
                  <span>→</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
