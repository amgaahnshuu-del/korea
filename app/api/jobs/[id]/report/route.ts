import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const VALID_REASONS = ["Scam", "Duplicate", "Wrong Information", "Fake Job", "Other"] as const;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: jobId } = await params;
  const { reason, description } = await req.json();

  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Valid reason required" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const report = await prisma.jobReport.create({
    data: { jobId, userId: auth.id, reason, description: description || null },
  });

  return NextResponse.json({ report }, { status: 201 });
}
