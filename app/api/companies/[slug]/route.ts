import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: { salaries: { orderBy: { total_compensation: 'desc' } } },
  })

  if (!company) {
    return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 })
  }

  const tcs = company.salaries.map((s) => Number(s.total_compensation)).sort((a, b) => a - b)
  const mid = Math.floor(tcs.length / 2)
  const median = tcs.length % 2 !== 0 ? tcs[mid] : Math.round(((tcs[mid - 1] ?? 0) + (tcs[mid] ?? 0)) / 2)

  const level_distribution = company.salaries.reduce<Record<string, number>>((acc, s) => {
    acc[s.level] = (acc[s.level] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({ ...company, median_total_compensation: median, level_distribution })
}