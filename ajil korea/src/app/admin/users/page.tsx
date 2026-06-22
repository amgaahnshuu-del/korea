'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { applications: number }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This will also delete all their applications.`)) return
    setDeleting(id)
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setDeleting(null)
  }

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Change role to ${newRole}?`)) return
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">User</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Role</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Applications</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{user._count.applications}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.id !== session?.user.id && (
                        <>
                          <button
                            onClick={() => toggleRole(user.id, user.role)}
                            className="text-gray-500 hover:text-blue-600 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            {user.role === 'ADMIN' ? '→ User' : '→ Admin'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={deleting === user.id}
                            className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === user.id ? '...' : 'Delete'}
                          </button>
                        </>
                      )}
                      {user.id === session?.user.id && (
                        <span className="text-xs text-gray-400">You</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
