import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const where: Record<string, unknown> = {}
    if (activeOnly) where.active = true
    if (location && location !== 'all') where.location = { contains: location, mode: 'insensitive' }
    if (type && type !== 'all') where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { title, company, location, description, salary, type } = body

    if (!title || !company || !location || !description || !type) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: { title, company, location, description, salary, type, active: true },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
