import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import JobDetailClient from "./JobDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ajilkorea.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      company: { select: { name: true } },
    },
  });

  if (!job) {
    return { title: "Job Not Found" };
  }

  const salary =
    job.salaryMin && job.salaryMax
      ? ` · ₩${job.salaryMin.toLocaleString()}–₩${job.salaryMax.toLocaleString()}`
      : "";

  const title = `${job.title} at ${job.company.name}`;
  const description = `${job.title} – ${job.company.name}, ${job.location}${salary}. ${job.description.slice(0, 140)}…`;
  const url = `${BASE_URL}/jobs/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Ajil Korea",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export default function JobDetailPage() {
  return <JobDetailClient />;
}
