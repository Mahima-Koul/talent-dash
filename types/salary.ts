export type Level =
  | 'L3' | 'L4' | 'L5' | 'L6'
  | 'SDE_I' | 'SDE_II' | 'SDE_III'
  | 'STAFF' | 'PRINCIPAL' | 'IC4' | 'IC5'

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR'
export type Source = 'CONTRIBUTOR' | 'SCRAPED' | 'AI_INFERRED'

export interface SalaryRecord {
  id: string
  company: string
  company_slug: string
  role: string
  level: Level
  location: string
  currency: Currency
  experience_years: number
  base_salary: number
  bonus: number
  stock: number
  total_compensation: number
  source: Source
  confidence_score: number
  is_verified: boolean
  submitted_at: string
}

export interface CompanyRecord {
  name: string
  slug: string
  industry?: string
  headquarters?: string
  founded_year?: number
  headcount_range?: string
  median_total_compensation: number
  level_distribution: Partial<Record<Level, number>>
  salaries: SalaryRecord[]
}

export interface SalaryFilters {
  company?: string
  role?: string
  level?: Level
  location?: string
  currency?: Currency
  sort?: 'total_comp_desc' | 'total_comp_asc' | 'date_desc'
  page?: number
  limit?: number
}