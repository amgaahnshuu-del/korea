'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ApplicationModal from '@/components/ApplicationModal'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string | null
  type: string
  description: string
  active: boolean
  createdAt: string
  _count?: { applications: number }
}

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-green-100 text-green-700',
  PART_TIME: 'bg-yellow-100 text-yellow-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  INTERNSHIP: 'bg-blue-100 text-blue-700',
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setJob(data.job)
        setLoading(false)
      })
  }, [params.id])

  const handleApply = () => {
    if (!session) {
      router.push('/login')
      return
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    const res = await fetch('/api/saved-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job?.id }),
    })
    const data = await res.json()
    setSaved(data.saved)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-3 bg-gray-200 rounded" />)}
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-4">This job posting may have been removed.</p>
        <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">← Back to Jobs</Link>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{job.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-blue-600 font-semibold text-lg">{job.company}</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ${typeColors[job.type] || 'bg-gray-100 text-gray-700'}`}>
                  {typeLabels[job.type] || job.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <span>📍</span> {job.location}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <span>💰</span> {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span>📅</span> Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {job.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Job Type</span>
                  <span className="font-medium">{typeLabels[job.type] || job.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-right">{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Salary</span>
                    <span className="font-medium text-green-600">{job.salary}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Applications</span>
                  <span className="font-medium">{job._count?.applications || 0}</span>
                </div>
              </div>

              {applied ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium">
                  ✅ Application Submitted!
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={!job.active}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors mb-3"
                >
                  {job.active ? 'Apply Now' : 'Position Closed'}
                </button>
              )}

              <button
                onClick={handleSave}
                className={`w-full border font-medium py-2.5 rounded-xl transition-colors text-sm ${
                  saved
                    ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {saved ? '★ Saved' : '☆ Save Job'}
              </button>

              <Link href="/jobs" className="block text-center mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                ← Back to all jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ApplicationModal
          jobId={job.id}
          jobTitle={job.title}
          company={job.company}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setApplied(true) }}
        />
      )}
    </>
  )
}
