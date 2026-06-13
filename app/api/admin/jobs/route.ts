import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "EXPIRED"] as const;

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = parseInt(new URL(req.url).searchParams.get("page") ?? "1");
  const take = 50;
  const skip = (page - 1) * take;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      include: {
        company: { select: { name: true, logo: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.job.count(),
  ]);

  return NextResponse.json({ jobs, total, pages: Math.ceil(total / take) });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const existing = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const job = await prisma.job.update({ where: { id }, data: { status } });

  // Notify recruiter
  if (status === "APPROVED" || status === "REJECTED") {
    const isApproved = status === "APPROVED";
    await prisma.notification.create({
      data: {
        userId:  existing.company.userId,
        title:   isApproved ? "Таны зар зөвшөөрөгдлөө" : "Таны зар татгалзагдлаа",
        message: isApproved
          ? `"${existing.title}" зар admin-аар зөвшөөрөгдөж нийтлэгдлээ.`
          : `"${existing.title}" зар admin-аар татгалзагдлаа.`,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ job });
}
