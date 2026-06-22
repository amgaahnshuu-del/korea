import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [totalJobs, activeJobs, totalUsers, totalApps, recentApps] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.application.count(),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        job: { select: { title: true, company: true } },
      },
    }),
  ])
  return { totalJobs, activeJobs, totalUsers, totalApps, recentApps }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const { totalJobs, activeJobs, totalUsers, totalApps, recentApps } = await getStats()

  const stats = [
    { label: 'Total Jobs', value: totalJobs, sub: `${activeJobs} active`, icon: '💼', color: 'bg-blue-500', href: '/admin/jobs' },
    { label: 'Total Users', value: totalUsers, sub: 'registered users', icon: '👥', color: 'bg-green-500', href: '/admin/users' },
    { label: 'Applications', value: totalApps, sub: 'total submissions', icon: '📋', color: 'bg-purple-500', href: '/admin/applications' },
    { label: 'Active Jobs', value: activeJobs, sub: 'currently open', icon: '✅', color: 'bg-orange-500', href: '/admin/jobs' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`w-2 h-2 rounded-full ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/jobs/create"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 text-center font-medium transition-colors"
        >
          <div className="text-3xl mb-2">➕</div>
          Post New Job
        </Link>
        <Link
          href="/admin/applications"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-5 text-center font-medium transition-colors"
        >
          <div className="text-3xl mb-2">📋</div>
          View Applications
        </Link>
        <Link
          href="/admin/users"
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-5 text-center font-medium transition-colors"
        >
          <div className="text-3xl mb-2">👥</div>
          Manage Users
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Applications</h2>
          <Link href="/admin/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentApps.map((app) => (
              <div key={app.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{app.user.name}</p>
                  <p className="text-gray-500 text-xs">Applied for: {app.job.title} at {app.job.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
