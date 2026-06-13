import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.id },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true, verified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_jobId: { userId: auth.id, jobId } },
  });
  if (existing) return NextResponse.json({ favorite: existing, already: true });

  const favorite = await prisma.favorite.create({ data: { userId: auth.id, jobId } });
  return NextResponse.json({ favorite }, { status: 201 });
}
