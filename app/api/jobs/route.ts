import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const featured = searchParams.get("featured") === "true";

  const where: Record<string, unknown> = { status: "APPROVED" };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
  if (category) where.category = category;
  if (type) where.type = type;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (featured) where.featured = true;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { name: true, logo: true, verified: true, location: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const company = await prisma.company.upsert({
    where: { userId: user.id },
    update: {},
    create: { name: user.name, userId: user.id },
  });

  const job = await prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      benefits: data.benefits,
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
      location: data.location,
      type: data.type || "FULL_TIME",
      category: data.category,
      contactPhone: data.contactPhone || null,
      companyId: company.id,
      status: "APPROVED",
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
