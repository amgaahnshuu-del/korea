import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { reason, description } = await req.json();
  if (!reason) return NextResponse.json({ error: "reason required" }, { status: 400 });

  // Verify this application belongs to one of the recruiter's jobs
  const company = await prisma.company.findUnique({ where: { userId: auth.id } });
  if (!company) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const application = await prisma.application.findFirst({
    where: { id, job: { companyId: company.id } },
    select: { userId: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent duplicate reports from the same recruiter about the same user
  const existing = await prisma.userReport.findFirst({
    where: { reportedUserId: application.userId, reportedBy: auth.id },
  });
  if (existing) return NextResponse.json({ error: "Already reported" }, { status: 409 });

  const report = await prisma.userReport.create({
    data: {
      reportedUserId: application.userId,
      reportedBy:     auth.id,
      reason,
      description: description || null,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
