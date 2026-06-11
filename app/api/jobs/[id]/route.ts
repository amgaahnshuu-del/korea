import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.job.update({ where: { id }, data: { views: { increment: 1 } } });

  return NextResponse.json({ job });
}
