import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
// 1. Import the generated model type to solve the explicit 'any' issue
import type { Salary } from '@prisma/client'

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 2. Fetch company and nested collections cleanly
  const company = await prisma.company.findUnique({
    where: { slug: slug },
    include: { 
      salaries: { 
        orderBy: { total_compensation: 'desc' } 
      } 
    },
  })

  if (!company) {
    return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 })
  }

  // 3. Bind the 's' parameter directly to the generated Salary type
  const sanitizedSalaries = company.salaries.map((s: Salary) => ({
    ...s,
    base_salary: Number(s.base_salary),
    bonus: Number(s.bonus),
    stock: Number(s.stock),
    total_compensation: Number(s.total_compensation),
  }))

  // 4. Calculate metrics on sanitized values safely
  const tcs = sanitizedSalaries.map((s) => s.total_compensation).sort((a, b) => a - b)
  
  let median = 0
  if (tcs.length > 0) {
    const mid = Math.floor(tcs.length / 2)
    median = tcs.length % 2 !== 0 
      ? tcs[mid]! 
      : Math.round(((tcs[mid - 1] ?? 0) + (tcs[mid] ?? 0)) / 2)
  }

  // 5. Build distribution maps without structural loss
  const level_distribution = sanitizedSalaries.reduce<Record<string, number>>((acc, s) => {
    acc[s.level] = (acc[s.level] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    id: company.id,
    name: company.name,
    slug: company.slug,
    normalized_name: company.normalized_name,
    salaries: sanitizedSalaries,
    median_total_compensation: median,
    level_distribution
  })
}