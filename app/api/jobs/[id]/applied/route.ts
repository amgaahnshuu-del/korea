import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ applied: false });

  const { id: jobId } = await params;

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: auth.id, jobId } },
    select: { id: true },
  });

  return NextResponse.json({ applied: !!existing });
}
