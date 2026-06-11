import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
