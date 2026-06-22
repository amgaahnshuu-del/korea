'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
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

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs?activeOnly=false')
    const data = await res.json()
    setJobs(data.jobs || [])
    setLoading(false)
  }

  useEffect(() => { fetchJobs() }, [])

  const toggleActive = async (id: string, current: boolean) => {
    const job = jobs.find((j) => j.id === id)
    if (!job) return
    await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...job, active: !current }),
    })
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, active: !current } : j))
  }

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    setDeleting(id)
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    setJobs((prev) => prev.filter((j) => j.id !== id))
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl mb-3" />)}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} total job listings</p>
        </div>
        <Link href="/admin/jobs/create" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
          + Post New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">💼</div>
            <p>No jobs posted yet.</p>
            <Link href="/admin/jobs/create" className="mt-3 inline-block text-blue-600 font-medium">Post your first job →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Job</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Apps</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-gray-500 text-xs">{job.company}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{job.location}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{typeLabels[job.type] || job.type}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{job._count?.applications || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(job.id, job.active)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          job.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {job.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteJob(job.id)}
                          disabled={deleting === job.id}
                          className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleting === job.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
