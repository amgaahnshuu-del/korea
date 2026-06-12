import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: jobId } = await params;

  const job = await prisma.job.findFirst({
    where: { id: jobId, company: { userId: user.id } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.job.update({
    where: { id: jobId },
    data: { featured: true, createdAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
