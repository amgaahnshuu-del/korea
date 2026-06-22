'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/jobs', label: 'Manage Jobs', icon: '💼' },
  { href: '/admin/jobs/create', label: 'Post a Job', icon: '➕' },
  { href: '/admin/applications', label: 'Applications', icon: '📋' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
      <div className="p-6 border-b border-gray-800">
        <div className="text-lg font-bold text-white">Admin Panel</div>
        <div className="text-gray-400 text-sm mt-0.5">Ajil Korea</div>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <hr className="border-gray-800 my-2" />
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🏠</span>
          Back to Site
        </Link>
      </nav>
    </aside>
  )
}
