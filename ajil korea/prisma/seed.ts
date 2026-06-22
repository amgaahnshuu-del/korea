import { PrismaClient, JobType, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ajilkorea.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ajilkorea.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'bataa@gmail.com' },
    update: {},
    create: {
      name: 'Bataa Gantulga',
      email: 'bataa@gmail.com',
      password: userPassword,
      role: Role.USER,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'saran@gmail.com' },
    update: {},
    create: {
      name: 'Saran Enkhjargal',
      email: 'saran@gmail.com',
      password: userPassword,
      role: Role.USER,
    },
  })

  // Create job listings
  const jobs = [
    {
      title: 'Factory Production Worker',
      company: 'Samsung Electronics',
      location: 'Suwon, South Korea',
      description: `We are looking for dedicated production workers to join our manufacturing team at Samsung Electronics in Suwon, South Korea.

Responsibilities:
- Operate and monitor production equipment
- Perform quality control checks on electronic components
- Follow safety protocols and maintain clean work environment
- Work in rotating shifts (morning/afternoon/night)
- Collaborate with team members to meet production targets

Requirements:
- No Korean language required (basic Korean preferred)
- Ability to work in a fast-paced environment
- Physical fitness required (standing for long hours)
- EPS-TOPIK certificate required for visa
- Must have valid E-9 visa or be eligible

Benefits:
- Free accommodation provided
- Free meals at company cafeteria
- Health insurance covered by company
- Monthly bonus based on performance
- Return flight ticket after contract completion`,
      salary: '₩2,200,000 - ₩2,800,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Korean Restaurant Kitchen Staff',
      company: 'Arirang Restaurant Group',
      location: 'Seoul, South Korea',
      description: `Arirang Restaurant Group is hiring experienced kitchen staff for our busy restaurant locations across Seoul.

Responsibilities:
- Food preparation and cooking
- Maintaining kitchen cleanliness and hygiene standards
- Inventory management
- Following food safety regulations

Requirements:
- 1+ years of kitchen experience
- Willingness to learn Korean cooking techniques
- Physical stamina for busy kitchen environment
- Team player attitude
- E-9 or H-2 visa holders preferred

Benefits:
- Competitive salary + tips
- Staff meals provided
- Friendly multicultural work environment`,
      salary: '₩2,000,000 - ₩2,500,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Agricultural Worker - Greenhouse',
      company: 'Korea Farm Co.',
      location: 'Chungnam, South Korea',
      description: `Korea Farm Co. is seeking hardworking agricultural workers for our greenhouse operations in Chungnam province.

Responsibilities:
- Planting, cultivating, and harvesting crops
- Operating farm machinery
- Maintaining greenhouse facilities
- Packaging and sorting produce

Requirements:
- Agricultural experience preferred
- Good physical condition
- Ability to work outdoors in various weather conditions
- EPS-TOPIK certificate required
- E-9 visa required

Benefits:
- Free accommodation in farm housing
- 3 meals per day provided
- Health insurance
- Overtime pay available`,
      salary: '₩1,900,000 - ₩2,300,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'IT Software Developer',
      company: 'MonTech Solutions',
      location: 'Ulaanbaatar, Mongolia',
      description: `MonTech Solutions, a leading tech company in Mongolia, is looking for a skilled software developer to join our growing team.

Responsibilities:
- Develop and maintain web applications using modern frameworks
- Collaborate with design and product teams
- Write clean, maintainable code
- Participate in code reviews
- Work on client projects across various industries

Requirements:
- 2+ years of software development experience
- Proficiency in JavaScript/TypeScript, React or Vue.js
- Knowledge of Node.js or Python
- Git version control experience
- Good communication skills in Mongolian and English

Benefits:
- Competitive salary in MNT
- Remote work options available
- Professional development budget
- Modern office in Ulaanbaatar city center`,
      salary: '₮3,000,000 - ₮5,000,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Construction Worker',
      company: 'Hyundai Engineering & Construction',
      location: 'Incheon, South Korea',
      description: `Hyundai Engineering & Construction is hiring skilled construction workers for major infrastructure projects in Incheon.

Responsibilities:
- General construction work including concrete, steel, and carpentry
- Operating construction equipment
- Following safety regulations on construction sites
- Working as part of a multinational team

Requirements:
- Construction experience preferred
- Physical fitness and ability to work at heights
- Safety certification preferred
- E-9 visa or eligible for EPS program
- Basic Korean language skills helpful

Benefits:
- Competitive wages with overtime opportunities
- Safety equipment provided
- Free transportation to/from work site
- Health insurance`,
      salary: '₩2,300,000 - ₩3,000,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Cleaning & Maintenance Staff',
      company: 'Seoul Grand Hotel',
      location: 'Seoul, South Korea',
      description: `Seoul Grand Hotel, a 5-star luxury hotel in central Seoul, is looking for dedicated cleaning and maintenance staff.

Responsibilities:
- Cleaning and maintaining guest rooms and public areas
- Laundering and changing bed linens
- Reporting maintenance issues
- Providing excellent guest service

Requirements:
- Attention to detail
- Physical stamina
- Reliable and punctual
- Basic Korean language is a plus
- H-2 or E-9 visa holders welcome

Benefits:
- Staff accommodation available
- Uniform and meals provided
- Training provided
- Career advancement opportunities`,
      salary: '₩1,800,000 - ₩2,200,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Welding Technician',
      company: 'POSCO Steel',
      location: 'Pohang, South Korea',
      description: `POSCO, one of the world's largest steel producers, is seeking qualified welding technicians for our facility in Pohang.

Responsibilities:
- Perform MIG, TIG, and arc welding operations
- Read and interpret technical drawings
- Inspect welds for quality and precision
- Maintain welding equipment
- Follow strict safety protocols

Requirements:
- Welding certification required
- 2+ years of welding experience
- Knowledge of different welding techniques
- Ability to work in industrial environment
- EPS-TOPIK certificate and E-9 visa required

Benefits:
- Premium pay for certified welders
- Housing allowance
- Safety equipment provided by company
- Overtime opportunities`,
      salary: '₩2,500,000 - ₩3,500,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Customer Service Representative (Remote)',
      company: 'GoGlobal Mongolia',
      location: 'Remote / Mongolia',
      description: `GoGlobal Mongolia is expanding and looking for customer service representatives to work remotely from anywhere in Mongolia.

Responsibilities:
- Handle customer inquiries via phone, email, and chat
- Resolve customer complaints professionally
- Maintain customer records in CRM system
- Collaborate with team to improve service quality

Requirements:
- Excellent communication skills in Mongolian
- English language proficiency preferred
- Computer literacy
- Customer service experience a plus
- Reliable internet connection

Benefits:
- Work from home flexibility
- Competitive salary
- Health insurance
- Professional development opportunities`,
      salary: '₮1,500,000 - ₮2,500,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Seafood Processing Worker',
      company: 'Busan Fisheries Co.',
      location: 'Busan, South Korea',
      description: `Busan Fisheries Co. is one of Korea's largest seafood processing companies. We are hiring workers for our modern processing facility in Busan.

Responsibilities:
- Processing and packaging seafood products
- Quality control and grading of products
- Operating processing machinery
- Maintaining hygiene and food safety standards
- Working in cold storage environments

Requirements:
- Ability to work in cold temperatures (-5°C to 5°C)
- Physical fitness
- EPS-TOPIK certificate required
- E-9 visa required
- Food handling experience preferred

Benefits:
- Special cold environment allowance
- Warm clothing provided
- Free meals
- Free accommodation`,
      salary: '₩2,100,000 - ₩2,600,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Part-time Convenience Store Staff',
      company: 'CU Convenience Store',
      location: 'Gyeonggi, South Korea',
      description: `CU, Korea's largest convenience store chain, is hiring part-time staff for multiple locations in Gyeonggi province.

Responsibilities:
- Assisting customers and operating cash register
- Stocking shelves and organizing products
- Preparing fresh food items
- Maintaining store cleanliness

Requirements:
- Basic Korean language skills required
- Friendly and customer-oriented personality
- Ability to work various shifts (morning/evening/night)
- H-2 visa or F-4 visa holders welcome

Benefits:
- Flexible hours
- Employee discount on store products
- Training provided`,
      salary: '₩9,860/hour (minimum wage +)',
      type: JobType.PART_TIME,
    },
    {
      title: 'Graphic Designer',
      company: 'Creative UB Studio',
      location: 'Ulaanbaatar, Mongolia',
      description: `Creative UB Studio, a leading design agency in Mongolia, is looking for a talented graphic designer to join our creative team.

Responsibilities:
- Create visual concepts for branding, marketing materials, and digital content
- Design logos, brochures, social media graphics, and web assets
- Collaborate with clients to understand their design needs
- Present design concepts and incorporate feedback
- Stay updated with design trends

Requirements:
- Portfolio demonstrating design skills
- Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign)
- 1+ years of design experience
- Good communication skills
- Knowledge of UI/UX principles a plus

Benefits:
- Creative work environment
- Flexible working hours
- Portfolio-building opportunities`,
      salary: '₮2,000,000 - ₮3,500,000/month',
      type: JobType.FULL_TIME,
    },
    {
      title: 'Security Guard',
      company: 'Korea Security Services',
      location: 'Seoul, South Korea',
      description: `Korea Security Services is hiring security guards for various commercial and residential locations throughout Seoul.

Responsibilities:
- Monitor premises and patrol designated areas
- Check identification and control access
- Respond to security incidents
- Write incident reports
- Coordinate with emergency services when required

Requirements:
- Good physical condition
- Security certification preferred (training provided)
- Basic Korean language skills
- Reliable and professional demeanor
- H-2 visa holders welcome

Benefits:
- Uniform provided
- Regular working hours
- Possible accommodation assistance`,
      salary: '₩2,000,000 - ₩2,400,000/month',
      type: JobType.FULL_TIME,
    },
  ]

  for (const job of jobs) {
    await prisma.job.create({ data: job })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`\n📧 Admin: admin@ajilkorea.com / admin123`)
  console.log(`📧 User 1: bataa@gmail.com / user123`)
  console.log(`📧 User 2: saran@gmail.com / user123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
