import { NextRequest, NextResponse } from "next/server";
import { expireJobs, deleteOldJobs } from "@/lib/expire-jobs";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [expired, deleted] = await Promise.all([expireJobs(), deleteOldJobs()]);

  return NextResponse.json({
    ok: true,
    expired,
    deleted,
    runAt: new Date().toISOString(),
  });
}
