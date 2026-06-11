import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const jobs = await prisma.job.findMany({
    include: {
      company: { select: { name: true, logo: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const job = await prisma.job.update({ where: { id }, data: { status } });
  return NextResponse.json({ job });
}
