'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Application {
  id: string
  phone: string
  email?: string | null
  message?: string | null
  createdAt: string
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
  }
}

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

export default function MyApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/applications')
        .then((r) => r.json())
        .then((data) => {
          setApplications(data.applications || [])
          setLoading(false)
        })
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 mb-4 border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <Link href="/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Browse More Jobs →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-6">Start applying for jobs to see them here.</p>
          <Link href="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <Link href={`/jobs/${app.job.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {app.job.title}
                  </Link>
                  <p className="text-blue-600 text-sm font-medium">{app.job.company}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  Applied
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                <span>📍 {app.job.location}</span>
                <span>💼 {typeLabels[app.job.type] || app.job.type}</span>
                <span>📞 {app.phone}</span>
                <span>🕐 {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              {app.message && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-clamp-2">
                  {app.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
