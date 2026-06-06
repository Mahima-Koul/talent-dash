import { NextRequest, NextResponse } from 'next/server'
import prisma  from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
  const skip = (page - 1) * limit

  const where: any = {}
  if (searchParams.get('level')) where.level = searchParams.get('level')
  if (searchParams.get('location')) where.location = { contains: searchParams.get('location'), mode: 'insensitive' }
  if (searchParams.get('company')) where.company = { is: { normalized_name: { contains: searchParams.get('company')!.toLowerCase(), mode: 'insensitive' } } }
  if (searchParams.get('role')) where.role = { contains: searchParams.get('role'), mode: 'insensitive' }

  const sortField = searchParams.get('sort')
  const orderBy: any =
    sortField === 'total_comp_asc' ? { total_compensation: 'asc' }
    : sortField === 'date_desc' ? { submitted_at: 'desc' }
    : { total_compensation: 'desc' }

  const [data, total] = await Promise.all([
    prisma.salary.findMany({ where, orderBy, skip, take: limit, include: { company: true } }),
    prisma.salary.count({ where }),
  ])

  return NextResponse.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}