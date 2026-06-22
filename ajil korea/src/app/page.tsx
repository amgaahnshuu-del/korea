import Link from 'next/link'
import prisma from '@/lib/prisma'
import JobCard from '@/components/JobCard'

async function getFeaturedJobs() {
  return prisma.job.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { _count: { select: { applications: true } } },
  })
}

async function getStats() {
  const [totalJobs, totalUsers, totalApps] = await Promise.all([
    prisma.job.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.application.count(),
  ])
  return { totalJobs, totalUsers, totalApps }
}

export default async function HomePage() {
  const [jobs, stats] = await Promise.all([getFeaturedJobs(), getStats()])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🇲🇳</div>
          <div className="absolute bottom-10 right-10 text-8xl">🇰🇷</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Your Dream Job
            <br />
            <span className="text-yellow-400">Awaits in Korea</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            Монгол хүмүүст зориулсан ажлын байрны платформ
          </p>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">
            The #1 job platform connecting Mongolian job seekers with opportunities in South Korea and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/register"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-colors backdrop-blur-sm"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 0L0 60Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalJobs}+</div>
            <div className="text-gray-500 text-sm mt-1">Active Jobs</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}+</div>
            <div className="text-gray-500 text-sm mt-1">Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalApps}+</div>
            <div className="text-gray-500 text-sm mt-1">Applications</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Job Openings</h2>
            <p className="text-gray-500 mt-1">Fresh opportunities posted recently</p>
          </div>
          <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View all →
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">💼</div>
            <p>No jobs posted yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Browse Jobs', desc: 'Search through hundreds of job listings in Korea and beyond. Filter by location, type, and salary.' },
              { step: '2', icon: '📝', title: 'Create Account', desc: 'Register for free. Create your profile and get ready to apply for jobs in minutes.' },
              { step: '3', icon: '🚀', title: 'Apply & Get Hired', desc: 'Submit your application with your phone number. Employers will contact you directly.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-red-600 to-blue-700 py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey? 🇰🇷</h2>
          <p className="text-white/80 mb-8">
            Join thousands of Mongolians who found their dream jobs through Ajil Korea.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  )
}
