import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const s1 = req.nextUrl.searchParams.get('s1')
  const s2 = req.nextUrl.searchParams.get('s2')

  if (!s1 || !s2) return NextResponse.json({ error: true, message: 's1 and s2 are required' }, { status: 400 })
  if (s1 === s2) return NextResponse.json({ error: true, message: 'IDs must be different' }, { status: 400 })

  const [r1, r2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
    prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
  ])

  if (!r1 || !r2) return NextResponse.json({ error: true, message: 'One or both records not found' }, { status: 404 })

  const n = (v: bigint) => Number(v)
  const delta = {
    base_delta: n(r1.base_salary) - n(r2.base_salary),
    bonus_delta: n(r1.bonus) - n(r2.bonus),
    stock_delta: n(r1.stock) - n(r2.stock),
    tc_delta: n(r1.total_compensation) - n(r2.total_compensation),
    experience_delta: r1.experience_years - r2.experience_years,
  }

  return NextResponse.json({ record1: r1, record2: r2, delta })
}