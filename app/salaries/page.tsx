import type { Metadata } from 'next'
import { mockSalaries, COMPANIES, LOCATIONS, ROLES } from '@/lib/mock-data'
import { SalaryTable } from '@/components/features/SalaryTable'
import { FilterBar } from '@/components/features/FilterBar'
import { Pagination } from '@/components/ui/Pagination'
import type { Level, SalaryRecord } from '@/types/salary'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Salary Explorer — All Roles, Levels & Companies',
  description: 'Browse verified salary data for software engineers, PMs, and data scientists across Amazon, Google, Flipkart and 50+ Indian tech companies.',
  alternates: { canonical: 'https://talentdash.com/salaries' },
  openGraph: {
    title: 'TalentDash Salary Explorer',
    description: 'Real compensation data for Indian tech professionals.',
    url: 'https://talentdash.com/salaries',
  },
}

const PAGE_SIZE = 25

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function SalariesPage({ searchParams }: Props) {
  const sp = await searchParams
  const company  = sp['company']  ?? ''
  const role     = sp['role']     ?? ''
  const location = sp['location'] ?? ''
  const currency = sp['currency'] ?? 'INR'
  const levelRaw = sp['level']    ?? ''
  const sort     = sp['sort']     ?? 'total_comp_desc'
  const page     = Math.max(1, parseInt(sp['page'] ?? '1'))

  const activeLevels = levelRaw ? levelRaw.split(',') as Level[] : []

  // Filter
  let records: SalaryRecord[] = mockSalaries.filter(r => {
    if (company  && !r.company.toLowerCase().includes(company.toLowerCase()))   return false
    if (role     && !r.role.toLowerCase().includes(role.toLowerCase()))          return false
    if (location && r.location.toLowerCase() !== location.toLowerCase())         return false
    if (activeLevels.length && !activeLevels.includes(r.level))                  return false
    return true
  })

  // Sort
  records = [...records].sort((a, b) => {
    if (sort === 'total_comp_asc')  return a.total_compensation - b.total_compensation
    if (sort === 'date_desc')       return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    return b.total_compensation - a.total_compensation
  })

  const total      = records.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paginated  = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash Salary Database',
    description: 'Structured salary records for Indian tech professionals across all roles and levels.',
    url: 'https://talentdash.com/salaries',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#222222' }}>
            Salary Explorer
          </h1>
          <p className="text-sm" style={{ color: '#717171' }}>
            {total.toLocaleString()} verified compensation records across India's top tech companies
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar filters */}
          <aside className="w-56 flex-shrink-0 sticky top-6">
            <FilterBar
              companies={COMPANIES}
              roles={ROLES}
              locations={LOCATIONS}
            />
          </aside>

          {/* Table */}
          <div className="flex-1 min-w-0 rounded-xl border overflow-hidden" style={{ borderColor: '#EBEBEB', background: '#fff' }}>
            {/* Sort bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EBEBEB', background: '#F7F7F7' }}>
              <p className="text-xs font-medium" style={{ color: '#717171' }}>
                {total.toLocaleString()} results
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: '#717171' }}>Sort:</label>
                  <option value="total_comp_desc">Total Comp ↓</option>
                  <option value="total_comp_asc">Total Comp ↑</option>
                  <option value="date_desc">Most Recent</option>
              </div>
            </div>

            <SalaryTable records={paginated} displayCurrency={currency} />

            {total > PAGE_SIZE && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={PAGE_SIZE}
                onPage={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}