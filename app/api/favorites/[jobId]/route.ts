import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;

  await prisma.favorite.deleteMany({ where: { userId: auth.id, jobId } });
  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ saved: false });

  const { jobId } = await params;
  const fav = await prisma.favorite.findUnique({
    where: { userId_jobId: { userId: auth.id, jobId } },
  });
  return NextResponse.json({ saved: !!fav });
}
