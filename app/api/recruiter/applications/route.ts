import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return NextResponse.json({ applications: [] });

  const applications = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      job: { select: { id: true, title: true, location: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
