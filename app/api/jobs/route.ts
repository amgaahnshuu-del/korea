import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getExpiryDate } from "@/lib/expire-jobs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const type     = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const visa     = searchParams.get("visa") || "";
  const salaryMinParam = searchParams.get("salaryMin");
  const salaryMaxParam = searchParams.get("salaryMax");
  const page     = parseInt(searchParams.get("page") || "1");
  const limit    = parseInt(searchParams.get("limit") || "10");
  const featured = searchParams.get("featured") === "true";

  const now = new Date();
  const where: Record<string, unknown> = {
    status: "APPROVED",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (q) {
    where.AND = [
      {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { location:    { contains: q, mode: "insensitive" } },
          { company:     { name: { contains: q, mode: "insensitive" } } },
        ],
      },
    ];
  }
  if (category) where.category = category;
  if (type)     where.type     = type;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (featured) where.featured = true;

  if (salaryMinParam) {
    const min = parseInt(salaryMinParam);
    if (!isNaN(min)) where.salaryMax = { gte: min };
  }
  if (salaryMaxParam) {
    const max = parseInt(salaryMaxParam);
    if (!isNaN(max)) where.salaryMin = { lte: max };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { name: true, logo: true, verified: true, location: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const company = await prisma.company.upsert({
    where: { userId: user.id },
    update: {},
    create: { name: user.name, userId: user.id },
  });

  const job = await prisma.job.create({
    data: {
      title:         data.title,
      description:   data.description,
      requirements:  data.requirements,
      benefits:      data.benefits,
      salaryMin:     data.salaryMin     ? parseInt(data.salaryMin)     : null,
      salaryMax:     data.salaryMax     ? parseInt(data.salaryMax)     : null,
      location:      data.location,
      type:          data.type          || "FULL_TIME",
      category:      data.category,
      contactPhone:  data.contactPhone  || null,
      recruiterName: data.recruiterName || null,
      phoneNumber:   data.phoneNumber   || null,
      kakaoId:       data.kakaoId       || null,
      companyId:     company.id,
      status:        "PENDING",
      expiresAt:     getExpiryDate(),
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
