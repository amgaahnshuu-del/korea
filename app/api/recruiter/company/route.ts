import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ company });
}

export async function PUT(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();
  const { name, logo, description, industry, location, size, website } = data;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const existing = await prisma.company.findUnique({ where: { userId: user.id } });

  const company = existing
    ? await prisma.company.update({
        where: { userId: user.id },
        data: { name, logo, description, industry, location, size, website },
      })
    : await prisma.company.create({
        data: { name, logo, description, industry, location, size, website, userId: user.id },
      });

  return NextResponse.json({ company });
}
