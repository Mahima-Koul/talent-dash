import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { mockSalaries } from '@/lib/mock-data'
import { SalaryTable } from '@/components/features/SalaryTable'
import { LevelBadge } from '@/components/ui/Badge'
import { LevelDistributionBar } from '@/components/features/LevelDistributionBar'
import { formatCurrency } from '@/lib/currency'
import { computeMedian, getSalariesByCompany, getLevelDistribution } from '@/lib/utils'
import type { Level } from '@/types/salary'

export async function generateStaticParams() {
  const slugs = [...new Set(mockSalaries.map(s => s.company_slug))]
  return slugs.map(slug => ({ slug }))
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const records = getSalariesByCompany(mockSalaries, slug)
  if (!records.length) return { title: 'Company Not Found' }
  const company = records[0]!.company
  return {
    title: `${company} Salaries — All Levels & Roles`,
    description: `Real compensation data for ${company} in India. Browse verified salary records by level, role, and location.`,
    alternates: { canonical: `https://talentdash.com/companies/${slug}` },
    openGraph: { title: `${company} Salaries | TalentDash`, url: `https://talentdash.com/companies/${slug}` },
  }
}

const COMPANY_META: Record<string, { industry: string; headquarters: string; founded_year: number; headcount_range: string }> = {
  google:     { industry: 'Technology',       headquarters: 'Bengaluru', founded_year: 1998, headcount_range: '100,000+' },
  amazon:     { industry: 'E-Commerce/Cloud', headquarters: 'Bengaluru', founded_year: 1994, headcount_range: '100,000+' },
  microsoft:  { industry: 'Technology',       headquarters: 'Hyderabad', founded_year: 1975, headcount_range: '100,000+' },
  meta:       { industry: 'Social Media',    headquarters: 'Bengaluru', founded_year: 2004, headcount_range: '50,000+'  },
  flipkart:   { industry: 'E-Commerce',      headquarters: 'Bengaluru', founded_year: 2007, headcount_range: '10,000+'  },
  meesho:     { industry: 'E-Commerce',      headquarters: 'Bengaluru', founded_year: 2015, headcount_range: '5,000+'   },
  nvidia:     { industry: 'Semiconductors',  headquarters: 'Pune',      founded_year: 1993, headcount_range: '20,000+'  },
  razorpay:   { industry: 'Fintech',         headquarters: 'Bengaluru', founded_year: 2014, headcount_range: '2,000+'   },
  zepto:      { industry: 'Quick Commerce',  headquarters: 'Mumbai',    founded_year: 2021, headcount_range: '1,000+'   },
  tcs:        { industry: 'IT Services',     headquarters: 'Mumbai',    founded_year: 1968, headcount_range: '600,000+' },
  infosys:    { industry: 'IT Services',     headquarters: 'Bengaluru', founded_year: 1981, headcount_range: '300,000+' },
  wipro:      { industry: 'IT Services',     headquarters: 'Bengaluru', founded_year: 1945, headcount_range: '200,000+' },
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const records = getSalariesByCompany(mockSalaries, slug)

  if (!records.length) notFound()

  const company     = records[0]!.company
  const meta        = COMPANY_META[slug]
  const tcs         = records.map(r => r.total_compensation)
  const medianTC    = computeMedian(tcs)
  const minTC       = Math.min(...tcs)
  const maxTC       = Math.max(...tcs)
  const levelDist   = getLevelDistribution(records) as Partial<Record<Level, number>>

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${company} Salary Data`,
    description: `Compensation data for ${company} employees in India.`,
    url: `https://talentdash.com/companies/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-[#FAFAFA] min-h-screen">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium tracking-wide uppercase text-[#717171]">
          <Link href="/companies" className="hover:text-[#222222] transition-colors">
            Companies
          </Link>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#222222] font-semibold">{company}</span>
        </nav>

        {/* Premium Profile Header Card */}
        <div className="rounded-2xl border border-[#EBEBEB] p-6 sm:p-8 bg-white shadow-sm transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#222222]">
                  {company}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0369A1]/10 text-[#0369A1]">
                  Verified Data
                </span>
              </div>
              
              {meta && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#717171]">
                  <span className="font-semibold text-[#222222] px-2.5 py-1 rounded-md bg-[#F7F7F7] text-xs">
                    {meta.industry}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {meta.headquarters}, IN
                  </span>
                  <span className="text-[#EBEBEB] hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Est. {meta.founded_year}
                  </span>
                  <span className="text-[#EBEBEB] hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {meta.headcount_range} Global Employees
                  </span>
                </div>
              )}
            </div>

            <Link
              href={`/compare?c1=${slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#EBEBEB] text-[#484848] bg-white transition-all duration-150 hover:bg-[#F7F7F7] hover:border-[#484848] active:scale-98 shadow-sm"
            >
              <span>Compare</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Analytics Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: 'Median Total Compensation',
              value: formatCurrency(medianTC, 'INR'),
              sub: `Based on ${records.length} reported payroll record${records.length !== 1 ? 's' : ''}`,
              highlight: true,
            },
            {
              label: 'Lowest Base / Total Range',
              value: formatCurrency(minTC, 'INR'),
              sub: 'Minimum observed baseline bracket',
              highlight: false,
            },
            {
              label: 'Highest Top-Percentile Comp',
              value: formatCurrency(maxTC, 'INR'),
              sub: 'Maximum observed leadership ceiling',
              highlight: false,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${
                stat.highlight ? 'border-l-4 border-l-[#0369A1] border-[#EBEBEB]' : 'border-[#EBEBEB]'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#717171] mb-2">{stat.label}</p>
              <p
                className={`text-3xl font-black tracking-tight ${
                  stat.highlight ? 'text-[#0369A1]' : 'text-[#222222]'
                }`}
              >
                {stat.value}
              </p>
              <div className="mt-3 pt-3 border-t border-[#F7F7F7] flex items-center gap-1.5 text-xs text-[#717171]">
                <svg className="w-3.5 h-3.5 text-[#717171]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Level Distribution Segmentation Block */}
        <div className="rounded-2xl border border-[#EBEBEB] p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7F7F7] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
              Talent Level Distribution
            </h3>
            <span className="text-xs text-[#717171]">Representation Percentage %</span>
          </div>
          <div className="pt-2">
            <LevelDistributionBar distribution={levelDist} />
          </div>
        </div>

        {/* Datatable Wrapper Layout */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EBEBEB] bg-[#F7F7F7] flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold tracking-tight text-[#222222]">
                All Verified {company} Compensation Records
              </h2>
              <p className="text-xs text-[#717171]">Anonymized direct entries from active personnel</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#EBEBEB] text-[#222222]">
              {records.length} Entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <SalaryTable records={records} />
          </div>
        </div>
      </div>
    </>
  )
}