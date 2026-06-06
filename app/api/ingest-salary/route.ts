import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // 1. Required field checks
  const required = ['company', 'role', 'level', 'location', 'currency', 'experience_years', 'base_salary']
  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return NextResponse.json({ error: true, field, message: `${field} is required` }, { status: 400 })
    }
  }

  // 2. Enum validation
  const validLevels = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5']
  if (!validLevels.includes(body.level)) {
    return NextResponse.json({ error: true, field: 'level', message: `Level must be one of: ${validLevels.join(', ')}` }, { status: 400 })
  }

  // 3. Range checks
  if (body.experience_years <= 0 || body.experience_years > 50) {
    return NextResponse.json({ error: true, field: 'experience_years', message: 'experience_years must be between 1 and 50' }, { status: 400 })
  }
  if (body.base_salary <= 0) {
    return NextResponse.json({ error: true, field: 'base_salary', message: 'base_salary must be greater than 0' }, { status: 400 })
  }

  // 4. Normalise company name
  const normalized = body.company.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
  const slug = normalized.replace(/\s+/g, '-')

  // 5. Find or create company
  const company = await prisma.company.upsert({
    where: { slug },
    update: {},
    create: { name: body.company.trim(), slug, normalized_name: normalized },
  })

  // 6. ALWAYS recompute total_compensation server-side
  const bonus = body.bonus ?? 0
  const stock = body.stock ?? 0
  const total_compensation = BigInt(body.base_salary) + BigInt(bonus) + BigInt(stock)

  // 7. Duplicate check — same company+role+level+location, base within 10%, last 48h
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const lower = body.base_salary * 0.9
  const upper = body.base_salary * 1.1
  const duplicate = await prisma.salary.findFirst({
    where: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      base_salary: { gte: lower, lte: upper },
      submitted_at: { gte: fortyEightHoursAgo },
    },
  })
  if (duplicate) {
    return NextResponse.json({ error: true, message: 'Duplicate record detected within 48 hours' }, { status: 409 })
  }

  // 8. Store
  const salary = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      currency: body.currency,
      experience_years: body.experience_years,
      base_salary: BigInt(body.base_salary),
      bonus: BigInt(bonus),
      stock: BigInt(stock),
      total_compensation,
      source: body.source ?? 'CONTRIBUTOR',
      confidence_score: body.confidence_score ?? 0.8,
      is_verified: false,
    },
  })

  return NextResponse.json(salary, { status: 201 })
}