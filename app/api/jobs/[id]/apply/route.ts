import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: jobId } = await params;
  const { message } = await req.json();

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: auth.id, jobId } },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { userId: true, name: true } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const application = await prisma.application.create({
    data: { userId: auth.id, jobId, message },
  });

  // Notifications (fire-and-forget)
  const notifPromises = [
    prisma.notification.create({
      data: {
        userId:  auth.id,
        title:   "Өргөдөл амжилттай илгээгдлээ",
        message: `Таны CV "${job.title}" ажлын байранд амжилттай илгээгдлээ.`,
      },
    }),
  ];

  if (job.company.userId !== auth.id) {
    notifPromises.push(
      prisma.notification.create({
        data: {
          userId:  job.company.userId,
          title:   "Шинэ CV ирлээ",
          message: `"${job.title}" зарт шинэ CV ирлээ.`,
        },
      })
    );
  }

  await Promise.all(notifPromises).catch(() => {});

  return NextResponse.json({ application }, { status: 201 });
}
