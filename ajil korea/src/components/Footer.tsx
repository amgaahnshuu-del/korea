import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">Ajil</span>
              <span className="text-2xl font-bold text-red-400">Korea</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Монголчуудад Солонгос болон бусад улс оронд ажлын байр олоход туслах платформ.
              Connecting Mongolian job seekers with opportunities in South Korea and beyond.
            </p>
            <div className="flex gap-3 mt-4 text-xl">
              <span>🇲🇳</span>
              <span>→</span>
              <span>🇰🇷</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Job Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs?type=FULL_TIME" className="hover:text-white transition-colors">Full-time Jobs</Link></li>
              <li><Link href="/jobs?type=PART_TIME" className="hover:text-white transition-colors">Part-time Jobs</Link></li>
              <li><Link href="/jobs?type=CONTRACT" className="hover:text-white transition-colors">Contract Work</Link></li>
              <li><Link href="/jobs?location=South Korea" className="hover:text-white transition-colors">Jobs in Korea</Link></li>
              <li><Link href="/jobs?location=Mongolia" className="hover:text-white transition-colors">Jobs in Mongolia</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 Ajil Korea. All rights reserved.</p>
          <p>Made with ❤️ for Mongolian job seekers</p>
        </div>
      </div>
    </footer>
  )
}
