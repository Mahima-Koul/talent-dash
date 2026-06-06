import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON payload' }, { status: 400 })
  }

  // 1. Check required fields present
  const required = ['company', 'role', 'level', 'location', 'currency', 'experience_years', 'base_salary']
  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return NextResponse.json({ error: true, field, message: `${field} is required` }, { status: 400 })
    }
  }

  // 2. Check types are correct (including optional values if passed)
  const stringFields = ['company', 'role', 'level', 'location', 'currency']
  for (const field of stringFields) {
    if (typeof body[field] !== 'string') {
      return NextResponse.json({ error: true, field, message: `${field} must be a string` }, { status: 400 })
    }
  }
  if (typeof body.experience_years !== 'number') {
    return NextResponse.json({ error: true, field: 'experience_years', message: 'experience_years must be a number' }, { status: 400 })
  }
  if (typeof body.base_salary !== 'number') {
    return NextResponse.json({ error: true, field: 'base_salary', message: 'base_salary must be a number' }, { status: 400 })
  }
  if (body.confidence_score !== undefined && typeof body.confidence_score !== 'number') {
    return NextResponse.json({ error: true, field: 'confidence_score', message: 'confidence_score must be a number' }, { status: 400 })
  }
  
  // Hardening optional inputs against bad payloads
  if (body.bonus !== undefined && body.bonus !== null && typeof body.bonus !== 'number') {
    return NextResponse.json({ error: true, field: 'bonus', message: 'bonus must be a number' }, { status: 400 })
  }
  if (body.stock !== undefined && body.stock !== null && typeof body.stock !== 'number') {
    return NextResponse.json({ error: true, field: 'stock', message: 'stock must be a number' }, { status: 400 })
  }

  // 3. Check level is valid enum value
  const validLevels = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5']
  if (!validLevels.includes(body.level)) {
    return NextResponse.json({ error: true, field: 'level', message: `Level must be one of: ${validLevels.join(', ')}` }, { status: 400 })
  }

  // 4. Check experience_years > 0 and < 51
  if (body.experience_years <= 0 || body.experience_years > 50) {
    return NextResponse.json({ error: true, field: 'experience_years', message: 'experience_years must be between 1 and 50' }, { status: 400 })
  }

  // 5. Check base_salary > 0
  if (body.base_salary <= 0) {
    return NextResponse.json({ error: true, field: 'base_salary', message: 'base_salary must be greater than 0' }, { status: 400 })
  }

  // 6. Check confidence_score between 0.0 and 1.0
  const score = body.confidence_score ?? 0.8
  if (score < 0.0 || score > 1.0) {
    return NextResponse.json({ error: true, field: 'confidence_score', message: 'confidence_score must be between 0.0 and 1.0' }, { status: 400 })
  }

  // 7. Normalisation pipeline
  const normalized = body.company.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
  const slug = normalized.replace(/\s+/g, '-')

  const company = await prisma.company.upsert({
    where: { slug },
    update: {},
    create: { name: body.company.trim(), slug, normalized_name: normalized },
  })

  // 8. Recompute total_compensation safely
  const bonus = body.bonus ?? 0
  const stock = body.stock ?? 0
  
  const baseSalaryBI = BigInt(Math.floor(body.base_salary))
  const bonusBI = BigInt(Math.floor(bonus))
  const stockBI = BigInt(Math.floor(stock))
  const total_compensation = baseSalaryBI + bonusBI + stockBI

  // 9. Duplicate check using optimized BigInt literals (10n)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const lowerBound = baseSalaryBI - (baseSalaryBI / BigInt(10))
  const upperBound = baseSalaryBI + (baseSalaryBI / BigInt(10))

  const duplicate = await prisma.salary.findFirst({
    where: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      base_salary: { gte: lowerBound, lte: upperBound },
      submitted_at: { gte: fortyEightHoursAgo },
    },
  })

  if (duplicate) {
    return NextResponse.json({ 
      error: true, 
      message: 'Duplicate record detected: A similar compensation profile was submitted within the last 48 hours.' 
    }, { status: 409 })
  }

  // 10. Persist Stored Record
  const salary = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      currency: body.currency,
      experience_years: body.experience_years,
      base_salary: baseSalaryBI,
      bonus: bonusBI,
      stock: stockBI,
      total_compensation,
      source: body.source ?? 'CONTRIBUTOR',
      confidence_score: score,
      is_verified: false,
    },
  })

  // Clean serialization output safely returning native JS numbers
  const sanitizedSalary = {
    ...salary,
    base_salary: Number(salary.base_salary),
    bonus: Number(salary.bonus),
    stock: Number(salary.stock),
    total_compensation: Number(salary.total_compensation),
  }

  return NextResponse.json(sanitizedSalary, { status: 201 })
}