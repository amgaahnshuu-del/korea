"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Users, Trophy, Globe2 } from "lucide-react";
import { pick } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

interface StatItem {
  icon: typeof Leaf;
  value: number;
  suffix: string;
  labelMn: string;
  labelEn: string;
  labelKo: string;
  descMn: string;
  descEn: string;
  descKo: string;
}

const STATS: StatItem[] = [
  {
    icon: Leaf,
    value: 120,
    suffix: "+",
    labelMn: "Найдвартай компани",
    labelEn: "Verified Companies",
    labelKo: "인증된 기업",
    descMn: "Бид зөвхөн итгэмжлэгдсэн компаниудтай хамтран ажилладаг.",
    descEn: "We only partner with fully vetted and certified companies.",
    descKo: "우리는 검증된 기업과만 협력합니다.",
  },
  {
    icon: Users,
    value: 85,
    suffix: "+",
    labelMn: "Амжилттай зуучилсан",
    labelEn: "Successful Placements",
    labelKo: "성공 취업 알선",
    descMn: "Өнөөг хүртэл олон залуусын амжилттай байдлыг биелүүлсэн.",
    descEn: "Thousands of Mongolians successfully placed in Korean jobs.",
    descKo: "수천 명의 몽골인이 한국 직장에 성공적으로 취업했습니다.",
  },
  {
    icon: Trophy,
    value: 10,
    suffix: "+",
    labelMn: "Жилийн туршлага",
    labelEn: "Years of Experience",
    labelKo: "년의 경험",
    descMn: "Солонгосын хөдөлмөрийн зах зээлд 10+ жилийн туршлага.",
    descEn: "Over a decade of expertise in the Korean labor market.",
    descKo: "한국 노동 시장에서 10년 이상의 전문 경험.",
  },
  {
    icon: Globe2,
    value: 500,
    suffix: "K+",
    labelMn: "Хүмүүст хүрсэн",
    labelEn: "People Reached",
    labelKo: "도달한 사람들",
    descMn: "500,000+ хүнийг болон ажил хайлгаж манай платформыг ашигласан.",
    descEn: "Over 500,000 people have used our platform to find work.",
    descKo: "50만 명 이상이 저희 플랫폼을 통해 일자리를 찾았습니다.",
  },
];

function useCountUp(target: number, isVisible: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration]);

  return count;
}

function StatCounter({ stat }: { stat: StatItem }) {
  const { locale } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(stat.value, isVisible);
  const Icon = stat.icon;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-6 w-6 text-[#22C55E]" />
      </div>
      <div>
        <div className="text-4xl font-extrabold text-white lg:text-5xl">
          {count}{stat.suffix}
        </div>
        <div className="mt-1 text-base font-semibold text-white">
          {pick(locale, { mn: stat.labelMn, en: stat.labelEn, ko: stat.labelKo })}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          {pick(locale, { mn: stat.descMn, en: stat.descEn, ko: stat.descKo })}
        </p>
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Stats() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <div className="absolute inset-0 bg-linear-to-r from-[#052C65] via-[#18535a] to-[#22C55E]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2MmgxdjRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <motion.div key={stat.labelMn} variants={item}>
              <StatCounter stat={stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
