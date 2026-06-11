import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const contact = await prisma.contact.create({ data: { name, email, subject, message } });
    return NextResponse.json({ success: true, id: contact.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
