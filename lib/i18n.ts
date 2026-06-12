export type Locale = "mn" | "en" | "ko";

export const DEFAULT_LOCALE: Locale = "mn";
export const LANGUAGE_COOKIE = "ajil-korea-lang";
const LOCALE_TAGS: Record<Locale, string> = {
  mn: "mn-MN",
  en: "en-US",
  ko: "ko-KR",
};

const RELATIVE_TIME_LABELS: Record<Locale, { minute: string; hour: string; day: string; ago: string }> = {
  mn: { minute: "мин", hour: "цаг", day: "өдөр", ago: "өмнө" },
  en: { minute: "m", hour: "h", day: "d", ago: "ago" },
  ko: { minute: "분", hour: "시간", day: "일", ago: "전" },
};

export const SUPPORTED_LOCALES: Array<{
  code: Locale;
  short: string;
  label: string;
}> = [
  { code: "mn", short: "MN", label: "Монгол" },
  { code: "en", short: "EN", label: "English" },
  { code: "ko", short: "KR", label: "한국어" },
];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "mn" || value === "en" || value === "ko";
}

export function pick<T>(locale: Locale, values: Record<Locale, T>): T {
  return values[locale] ?? values.mn;
}

export function formatSalary(locale: Locale, min?: number | null, max?: number | null): string | null {
  if (!min && !max) {
    return pick(locale, { mn: "Тохиролцоно", en: "Negotiable", ko: "협의" });
  }

  const formatter = new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  });
  const format = (value: number) => formatter.format(value);

  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `${format(min)}+`;
  return `~${format(max!)}`;
}

export function formatRelativeTime(locale: Locale, date: Date | string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  const labels = RELATIVE_TIME_LABELS[locale];

  if (seconds < 3600) {
    const minutes = Math.max(1, Math.floor(seconds / 60));
    return locale === "en" ? `${minutes}${labels.minute} ${labels.ago}` : `${minutes} ${labels.minute} ${labels.ago}`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return locale === "en" ? `${hours}${labels.hour} ${labels.ago}` : `${hours} ${labels.hour} ${labels.ago}`;
  }

  const days = Math.floor(seconds / 86400);
  return locale === "en" ? `${days}${labels.day} ${labels.ago}` : `${days} ${labels.day} ${labels.ago}`;
}

export function formatDate(locale: Locale, date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getJobTypeLabel(locale: Locale, type: string): string {
  const labels = pick(locale, {
    mn: {
      FULL_TIME: "Бүтэн цагийн",
      PART_TIME: "Хагас цагийн",
      CONTRACT: "Гэрээт",
      INTERNSHIP: "Дадлага",
    },
    en: {
      FULL_TIME: "Full-time",
      PART_TIME: "Part-time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
    },
    ko: {
      FULL_TIME: "정규직",
      PART_TIME: "파트타임",
      CONTRACT: "계약직",
      INTERNSHIP: "인턴십",
    },
  }) as Record<string, string>;

  return labels[type] ?? type;
}

export function getJobStatusLabel(locale: Locale, status: string): string {
  const labels = pick(locale, {
    mn: {
      PENDING: "Хянагдаж буй",
      APPROVED: "Зөвшөөрсөн",
      REJECTED: "Татгалзсан",
    },
    en: {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    },
    ko: {
      PENDING: "대기 중",
      APPROVED: "승인됨",
      REJECTED: "거부됨",
    },
  }) as Record<string, string>;

  return labels[status] ?? status;
}

export function getAppStatusLabel(locale: Locale, status: string): string {
  const labels = pick(locale, {
    mn: {
      PENDING: "Хүлээгдэж буй",
      REVIEWED: "Харсан",
      INTERVIEWED: "Ярилцлага",
      ACCEPTED: "Хүлээн авсан",
      REJECTED: "Татгалзсан",
    },
    en: {
      PENDING: "Pending",
      REVIEWED: "Reviewed",
      INTERVIEWED: "Interviewed",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
    },
    ko: {
      PENDING: "대기 중",
      REVIEWED: "검토됨",
      INTERVIEWED: "면접",
      ACCEPTED: "수락됨",
      REJECTED: "거부됨",
    },
  }) as Record<string, string>;

  return labels[status] ?? status;
}

export function getCategoryLabel(locale: Locale, category: string): string {
  const labels = pick(locale, {
    mn: {
      Manufacturing: "Үйлдвэрлэл",
      "IT & Tech": "IT & Технологи",
      "Food & Beverage": "Хоол хүнс & Уух зүйл",
      Construction: "Барилга",
      Logistics: "Логистик",
      Healthcare: "Эрүүл мэнд",
      Agriculture: "Хөдөө аж ахуй",
      "Service & Sales": "Үйлчилгээ & Борлуулалт",
    },
    en: {
      Manufacturing: "Manufacturing",
      "IT & Tech": "IT & Tech",
      "Food & Beverage": "Food & Beverage",
      Construction: "Construction",
      Logistics: "Logistics",
      Healthcare: "Healthcare",
      Agriculture: "Agriculture",
      "Service & Sales": "Service & Sales",
    },
    ko: {
      Manufacturing: "제조",
      "IT & Tech": "IT & 기술",
      "Food & Beverage": "식음료",
      Construction: "건설",
      Logistics: "물류",
      Healthcare: "헬스케어",
      Agriculture: "농업",
      "Service & Sales": "서비스 & 영업",
    },
  }) as Record<string, string>;

  return labels[category] ?? category;
}

export { getTranslation } from "./translations";
