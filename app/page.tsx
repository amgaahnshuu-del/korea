import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import FeaturedJobs from "@/components/FeaturedJobs";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const user = await getUser();
  if (user) redirect("/jobs");

  const randomIds = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Job" WHERE status = 'APPROVED' ORDER BY RANDOM() LIMIT 5
  `;

  const randomOrder = new Map(randomIds.map((row, index) => [row.id, index]));

  const featuredJobs =
    randomIds.length > 0
      ? await prisma.job.findMany({
          where: { id: { in: randomIds.map((r) => r.id) }, status: "APPROVED" },
          include: {
            company: { select: { name: true, logo: true, location: true, verified: true } },
          },
        }).then((rows) =>
          rows.sort((a, b) => (randomOrder.get(a.id) ?? 0) - (randomOrder.get(b.id) ?? 0)),
        )
      : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Stats />
        <FeaturedJobs jobs={featuredJobs} />
      </main>
      <Footer />
    </div>
  );
}
