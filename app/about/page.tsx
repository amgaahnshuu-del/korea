import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const TEAM = [
  { name: "Ariunbold T.", role: "CEO / CO-FOUNDER", bg: "bg-gray-200" },
  { name: "Mina Park", role: "Head of Operations, Seoul, Korea", bg: "bg-gray-300" },
  { name: "Gantulaar L.", role: "Legal Counselor", bg: "bg-gray-200" },
  { name: "Yalj Ohal", role: "Lead Engineer", bg: "bg-gray-300" },
];

const TIMELINE = [
  { year: "2015", title: "The Spark", desc: "Founded in Ulaanbaatar, an entrepreneur who experienced first-hand the struggles of finding stable employment overseas." },
  { year: "2018", title: "The Seoul Office", desc: "Opened our Seoul office to build direct relationships with South Korean employers, streamlining visa pathways." },
  { year: "2024", title: "Digital Transformation", desc: "Today, Ajil Korea is a fully digital platform, using advanced matchmaking tools to help candidates find jobs, fast and TOPIK-free." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-linear-to-br from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block bg-blue-600/40 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full mb-4">
              ABOUT US — SINCE 2015
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">
              Bridging the Gap Between <span className="text-yellow-300">Mongolian Talent</span> and Korean Employers.
            </h1>
            <p className="text-blue-100 text-sm mb-6">
              Ajil Korea is the premier digital ecosystem dedicated to simplifying international employment. We provide a transparent, high-integrity platform that empowers Mongolians job seekers to find meaningful careers in South Korea.
            </p>
            <div className="flex gap-4">
              <Link href="/jobs" className="bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
                View Our Jobs
              </Link>
              <a href="#team" className="border border-white text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition text-sm">
                Learn About Team
              </a>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-3 items-center">
            <div className="bg-blue-600/50 rounded-2xl p-5 text-center w-40">
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-xs text-blue-200">Placed This Year</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Integrity in Every Connection</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Our defining qualities in every business we conduct and every connection we facilitate for our customers.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Radical Transparency", desc: "We believe you deserve to know who is hiring and what to expect. Our verification system ensures every job listing, employer profile, and salary range is authentic." },
              { icon: "🌐", title: "Bilingual Support", desc: "Our team offers native Mongolian and Korean-speaking agents available to help you communicate and grow throughout your entire journey." },
              { icon: "🎯", title: "Skill Matching", desc: "We match you with roles that suit not only your skills but your long-term career ambitions. Our AI-powered system evaluates job requirements across Korea." },
            ].map((v) => (
              <div key={v.title} className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-blue-800 text-lg mb-2">The Ajil Promise</h3>
            <p className="text-sm text-blue-700">Every decision in our platform is 100% transparent and fair. Our application process is real-time, our employers are real, our listings are valid, and your success is always our focus.</p>
          </div>
        </div>
      </section>

      {/* Pre-Departure */}
      <section className="py-12 px-4 bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl mb-3">✈️</div>
          <h2 className="text-xl font-bold mb-2">Pre-Departure Training</h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto">Comprehensive orientation training before you make your flight. Learn South Korean workplace culture, safety requirements, and basic communication to hit the ground running.</p>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Journey from Ulaanbaatar to Seoul</h2>
          <p className="text-gray-500 text-sm mb-10">Over a decade of connecting people to opportunity.</p>
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-blue-200 mt-2"></div>}
                </div>
                <div className="pb-8">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Since {item.year}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">The Minds Behind the Bridge</h2>
              <p className="text-sm text-gray-500 mt-1">A dedicated team of expert agents, integration leaders, and engineers.</p>
            </div>
            <Link href="/register" className="text-sm font-semibold text-blue-600 hover:underline">Join the Team →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className={`w-24 h-24 ${member.bg} rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl`}>
                  👤
                </div>
                <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                <p className="text-xs text-gray-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-700 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to start your journey to Korea?</h2>
        <p className="text-blue-100 text-sm mb-6">Join thousands of Mongolian professionals who found their future through Ajil Korea.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/jobs" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition">
            Browse Jobs
          </Link>
          <Link href="/contact" className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-600 transition">
            Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
