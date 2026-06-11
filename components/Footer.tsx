import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Ajil Korea</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connecting the Mongolian community with professional growth and stable livelihoods in South Korea.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition text-xs">f</a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sky-500 transition text-xs">t</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-white transition">Find Jobs</Link></li>
              <li><Link href="#" className="hover:text-white transition">Visa Support</Link></li>
              <li><Link href="#" className="hover:text-white transition">Resume Builder</Link></li>
              <li><Link href="/about" className="hover:text-white transition">Career Advice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs/post" className="hover:text-white transition">Post a Job</Link></li>
              <li><Link href="#" className="hover:text-white transition">Talent Search</Link></li>
              <li><Link href="#" className="hover:text-white transition">Enterprise Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2024 MongolJob (Ajil Korea). All rights reserved. Supporting the Mongolian Diaspora in Korea.</p>
          <span>English</span>
        </div>
      </div>
    </footer>
  );
}
