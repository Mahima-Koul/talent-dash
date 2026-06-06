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

const TOP_COMPANIES = ['google','amazon','microsoft','meta','flipkart','razorpay','meesho','nvidia']

export default function HomePage() {
  const stats = TOP_COMPANIES.map(slug => {
    const records = mockSalaries.filter(r => r.company_slug === slug)
    const name    = records[0]?.company ?? slug
    const median  = computeMedian(records.map(r => r.total_compensation))
    return { slug, name, median, count: records.length }
  }).filter(s => s.count > 0)

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ color: '#222222' }}>
            Know your worth.<br />
            <span style={{ color: '#FF5A5F' }}>Before the interview.</span>
          </h1>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#484848' }}>
            Structured, verified compensation data for India's tech industry. Every level. Every company. No noise.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/salaries"
              className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#FF5A5F' }}
            >
              Explore Salaries
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 rounded-lg font-medium border transition-colors hover:bg-[#F7F7F7]"
              style={{ color: '#484848', borderColor: '#EBEBEB' }}
            >
              Compare Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Company cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl font-bold mb-6" style={{ color: '#222222' }}>Top Companies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <Link
              key={s.slug}
              href={`/companies/${s.slug}`}
              className="rounded-xl border p-4 block transition-colors hover:border-[#FF5A5F]/40"
              style={{ background: '#fff', borderColor: '#EBEBEB' }}
            >
              <p className="font-semibold mb-1 truncate" style={{ color: '#222222' }}>{s.name}</p>
              <p className="text-xl font-bold" style={{ color: '#0369A1' }}>
                {formatCurrency(s.median, 'INR')}
              </p>
              <p className="text-xs mt-1" style={{ color: '#717171' }}>
                Median TC · {s.count} record{s.count !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}