import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalJobs, totalUsers, totalApps, pendingJobs] = await Promise.all([
    prisma.job.count({ where: { status: "APPROVED" } }),
    prisma.user.count(),
    prisma.application.count(),
    prisma.job.count({ where: { status: "PENDING" } }),
  ]);

  const recentJobs = await prisma.job.findMany({
    where: { status: "PENDING" },
    include: { company: { select: { name: true, logo: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ totalJobs, totalUsers, totalApps, pendingJobs, recentJobs });
}
