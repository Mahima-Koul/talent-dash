import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // 1. Await the async params
  const { slug } = await params;

  // 2. Query the database
  const company = await prisma.company.findUnique({
    where: { slug: slug },
    include: { salaries: { orderBy: { total_compensation: 'desc' } } },
  })

  if (!company) {
    return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 })
  }

  // 3. Prevent serialization crashes by converting BigInt items to Numbers
  const sanitizedSalaries = company.salaries.map((s) => ({
    ...s,
    base_salary: Number(s.base_salary),
    bonus: Number(s.bonus),
    stock: Number(s.stock),
    total_compensation: Number(s.total_compensation),
  }))

  // 4. Compute metrics using our safe number-based array
  const tcs = sanitizedSalaries.map((s) => s.total_compensation).sort((a, b) => a - b)
  const mid = Math.floor(tcs.length / 2)
  const median = tcs.length % 2 !== 0 ? tcs[mid] : Math.round(((tcs[mid - 1] ?? 0) + (tcs[mid] ?? 0)) / 2)

  // 5. Aggregate level distribution
  const level_distribution = sanitizedSalaries.reduce<Record<string, number>>((acc, s) => {
    acc[s.level] = (acc[s.level] ?? 0) + 1
    return acc
  }, {})

  // 6. Safe runtime return payload
  return NextResponse.json({
    id: company.id,
    name: company.name,
    slug: company.slug,
    normalized_name: company.normalized_name,
    salaries: sanitizedSalaries, // Clean mapping replaces raw database objects
    median_total_compensation: median,
    level_distribution
  })
}