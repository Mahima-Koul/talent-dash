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

// Company metadata (in prod this comes from DB)
const COMPANY_META: Record<string, { industry: string; headquarters: string; founded_year: number; headcount_range: string }> = {
  google:    { industry: 'Technology',      headquarters: 'Bengaluru', founded_year: 1998, headcount_range: '100,000+' },
  amazon:    { industry: 'E-Commerce/Cloud',headquarters: 'Bengaluru', founded_year: 1994, headcount_range: '100,000+' },
  microsoft: { industry: 'Technology',      headquarters: 'Hyderabad', founded_year: 1975, headcount_range: '100,000+' },
  meta:      { industry: 'Social Media',    headquarters: 'Bengaluru', founded_year: 2004, headcount_range: '50,000+'  },
  flipkart:  { industry: 'E-Commerce',      headquarters: 'Bengaluru', founded_year: 2007, headcount_range: '10,000+'  },
  meesho:    { industry: 'E-Commerce',      headquarters: 'Bengaluru', founded_year: 2015, headcount_range: '5,000+'   },
  nvidia:    { industry: 'Semiconductors',  headquarters: 'Pune',      founded_year: 1993, headcount_range: '20,000+'  },
  razorpay:  { industry: 'Fintech',         headquarters: 'Bengaluru', founded_year: 2014, headcount_range: '2,000+'   },
  zepto:     { industry: 'Quick Commerce',  headquarters: 'Mumbai',    founded_year: 2021, headcount_range: '1,000+'   },
  tcs:       { industry: 'IT Services',     headquarters: 'Mumbai',    founded_year: 1968, headcount_range: '600,000+' },
  infosys:   { industry: 'IT Services',     headquarters: 'Bengaluru', founded_year: 1981, headcount_range: '300,000+' },
  wipro:     { industry: 'IT Services',     headquarters: 'Bengaluru', founded_year: 1945, headcount_range: '200,000+' },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="text-xs" style={{ color: '#717171' }}>
          <Link href="/companies" className="hover:underline">Companies</Link>
          <span className="mx-1">›</span>
          <span style={{ color: '#222222' }}>{company}</span>
        </nav>

        {/* Company header card */}
        <div className="rounded-xl border p-6" style={{ background: '#fff', borderColor: '#EBEBEB' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#222222' }}>{company}</h1>
              <div className="flex flex-wrap gap-2 text-sm" style={{ color: '#717171' }}>
                {meta && (
                  <>
                    <span className="px-2 py-0.5 rounded" style={{ background: '#F7F7F7' }}>{meta.industry}</span>
                    <span>📍 {meta.headquarters}</span>
                    <span>🗓 Founded {meta.founded_year}</span>
                    <span>👥 {meta.headcount_range}</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href={`/compare?c1=${slug}`}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[#F7F7F7]"
              style={{ borderColor: '#EBEBEB', color: '#484848' }}
            >
              Compare ↔
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Median Total Comp',
              value: formatCurrency(medianTC, 'INR'),
              sub: `${records.length} record${records.length !== 1 ? 's' : ''}`,
              highlight: true,
            },
            {
              label: 'Lowest TC',
              value: formatCurrency(minTC, 'INR'),
              sub: 'in this dataset',
              highlight: false,
            },
            {
              label: 'Highest TC',
              value: formatCurrency(maxTC, 'INR'),
              sub: 'in this dataset',
              highlight: false,
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl border p-5"
              style={{ background: '#fff', borderColor: '#EBEBEB' }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: '#717171' }}>{stat.label}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: stat.highlight ? '#0369A1' : '#222222' }}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: '#717171' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Level distribution */}
        <div className="rounded-xl border p-5" style={{ background: '#fff', borderColor: '#EBEBEB' }}>
          <LevelDistributionBar distribution={levelDist} />
        </div>

        {/* Salary table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#EBEBEB' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#EBEBEB', background: '#F7F7F7' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#222222' }}>
              All {company} Records
            </h2>
          </div>
          <SalaryTable records={records} />
        </div>
      </div>
    </>
  )
}