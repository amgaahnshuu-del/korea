'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{session.user.name}</h2>
              <p className="text-blue-200 text-sm">{session.user.email}</p>
              <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                session.user.role === 'ADMIN'
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {session.user.role === 'ADMIN' ? '⚡ Admin' : '👤 Job Seeker'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Full Name</label>
            <p className="text-gray-900 font-medium mt-0.5">{session.user.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Email</label>
            <p className="text-gray-900 font-medium mt-0.5">{session.user.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Account Type</label>
            <p className="text-gray-900 font-medium mt-0.5">{session.user.role === 'ADMIN' ? 'Administrator' : 'Job Seeker'}</p>
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-applications"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            My Applications
          </Link>
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex-1 text-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/jobs"
            className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
