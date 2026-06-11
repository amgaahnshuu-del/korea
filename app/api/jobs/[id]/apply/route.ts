import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: jobId } = await params;
  const { message } = await req.json();

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const application = await prisma.application.create({
    data: { userId: user.id, jobId, message },
  });

  return NextResponse.json({ application }, { status: 201 });
}
