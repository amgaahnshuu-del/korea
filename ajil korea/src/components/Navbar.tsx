'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700">Ajil</span>
            <span className="text-2xl font-bold text-red-600">Korea</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium hidden sm:block">
              🇲🇳→🇰🇷
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              Home
            </Link>
            <Link href="/jobs" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              Jobs
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{session.user.name}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/my-applications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false) }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/jobs" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>Jobs</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>Contact</Link>
              <hr className="border-gray-200" />
              {session ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link href="/my-applications" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>My Applications</Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                    className="text-left text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-700 font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
