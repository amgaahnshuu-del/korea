import { prisma } from "@/lib/prisma";

export const JOB_EXPIRY_DAYS = 30;
export const JOB_DELETE_DAYS = 60;

export function getExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + JOB_EXPIRY_DAYS);
  return d;
}

export function isExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

/**
 * Mark all past-expiry APPROVED jobs as EXPIRED.
 * PENDING and REJECTED jobs are not touched.
 * Sends a notification to each job owner.
 */
export async function expireJobs(): Promise<number> {
  const jobs = await prisma.job.findMany({
    where: { status: "APPROVED", expiresAt: { lt: new Date() } },
    select: { id: true, title: true, company: { select: { userId: true } } },
  });

  if (jobs.length === 0) return 0;

  await prisma.job.updateMany({
    where: { id: { in: jobs.map((j) => j.id) } },
    data: { status: "EXPIRED" },
  });

  // Notify each job owner (fire-and-forget)
  await Promise.all(
    jobs.map((j) =>
      prisma.notification.create({
        data: {
          userId:  j.company.userId,
          title:   "Зарын хугацаа дууслаа",
          message: `"${j.title}" зарын 30 хоногийн хугацаа дууссан тул автоматаар идэвхгүй болсон.`,
        },
      }).catch(() => {})
    )
  );

  return jobs.length;
}

/** Delete jobs older than JOB_DELETE_DAYS days (regardless of status). */
export async function deleteOldJobs(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - JOB_DELETE_DAYS);

  const result = await prisma.job.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return result.count;
}
