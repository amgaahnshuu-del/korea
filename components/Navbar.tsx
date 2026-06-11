"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-blue-800 font-bold text-xl">
              Ajil Korea
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/jobs" className="hover:text-blue-700">Ажлын зар</Link>
              <Link href="/about" className="hover:text-blue-700">Бидний тухай</Link>
              <Link href="/contact" className="hover:text-blue-700">Холбоо барих</Link>
            </div>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-700"
                >
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Админ самбар
                      </Link>
                    )}
                    {user.role === "EMPLOYER" && (
                      <Link href="/recruiter" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Ажил олгогчийн портал
                      </Link>
                    )}
                    {user.role === "USER" && (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Хяналтын самбар
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Гарах
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-700 px-4 py-2">
                  Нэвтрэх
                </Link>
                <Link href="/jobs/post" className="text-sm font-medium bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                  Зар нийтлэх
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link href="/jobs" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
            Ажлын зар
          </Link>
          <Link href="/about" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
            Бидний тухай
          </Link>
          <Link href="/contact" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
            Холбоо барих
          </Link>
          <div className="border-t border-gray-100 pt-2">
            {user ? (
              <>
                <p className="px-1 py-1.5 text-xs text-gray-400">{user.name} · {user.role}</p>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
                    Админ самбар
                  </Link>
                )}
                {user.role === "EMPLOYER" && (
                  <Link href="/recruiter" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
                    Ажил олгогчийн портал
                  </Link>
                )}
                {user.role === "USER" && (
                  <Link href="/dashboard" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
                    Хяналтын самбар
                  </Link>
                )}
                <button onClick={logout} className="block w-full text-left py-2.5 text-sm font-medium text-red-600">
                  Гарах
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700" onClick={() => setMobileOpen(false)}>
                  Нэвтрэх
                </Link>
                <Link href="/jobs/post" className="block py-2.5 text-sm font-medium text-blue-700" onClick={() => setMobileOpen(false)}>
                  Зар нийтлэх
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
