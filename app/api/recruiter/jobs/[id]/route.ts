import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const job = await prisma.job.findFirst({ where: { id, companyId: company.id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Cascade delete is now handled by Prisma schema (onDelete: Cascade on Application.job)
  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
