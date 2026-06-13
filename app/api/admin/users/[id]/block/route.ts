import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { isBlocked } = await req.json();

  if (typeof isBlocked !== "boolean") {
    return NextResponse.json({ error: "isBlocked must be boolean" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ error: "Cannot block admin" }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data: { isBlocked } });

  return NextResponse.json({ user: { id: user.id, name: user.name, isBlocked: user.isBlocked } });
}
