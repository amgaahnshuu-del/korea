import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const auth = await getUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reports = await prisma.userReport.findMany({
    include: {
      reportedUser: { select: { id: true, name: true, email: true, isBlocked: true } },
      reporter:     { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const auth = await getUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const report = await prisma.userReport.update({ where: { id }, data: { status } });
  return NextResponse.json({ report });
}
