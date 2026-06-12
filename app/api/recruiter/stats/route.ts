import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return NextResponse.json({ totalJobs: 0, totalApplications: 0, pending: 0, accepted: 0, rejected: 0, recentApplications: [] });

  const [totalJobs, totalApplications, pending, accepted, rejected, recentApplications] = await Promise.all([
    prisma.job.count({ where: { companyId: company.id } }),
    prisma.application.count({ where: { job: { companyId: company.id } } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: "PENDING" } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: "ACCEPTED" } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: "REJECTED" } }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ totalJobs, totalApplications, pending, accepted, rejected, recentApplications });
}
