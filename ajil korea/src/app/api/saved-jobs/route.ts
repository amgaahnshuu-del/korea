import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: session.user.id },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ savedJobs })
  } catch (error) {
    console.error('Get saved jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await req.json()
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    })

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false })
    }

    await prisma.savedJob.create({
      data: { userId: session.user.id, jobId },
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Toggle saved job error:', error)
    return NextResponse.json({ error: 'Failed to toggle saved job' }, { status: 500 })
  }
}
