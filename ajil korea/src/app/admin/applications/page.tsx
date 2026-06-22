'use client'

import { useState, useEffect } from 'react'

interface Application {
  id: string
  phone: string
  email?: string | null
  message?: string | null
  resume?: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  job: { id: string; title: string; company: string }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchApplications = async () => {
    const res = await fetch('/api/applications')
    const data = await res.json()
    setApplications(data.applications || [])
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [])

  const deleteApp = async (id: string) => {
    if (!confirm('Delete this application?')) return
    setDeleting(id)
    await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    setApplications((prev) => prev.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl mb-3" />)}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{applications.length} total applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {applications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-3">📭</div>
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Applicant</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Job</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Phone</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Date</th>
                      <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === app.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelected(app)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{app.user.name}</p>
                          <p className="text-gray-400 text-xs">{app.user.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-gray-700">{app.job.title}</p>
                          <p className="text-gray-400 text-xs">{app.job.company}</p>
                        </td>
                        <td className="px-4 py-3 text-blue-600 font-medium">{app.phone}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteApp(app.id) }}
                            disabled={deleting === app.id}
                            className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === app.id ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-8">
              <h2 className="font-bold text-gray-900 mb-4">Application Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Applicant</p>
                  <p className="font-semibold text-gray-900">{selected.user.name}</p>
                  <p className="text-gray-500 text-sm">{selected.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
                  <p className="font-semibold text-blue-600 text-lg">{selected.phone}</p>
                </div>
                {selected.email && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                    <p className="text-gray-700">{selected.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Applied For</p>
                  <p className="font-medium text-gray-900">{selected.job.title}</p>
                  <p className="text-gray-500 text-sm">{selected.job.company}</p>
                </div>
                {selected.message && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Cover Message</p>
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 mt-1">{selected.message}</p>
                  </div>
                )}
                {selected.resume && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Resume</p>
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 mt-1 max-h-40 overflow-y-auto">{selected.resume}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Applied On</p>
                  <p className="text-gray-700">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full border border-gray-200 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm">Click an application to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
