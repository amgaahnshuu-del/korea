import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    let applications

    if (session.user.role === 'ADMIN') {
      applications = await prisma.application.findMany({
        where: jobId ? { jobId } : {},
        include: {
          user: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Please login to apply' }, { status: 401 })
    }

    const body = await req.json()
    const { jobId, phone, email, resume, message } = body

    if (!jobId || !phone) {
      return NextResponse.json({ error: 'Job ID and phone number are required' }, { status: 400 })
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job || !job.active) {
      return NextResponse.json({ error: 'Job not found or no longer active' }, { status: 404 })
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId,
        phone,
        email: email || null,
        resume: resume || null,
        message: message || null,
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
