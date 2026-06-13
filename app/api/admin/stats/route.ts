import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    totalJobs, approvedJobs, pendingJobs, rejectedJobs, expiredJobs,
    totalUsers, totalApps, totalReports,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "APPROVED" } }),
    prisma.job.count({ where: { status: "PENDING" } }),
    prisma.job.count({ where: { status: "REJECTED" } }),
    prisma.job.count({ where: { status: "EXPIRED" } }),
    prisma.user.count(),
    prisma.application.count(),
    prisma.jobReport.count({ where: { status: "OPEN" } }),
  ]);

  const recentJobs = await prisma.job.findMany({
    where: { status: "PENDING" },
    include: { company: { select: { name: true, logo: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalJobs, approvedJobs, pendingJobs, rejectedJobs, expiredJobs,
    totalUsers, totalApps, totalReports,
    recentJobs,
  });
}
