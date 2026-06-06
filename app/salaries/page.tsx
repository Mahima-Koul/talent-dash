import type { Metadata } from 'next'
import { mockSalaries, COMPANIES, LOCATIONS, ROLES } from '@/lib/mock-data'
import { SalaryTable } from '@/components/features/SalaryTable'
import { FilterBar } from '@/components/features/FilterBar'
import { Pagination } from '@/components/ui/Pagination'
import type { Level, SalaryRecord } from '@/types/salary'
import { SortSelect } from '@/components/features/SortSelect'

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

  // Filter Pipeline Engine
  let records: SalaryRecord[] = mockSalaries.filter(r => {
    if (company  && !r.company.toLowerCase().includes(company.toLowerCase()))   return false
    if (role     && !r.role.toLowerCase().includes(role.toLowerCase()))          return false
    if (location && r.location.toLowerCase() !== location.toLowerCase())         return false
    if (activeLevels.length && !activeLevels.includes(r.level))                  return false
    return true
  })

  // Sort Pipeline Engine
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

      {/* Main Framework Container */}
      <div className="min-h-screen bg-[#FAFAFA] selection:bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header & Meta Metric Badging Array */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#EBEBEB]">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-[#F2F2F2] text-[#555555]">
                ● Real-Time Database
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: '#222222' }}>
                Salary Explorer
              </h1>
              <p className="mt-2 text-base max-w-xl font-medium" style={{ color: '#717171' }}>
                Analyze {total.toLocaleString()} verified compensation packages mapped from cross-border technology firms.
              </p>
            </div>
            
            {/* Quick Context Summary Badges */}
            <div className="flex items-center gap-3 text-xs font-mono">
              {(company || role || location || activeLevels.length > 0) && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EBEBEB] bg-white text-[#717171]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Filtered Matrix
                </div>
              )}
              <div className="px-3 py-1.5 rounded-md border border-[#EBEBEB] bg-white text-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                PAGE <span className="font-bold">{page}</span> OF {totalPages}
              </div>
            </div>
          </div>

          {/* Core Content Grid Panel */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Sidebar Sticky Panel Box */}
            <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-8 bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F2F2F2]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#222222]">Filters</h2>
                {(company || role || location || activeLevels.length > 0) && (
                  <a href="?" className="text-[11px] font-medium text-amber-700 hover:underline transition-all">
                    Reset All
                  </a>
                )}
              </div>
              <FilterBar
                companies={COMPANIES}
                roles={ROLES}
                locations={LOCATIONS}
              />
            </aside>

            {/* Core Records Feed Architecture */}
            <div className="flex-1 min-w-0 w-full rounded-2xl border bg-white shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all" style={{ borderColor: '#EBEBEB' }}>
              
              {/* Refined Sort / Utility Top Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b gap-3" style={{ borderColor: '#EBEBEB', background: '#FCFCFC' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight" style={{ color: '#222222' }}>
                    Dataset Registry
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold font-mono rounded-md bg-[#222222] text-white">
                    {total.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-medium tracking-tight" style={{ color: '#717171' }}>
                    Sequence Engine:
                  </span>
                  <div className="relative min-w-[160px] rounded-lg overflow-hidden border border-[#EBEBEB] bg-white shadow-sm hover:border-[#CCCCCC] transition-all">
                    <SortSelect current={sort} />
                  </div>
                </div>
              </div>

              {/* Functional Interactive Table Wrapper */}
              <div className="overflow-x-auto">
                <SalaryTable records={paginated} displayCurrency={currency} />
              </div>

              {/* Pagination Section */}
              {total > PAGE_SIZE && (
                <div className="px-5 py-5 border-t bg-[#FCFCFC]" style={{ borderColor: '#EBEBEB' }}>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={PAGE_SIZE}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}