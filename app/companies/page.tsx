import type { Metadata } from 'next'
import Link from 'next/link'
import { mockSalaries } from '@/lib/mock-data'
import type { SalaryRecord } from '@/types/salary'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tech Company Directory — Compensation Matrix',
  description: 'Explore verified compensation structures, level distributions, and data-dense metrics across top tech organizations.',
}

interface CompanyMetric {
  name: string
  slug: string
  recordCount: number
  maxCompensation: number
  minCompensation: number
  rolesArray: string[]
  locationTokens: string[]
}

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function CompaniesPage({ searchParams }: Props) {
  const sp = await searchParams
  const searchQuery = sp['search'] ?? ''

  // 1. Process data metrics group-by-company map
  const companyMap: Record<string, CompanyMetric> = {}

  mockSalaries.forEach((record: SalaryRecord) => {
    const slug = record.company_slug || record.company.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const cName = record.company

    if (!companyMap[slug]) {
      companyMap[slug] = {
        name: cName,
        slug: slug,
        recordCount: 0,
        maxCompensation: 0,
        minCompensation: Infinity,
        rolesArray: [],
        locationTokens: []
      }
    }

    const target = companyMap[slug]
    target.recordCount += 1
    
    if (record.total_compensation > target.maxCompensation) {
      target.maxCompensation = record.total_compensation
    }
    if (record.total_compensation < target.minCompensation) {
      target.minCompensation = record.total_compensation
    }
    
    if (!target.rolesArray.includes(record.role)) {
      target.rolesArray.push(record.role)
    }
    if (!target.locationTokens.includes(record.location)) {
      target.locationTokens.push(record.location)
    }
  })

  // 2. Map object to array and filter matching search parameters
  let structuralCompanies = Object.values(companyMap)
  if (searchQuery) {
    structuralCompanies = structuralCompanies.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 3. Sort companies cleanly by total records count
  structuralCompanies.sort((a, b) => b.recordCount - a.recordCount)

  // 4. Local Currency Formatting Engine for Mini Badges
  const formatCompactINR = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Editorial Premium Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#EBEBEB]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-[#F2F2F2] text-[#555555]">
              🏢 Enterprise Context Indices
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#222222]">
              Company Profiles
            </h1>
            <p className="mt-2 text-base max-w-xl font-medium text-[#717171]">
              Browse organizational data structures, compensation variance ranges, and deployment counts.
            </p>
          </div>

          {/* Inline Active Server Action Search Control Form */}
          <form method="GET" className="w-full md:w-80">
            <div className="relative rounded-xl border border-[#EBEBEB] bg-white shadow-sm hover:border-[#CCCCCC] focus-within:border-amber-700 transition-all overflow-hidden">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search market slug indexes..."
                className="w-full px-4 py-2.5 text-sm outline-none bg-transparent text-[#222222] placeholder-[#A0A0A0]"
              />
              {searchQuery && (
                <Link href="/companies" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-700 hover:underline">
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Dynamic Empty Grid Error Handling Boundary */}
        {structuralCompanies.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EBEBEB] rounded-2xl max-w-md mx-auto p-6">
            <p className="text-sm font-semibold text-[#222222] mb-1">No Market Listings Found</p>
            <p className="text-xs text-[#717171] mb-4">Your search token match patterns returned zero profile registry results.</p>
            <Link href="/companies" className="inline-flex text-xs font-semibold px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-neutral-800 transition-all">
              Reload Full Directory
            </Link>
          </div>
        ) : (
          /* Grid Array Framework Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {structuralCompanies.map((comp) => (
              <Link 
                key={comp.slug} 
                href={`/companies/${comp.slug}`}
                className="group relative flex flex-col justify-between bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.025)] hover:border-[#CCCCCC] transition-all duration-300"
              >
                <div>
                  {/* Top Header Card row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-[#222222] group-hover:text-amber-800 tracking-tight transition-all">
                      {comp.name}
                    </h3>
                    <span className="inline-flex items-center font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#222222] text-white">
                      {comp.recordCount} {comp.recordCount === 1 ? 'Record' : 'Records'}
                    </span>
                  </div>

                  {/* Dynamic Roles Stack Map Tag Summary */}
                  <p className="text-xs text-[#717171] line-clamp-1 mb-5 font-medium">
                    {comp.rolesArray.join(' • ')}
                  </p>
                </div>

                {/* Computational Analytics Footing Module */}
                <div className="pt-4 border-t border-[#F2F2F2] mt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-[#A0A0A0] mb-0.5">Range Floor</span>
                      <span className="font-semibold text-[#555555]">{formatCompactINR(comp.minCompensation)}</span>
                    </div>
                    
                    <div className="w-12 h-[2px] bg-[#EBEBEB] rounded-full relative">
                      <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-[#A0A0A0] mb-0.5">Range Ceiling</span>
                      <span className="font-bold text-[#222222]">{formatCompactINR(comp.maxCompensation)}</span>
                    </div>
                  </div>

                  {/* Geo-Placement Summary Row */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#717171] truncate max-w-[180px]">
                      {comp.locationTokens.join(', ')}
                    </span>
                    <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                      View Profile →
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}