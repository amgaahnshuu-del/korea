import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, currentPassword, newPassword } = await req.json();

  const data: Record<string, string> = {};

  if (name?.trim()) data.name = name.trim();
  if (phone !== undefined) data.phone = phone;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const match = await bcrypt.compare(currentPassword, existing.password);
    if (!match) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    data.password = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: auth.id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  const cookieStore = await cookies();
  cookieStore.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });

  return NextResponse.json({ user: updated });
}
