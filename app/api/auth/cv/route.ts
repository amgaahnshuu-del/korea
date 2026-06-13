import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, cv] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.id }, select: { cvText: true } }),
    prisma.cV.findUnique({ where: { userId: auth.id } }),
  ]);

  return NextResponse.json({ cvText: user?.cvText ?? "", cv: cv ?? null });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Structured CV save
  if (body.fullName !== undefined || body.email !== undefined) {
    const {
      fullName, phone, email, dateOfBirth, gender, nationality,
      education, experience, skills, selfIntroduction, resumeUrl,
    } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: "fullName and email are required" }, { status: 400 });
    }

    const cv = await prisma.cV.upsert({
      where: { userId: auth.id },
      update: {
        fullName, phone: phone ?? null, email,
        dateOfBirth: dateOfBirth ?? null, gender: gender ?? null,
        nationality: nationality ?? null, education: education ?? null,
        experience: experience ?? null, skills: skills ?? null,
        selfIntroduction: selfIntroduction ?? null, resumeUrl: resumeUrl ?? null,
      },
      create: {
        userId: auth.id, fullName, phone: phone ?? null, email,
        dateOfBirth: dateOfBirth ?? null, gender: gender ?? null,
        nationality: nationality ?? null, education: education ?? null,
        experience: experience ?? null, skills: skills ?? null,
        selfIntroduction: selfIntroduction ?? null, resumeUrl: resumeUrl ?? null,
      },
    });
    return NextResponse.json({ cv });
  }

  // Legacy text CV save
  const { cvText } = body;
  await prisma.user.update({ where: { id: auth.id }, data: { cvText: cvText ?? "" } });
  return NextResponse.json({ ok: true });
}
