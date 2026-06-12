import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { cvText: true } });
  return NextResponse.json({ cvText: user?.cvText ?? "" });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cvText } = await req.json();
  await prisma.user.update({ where: { id: auth.id }, data: { cvText: cvText ?? "" } });
  return NextResponse.json({ ok: true });
}
