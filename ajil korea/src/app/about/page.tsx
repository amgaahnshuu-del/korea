import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🇲🇳 → 🇰🇷</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Ajil Korea</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connecting Mongolian job seekers with life-changing opportunities in South Korea and beyond.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Ajil Korea was founded with a simple but powerful mission: to make it easier for Mongolian citizens
          to find legitimate employment opportunities in South Korea and other countries.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We believe that every Mongolian deserves access to fair employment opportunities abroad.
          Our platform provides a trusted, transparent, and easy-to-use job board specifically designed
          for the Mongolian community.
        </p>
      </div>

      {/* What we do */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: '🔍',
            title: 'Job Discovery',
            desc: 'Browse hundreds of verified job listings from trusted employers in South Korea across multiple industries.',
          },
          {
            icon: '📋',
            title: 'Easy Applications',
            desc: 'Apply for jobs with a simple form. Just your phone number and basic information — no complicated process.',
          },
          {
            icon: '🤝',
            title: 'Direct Connection',
            desc: 'We connect you directly with employers. No middlemen, no hidden fees.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Industries */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Industries We Cover</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🏭', name: 'Manufacturing' },
            { icon: '🌾', name: 'Agriculture' },
            { icon: '🍜', name: 'Food Service' },
            { icon: '🏗️', name: 'Construction' },
            { icon: '💻', name: 'Technology' },
            { icon: '🛡️', name: 'Security' },
            { icon: '🧹', name: 'Cleaning' },
            { icon: '🚢', name: 'Fisheries' },
          ].map((ind) => (
            <div key={ind.name} className="bg-white border border-gray-100 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">{ind.icon}</div>
              <p className="text-sm font-medium text-gray-700">{ind.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mongolian text section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-xl font-bold mb-3">Монгол хэлээр / In Mongolian</h2>
        <p className="text-blue-100 leading-relaxed">
          Ажил Солонгос нь Монгол иргэдэд Өмнөд Солонгос болон бусад улс оронд ажлын байр олоход туслах
          онлайн платформ юм. Бид итгэмжлэгдсэн ажил олгогчдын зар оруулж, та бүхэнд шуурхай,
          хялбар хайлт хийх боломжийг олгодог.
        </p>
        <p className="text-blue-200 text-sm mt-3">
          Бүртгүүлэх нь үнэ төлбөргүй. Өнөөдөр ажлаа хайж эхэл!
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Job?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Browse Jobs
          </Link>
          <Link href="/register" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
