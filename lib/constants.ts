export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Бүтэн цагийн",
  PART_TIME: "Хагас цагийн",
  CONTRACT: "Гэрээт",
  INTERNSHIP: "Дадлага",
};

export const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-green-100 text-green-700",
  PART_TIME: "bg-blue-100 text-blue-700",
  CONTRACT: "bg-purple-100 text-purple-700",
  INTERNSHIP: "bg-yellow-100 text-yellow-700",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  PENDING: "Хянагдаж буй",
  APPROVED: "Зөвшөөрсөн",
  REJECTED: "Татгалзсан",
};

export const APP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  REVIEWED: "Харсан",
  INTERVIEWED: "Ярилцлага",
  ACCEPTED: "Хүлээн авсан",
  REJECTED: "Татгалзсан",
};

export const APP_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  INTERVIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const CATEGORIES = [
  "Manufacturing",
  "IT & Tech",
  "Food & Beverage",
  "Construction",
  "Logistics",
  "Healthcare",
  "Agriculture",
  "Service & Sales",
];

export function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(0)}만원` : `${n.toLocaleString()}원`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}~`;
  return `~${fmt(max!)}`;
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60) || 1}м өмнө`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}ц өмнө`;
  return `${Math.floor(seconds / 86400)}өдр өмнө`;
}
