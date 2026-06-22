import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string | null
  type: string
  createdAt: string | Date
  _count?: { applications: number }
}

const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-green-100 text-green-700',
  PART_TIME: 'bg-yellow-100 text-yellow-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  INTERNSHIP: 'bg-blue-100 text-blue-700',
}

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

function timeAgo(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function getLocationFlag(location: string) {
  if (location.toLowerCase().includes('korea')) return '🇰🇷'
  if (location.toLowerCase().includes('mongolia') || location.toLowerCase().includes('ulaanbaatar')) return '🇲🇳'
  if (location.toLowerCase().includes('remote')) return '🌐'
  return '📍'
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 text-base leading-snug mb-1 truncate">
              {job.title}
            </h3>
          </Link>
          <p className="text-blue-600 font-medium text-sm">{job.company}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${typeColors[job.type] || 'bg-gray-100 text-gray-700'}`}>
          {typeLabels[job.type] || job.type}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          {getLocationFlag(job.location)} {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            💰 {job.salary}
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
        <Link
          href={`/jobs/${job.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
        >
          View & Apply
        </Link>
      </div>
    </div>
  )
}
