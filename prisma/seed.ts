import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
neonConfig.webSocketConstructor = require("ws");

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin
  const adminPw = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ajilkorea.com" },
    update: {},
    create: { name: "Admin", email: "admin@ajilkorea.com", password: adminPw, role: "ADMIN" },
  });

  // Create employer users
  const employerPw = await bcrypt.hash("employer123", 10);
  const employer1 = await prisma.user.upsert({
    where: { email: "samsung@recruit.com" },
    update: {},
    create: { name: "Samsung HR", email: "samsung@recruit.com", password: employerPw, role: "EMPLOYER" },
  });
  const employer2 = await prisma.user.upsert({
    where: { email: "hyundai@recruit.com" },
    update: {},
    create: { name: "Hyundai HR", email: "hyundai@recruit.com", password: employerPw, role: "EMPLOYER" },
  });
  const employer3 = await prisma.user.upsert({
    where: { email: "lotte@recruit.com" },
    update: {},
    create: { name: "Lotte HR", email: "lotte@recruit.com", password: employerPw, role: "EMPLOYER" },
  });
  const employer4 = await prisma.user.upsert({
    where: { email: "coupang@recruit.com" },
    update: {},
    create: { name: "Coupang HR", email: "coupang@recruit.com", password: employerPw, role: "EMPLOYER" },
  });

  // Create regular users
  const userPw = await bcrypt.hash("user123", 10);
  const user1 = await prisma.user.upsert({
    where: { email: "bataa@gmail.com" },
    update: {},
    create: { name: "Батаа Дорж", email: "bataa@gmail.com", password: userPw, role: "USER" },
  });
  await prisma.user.upsert({
    where: { email: "saran@gmail.com" },
    update: {},
    create: { name: "Саран Гантулга", email: "saran@gmail.com", password: userPw, role: "USER" },
  });

  // Create companies
  const samsungCo = await prisma.company.upsert({
    where: { userId: employer1.id },
    update: {},
    create: {
      name: "Samsung Electronics",
      industry: "IT & Tech",
      location: "Suwon, Gyeonggi",
      size: "270,000+",
      verified: true,
      website: "https://samsung.com",
      description: "Samsung Electronics is a global leader in technology, open to all possibilities. Together, we pursue relentless innovation to provide our customers with new capabilities.",
      userId: employer1.id,
    },
  });
  const hyundaiCo = await prisma.company.upsert({
    where: { userId: employer2.id },
    update: {},
    create: {
      name: "Hyundai Motor",
      industry: "Manufacturing",
      location: "Ulsan, South Korea",
      size: "75,000+",
      verified: true,
      website: "https://hyundai.com",
      description: "Hyundai Motor Company is dedicated to becoming the world's most innovative and responsible auto company.",
      userId: employer2.id,
    },
  });
  const lotteCo = await prisma.company.upsert({
    where: { userId: employer3.id },
    update: {},
    create: {
      name: "Lotte Hotel",
      industry: "Hospitality",
      location: "Seoul, South Korea",
      size: "5,000+",
      verified: true,
      website: "https://lottehotel.com",
      description: "Lotte Hotels & Resorts is a leading luxury hospitality brand in Asia offering world-class service.",
      userId: employer3.id,
    },
  });
  const coupangCo = await prisma.company.upsert({
    where: { userId: employer4.id },
    update: {},
    create: {
      name: "Coupang Logistics",
      industry: "Logistics",
      location: "Incheon, South Korea",
      size: "50,000+",
      verified: true,
      website: "https://coupang.com",
      description: "Coupang is Korea's leading e-commerce company with a massive logistics and fulfillment network.",
      userId: employer4.id,
    },
  });

  // Create jobs
  const jobs = [
    {
      title: "Senior Frontend Developer",
      description: "Samsung Electronics is looking for a talented Senior Frontend Developer to join our growing team in Suwon. You will work on cutting-edge web applications that serve millions of users globally.\n\nYou will collaborate with product managers, UX designers, and backend engineers to build high-quality, responsive web applications.",
      requirements: "• 3+ years of experience with React, Next.js, or Vue.js\n• Strong proficiency in TypeScript and modern JavaScript\n• Experience with RESTful APIs and GraphQL\n• Knowledge of web performance optimization\n• Excellent problem-solving skills",
      benefits: "Housing allowance provided\nMonthly meal allowance\n4 weeks annual leave\nHealth insurance included\nE-7 visa sponsorship",
      salaryMin: 3500000,
      salaryMax: 5000000,
      location: "Suwon, Gyeonggi",
      type: "FULL_TIME" as const,
      category: "IT & Tech",
      status: "APPROVED" as const,
      featured: true,
      companyId: samsungCo.id,
    },
    {
      title: "Mechanical Systems Engineer",
      description: "Hyundai Motor is hiring Mechanical Systems Engineers for our vehicle production facility in Ulsan. Join one of the world's top automotive manufacturers.\n\nYou will be responsible for maintaining and improving production line machinery, performing preventive maintenance, and ensuring quality standards.",
      requirements: "• Degree in Mechanical Engineering or related field\n• Experience with CNC machines or automotive production lines\n• Basic Korean language skills (TOPIK 2 preferred)\n• Ability to work rotating shifts\n• Strong attention to detail",
      benefits: "Company dormitory available\nOvertime pay included\n5 days annual leave\nMedical insurance\nE-9 visa sponsorship available",
      salaryMin: 2800000,
      salaryMax: 3800000,
      location: "Ulsan, South Korea",
      type: "FULL_TIME" as const,
      category: "Manufacturing",
      status: "APPROVED" as const,
      featured: true,
      companyId: hyundaiCo.id,
    },
    {
      title: "Logistics Center Manager",
      description: "Coupang is hiring a Logistics Center Manager to oversee operations at our Incheon fulfillment center. This is an excellent opportunity for experienced logistics professionals.\n\nManage a team of 50+ warehouse staff, coordinate with vendors, and ensure timely delivery of orders.",
      requirements: "• 2+ years in logistics or warehouse management\n• Experience with WMS (Warehouse Management Systems)\n• Strong leadership and communication skills\n• Intermediate Korean required\n• Physical fitness for warehouse environment",
      benefits: "Performance bonus\nFree meals on site\nTransportation allowance\nHealth & dental insurance\nCareer advancement path",
      salaryMin: 3200000,
      salaryMax: 4500000,
      location: "Incheon, South Korea",
      type: "FULL_TIME" as const,
      category: "Logistics",
      status: "APPROVED" as const,
      featured: true,
      companyId: coupangCo.id,
    },
    {
      title: "Lead Concierge (Mongolian Spk.)",
      description: "Lotte Hotel Seoul is looking for a Lead Concierge who speaks Mongolian to serve our growing Mongolian guest base. This is a premium hospitality role at one of Seoul's top luxury hotels.\n\nYou will provide exceptional service to VIP guests, coordinate special requests, and serve as a cultural liaison.",
      requirements: "• Native Mongolian speaker (Korean intermediate or higher)\n• 1+ year hotel or hospitality experience\n• Excellent interpersonal skills\n• Professional appearance and demeanor\n• Availability for rotating shifts",
      benefits: "Staff accommodation option\nUniform provided\nDining privileges\nPerformance incentives\nD-2 or E-9 visa support",
      salaryMin: 2500000,
      salaryMax: 3200000,
      location: "Seoul, South Korea",
      type: "FULL_TIME" as const,
      category: "Healthcare",
      status: "APPROVED" as const,
      featured: true,
      companyId: lotteCo.id,
    },
    {
      title: "Factory Production Worker",
      description: "Join Samsung Electronics' manufacturing team as a Production Worker. No prior experience needed — full on-site training provided. Competitive salary with overtime opportunities.",
      requirements: "• Physically fit and able to work in a factory environment\n• Willingness to learn new skills\n• Basic Korean communication\n• Shift work flexibility",
      benefits: "Training provided\nDormitory available\nOvertime pay\nAnnual bonus",
      salaryMin: 2200000,
      salaryMax: 3000000,
      location: "Suwon, Gyeonggi",
      type: "FULL_TIME" as const,
      category: "Manufacturing",
      status: "APPROVED" as const,
      featured: false,
      companyId: samsungCo.id,
    },
    {
      title: "Inventory Manager",
      description: "Manage inventory and stock control for our large-scale warehouse in Incheon. You will use ERP systems to track inventory and coordinate with our procurement team.",
      requirements: "• Experience with inventory management\n• Computer literacy (Excel, ERP systems)\n• Detail-oriented and organized",
      benefits: "Health insurance\nAnnual leave\nPerformance bonuses",
      salaryMin: 2800000,
      salaryMax: 3500000,
      location: "Incheon, South Korea",
      type: "FULL_TIME" as const,
      category: "Logistics",
      status: "APPROVED" as const,
      featured: false,
      companyId: coupangCo.id,
    },
    {
      title: "Korean Language Tutor (Part-time)",
      description: "Teach Korean language to Mongolian expats in Korea via online and in-person sessions. Flexible hours, competitive pay.",
      requirements: "• TOPIK Level 5 or 6\n• Teaching experience preferred\n• Patience and communication skills",
      benefits: "Flexible schedule\nWork from home option",
      salaryMin: 1500000,
      salaryMax: 2500000,
      location: "Seoul, South Korea",
      type: "PART_TIME" as const,
      category: "Service & Sales",
      status: "APPROVED" as const,
      featured: false,
      companyId: lotteCo.id,
    },
    {
      title: "Automotive QA Inspector",
      description: "Quality Assurance Inspector for Hyundai's vehicle assembly line. Perform inspections, identify defects, and ensure production meets quality standards.",
      requirements: "• Keen eye for detail\n• Basic mechanical knowledge\n• Ability to work standing for long periods",
      benefits: "Training provided\nHousing subsidy\nMeals on-site",
      salaryMin: 2600000,
      salaryMax: 3400000,
      location: "Ulsan, South Korea",
      type: "FULL_TIME" as const,
      category: "Manufacturing",
      status: "APPROVED" as const,
      featured: false,
      companyId: hyundaiCo.id,
    },
  ];

  for (const job of jobs) {
    const existing = await prisma.job.findFirst({ where: { title: job.title, companyId: job.companyId } });
    if (!existing) {
      await prisma.job.create({ data: job });
    }
  }

  // Create a sample application
  const firstJob = await prisma.job.findFirst({ where: { status: "APPROVED" } });
  if (firstJob) {
    await prisma.application.upsert({
      where: { userId_jobId: { userId: user1.id, jobId: firstJob.id } },
      update: {},
      create: { userId: user1.id, jobId: firstJob.id, status: "PENDING", message: "Би энэ ажлын байранд ихэд сонирхож байна. Ажиллаж туршлагатай бөгөөд шаардлагыг хангаж чадна." },
    });
  }

  console.log("✅ Seeding complete!");
  console.log("Admin:     admin@ajilkorea.com / admin123");
  console.log("Employer:  samsung@recruit.com / employer123");
  console.log("Job seeker: bataa@gmail.com / user123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
