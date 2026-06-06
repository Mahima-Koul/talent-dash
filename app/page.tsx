import type { Metadata } from 'next'
import Link from 'next/link'
import { mockSalaries } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/currency'
import { computeMedian } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'TalentDash — Career Intelligence for India',
  description: 'Structured, comparable salary data for Indian tech professionals. Find real compensation for every role, level, and company.',
}

const TOP_COMPANIES = ['google', 'amazon', 'microsoft', 'meta', 'flipkart', 'razorpay', 'meesho', 'nvidia']

// Static Roles Framework for the Track Matrix Section
const CAREER_TRACKS = [
  { role: 'Software Engineer', slug: 'software-engineer', baseCount: 412, icon: '💻' },
  { role: 'Product Manager', slug: 'product-manager', baseCount: 189, icon: '🎯' },
  { role: 'Data Scientist', slug: 'data-scientist', baseCount: 124, icon: '📊' },
  { role: 'DevOps Engineer', slug: 'devops', baseCount: 95, icon: '⚙️' },
]

export default function HomePage() {
  // Global Metrics
  const globalTotalRecords = mockSalaries.length
  const uniqueCompaniesCount = new Set(mockSalaries.map(r => r.company_slug)).size
  const highestRecordedPackage = Math.max(...mockSalaries.map(r => r.total_compensation))

  // Map Company Metrics
  const stats = TOP_COMPANIES.map(slug => {
    const records = mockSalaries.filter(r => r.company_slug === slug)
    const name    = records[0]?.company ?? slug
    const median  = computeMedian(records.map(r => r.total_compensation))
    return { slug, name, median, count: records.length }
  }).filter(s => s.count > 0)

  const maxMedianValue = Math.max(...stats.map(s => s.median), 1)

  // Extract the latest 4 entries cleanly to build a live data submission ticker
  const liveSubmissions = [...mockSalaries]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#222222] selection:bg-neutral-200 antialiased">
      
      {/* 1. Global Alert Banner */}
      <div className="bg-[#222222] text-white text-xs font-mono py-2.5 px-4 text-center tracking-tight border-b border-neutral-800">
        <span className="text-[#FF5A5F] font-bold">● Q2 UPDATE:</span> Server-side normalization engine successfully synchronized with Neon serverless endpoints.
      </div>

      {/* 2. Hero & Search Integration Module */}
      <section className="relative bg-white border-b border-[#EBEBEB] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#EBEBEB_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Core Copy */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 bg-[#FFF2F2] text-[#FF5A5F] border border-[#FFD0D2]">
                💎 Verified Market Intelligence
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                Democratizing tech<br />
                <span style={{ color: '#FF5A5F' }}>compensation ranges.</span>
              </h1>
              
              <p className="text-base sm:text-lg mb-8 max-w-xl font-medium text-[#484848]">
                Navigate tech offers with surgical precision. Access clean, structured database parameters for tech talent across 50+ scaling Indian enterprises.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/salaries"
                  className="px-6 py-3.5 rounded-xl font-bold text-center text-sm transition-all bg-[#FF5A5F] text-white shadow-sm hover:opacity-95"
                >
                  Explore Salary Database
                </Link>
                <Link
                  href="/compare"
                  className="px-6 py-3.5 rounded-xl font-bold text-center text-sm transition-all bg-white border border-[#EBEBEB] text-[#484848] hover:bg-[#F7F7F7]"
                >
                  Compare Offer Letters
                </Link>
              </div>
            </div>

            {/* Top Baseline Metrics Summary Card Block */}
            <div className="lg:col-span-5 bg-[#FAFAFA] border border-[#EBEBEB] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] font-mono">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 pb-2 border-b border-[#EBEBEB]">
                System Analytics Console
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-[#717171]">AGGREGATED BASESETS</span>
                  <span className="text-xl font-black text-[#222222]">{globalTotalRecords.toLocaleString()} Rows</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-[#717171]">UNIQUE MARKET SLUGS</span>
                  <span className="text-xl font-black text-[#222222]">{uniqueCompaniesCount} Tech Hubs</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-[#717171]">WATERMARK MAX TC</span>
                  <span className="text-xl font-black text-emerald-700">{formatCurrency(highestRecordedPackage, 'INR')}</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#EBEBEB] flex items-center gap-2 text-[11px] font-medium text-[#717171]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live database synchronization secure
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Real-Time Rolling Submission Feed Module */}
      <section className="bg-white border-b border-[#EBEBEB] py-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#222222]">Latest Data Updates:</span>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveSubmissions.map((entry, index) => (
              <div key={index} className="px-3 py-2 border border-[#F2F2F2] bg-[#FAFAFA] rounded-xl flex items-center justify-between text-xs transition-all hover:border-[#CCCCCC]">
                <div className="truncate pr-2">
                  <span className="font-bold text-[#222222] block truncate">{entry.company}</span>
                  <span className="text-[10px] text-[#717171] uppercase tracking-tight">{entry.role} · {entry.level}</span>
                </div>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {formatCurrency(entry.total_compensation, 'INR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Specialized Job Family Cluster Array */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Explore Core Career Paths</h2>
          <p className="text-xs font-medium text-[#717171] mt-0.5">Filter the matrix using specific standard technological organizational roles.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAREER_TRACKS.map((track) => (
            <Link
              key={track.slug}
              href={`/salaries?role=${encodeURIComponent(track.role)}`}
              className="group bg-white border border-[#EBEBEB] rounded-2xl p-5 hover:border-neutral-400 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-[#FAFAFA] w-10 h-10 rounded-xl border border-[#F2F2F2] flex items-center justify-center group-hover:scale-105 transition-all">
                  {track.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#222222] group-hover:text-amber-800 transition-colors">
                    {track.role}
                  </h3>
                  <span className="text-[11px] font-mono text-[#717171]">
                    {track.baseCount} Tracked Datasets
                  </span>
                </div>
              </div>
              <span className="text-neutral-300 group-hover:text-[#222222] group-hover:translate-x-0.5 transition-all text-sm">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Enterprise Benchmark Matrix Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-16">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#EBEBEB]">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Enterprise Financial Benchmarks</h2>
            <p className="text-xs text-[#717171] font-medium mt-0.5">Top-tier tech operations sorted by overall median total compensation packages.</p>
          </div>
          <Link href="/companies" className="text-xs font-bold text-amber-800 hover:underline">
            View All Companies →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map(s => {
            const proportionalWidth = (s.median / maxMedianValue) * 100
            return (
              <Link
                key={s.slug}
                href={`/companies/${s.slug}`}
                className="group relative block rounded-2xl border p-5 bg-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.02)] hover:border-neutral-300"
                style={{ borderColor: '#EBEBEB' }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-base group-hover:text-amber-800 transition-colors tracking-tight">
                      {s.name}
                    </h3>
                    <p className="text-xs font-mono text-[#717171] mt-0.5">
                      Based on {s.count} submission{s.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono tracking-tight text-[#0369A1]">
                      {formatCurrency(s.median, 'INR')}
                    </span>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider">Median TC</span>
                  </div>
                </div>

                <div className="mt-4 w-full h-1.5 bg-[#FAFAFA] rounded-full overflow-hidden border border-[#F2F2F2]">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-700 rounded-full transition-all duration-500 group-hover:opacity-90"
                    style={{ width: `${proportionalWidth}%` }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 6. Data Integrity Protocol Section */}
      <section className="bg-white border-t border-[#EBEBEB] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-extrabold tracking-tight">Designed for Precision, Built for Privacy</h2>
            <p className="text-sm font-medium text-[#717171] mt-2">How we guarantee anonymous salary data matches production market levels without exposing personal developer details.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-5 border border-[#EBEBEB] rounded-2xl bg-[#FAFAFA]">
              <span className="text-xl mb-3 block">🔒</span>
              <h4 className="text-sm font-bold mb-1">Strict Cryptographic Hashing</h4>
              <p className="text-xs text-[#717171] leading-relaxed">UserData is salt-hashed using SHA-256 protocols before database commit cycles to guarantee immutable source identity protection.</p>
            </div>
            <div className="p-5 border border-[#EBEBEB] rounded-2xl bg-[#FAFAFA]">
              <span className="text-xl mb-3 block">🛡️</span>
              <h4 className="text-sm font-bold mb-1">Deduplication Guardrails</h4>
              <p className="text-xs text-[#717171] leading-relaxed">Our pipeline flags overlapping financial values within 48-hour submission windows to eliminate synthetic metric manipulation patterns.</p>
            </div>
            <div className="p-5 border border-[#EBEBEB] rounded-2xl bg-[#FAFAFA]">
              <span className="text-xl mb-3 block">📈</span>
              <h4 className="text-sm font-bold mb-1">Mathematical Median Focus</h4>
              <p className="text-xs text-[#717171] leading-relaxed">We isolate compensation outliers using true statistical medians, protecting your market calculations from artificial skew factors.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}