'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockSalaries } from '@/lib/mock-data'
import { LevelBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/currency'
import type { SalaryRecord } from '@/types/salary'

const FIELDS: { key: keyof SalaryRecord; label: string; numeric: boolean }[] = [
  { key: 'company',           label: 'Company',       numeric: false },
  { key: 'role',              label: 'Role',          numeric: false },
  { key: 'level',             label: 'Level',         numeric: false },
  { key: 'location',          label: 'Location',      numeric: false },
  { key: 'experience_years',  label: 'Experience',    numeric: true  },
  { key: 'base_salary',       label: 'Base Salary',   numeric: true  },
  { key: 'bonus',             label: 'Bonus',         numeric: true  },
  { key: 'stock',             label: 'Stock / RSU',   numeric: true  },
  { key: 'total_compensation',label: 'Total Comp',    numeric: true  },
]

const SALARY_FIELDS = new Set(['base_salary','bonus','stock','total_compensation'])

function DeltaCell({ delta, field }: { delta: number; field: string }) {
  if (!delta) return <td className="px-4 py-3 text-sm text-center" style={{ color: '#717171' }}>—</td>
  const positive = delta > 0
  const display = SALARY_FIELDS.has(field)
    ? `${positive ? '+' : ''}${formatCurrency(Math.abs(delta), 'INR')}`
    : `${positive ? '+' : ''}${Math.abs(delta)} yrs`
  return (
    <td className="px-4 py-3 text-sm font-medium text-center" style={{ color: positive ? '#008A05' : '#D93025' }}>
      {positive ? '+' : '-'}{display.replace(/^[+-]/, '')}
    </td>
  )
}

export default function ComparePage() {
  const router      = useRouter()
  const params      = useSearchParams()
  const [s1, setS1] = useState(params.get('s1') ?? '')
  const [s2, setS2] = useState(params.get('s2') ?? '')

  const record1 = mockSalaries.find(r => r.id === s1) ?? null
  const record2 = mockSalaries.find(r => r.id === s2) ?? null

  useEffect(() => {
    const next = new URLSearchParams()
    if (s1) next.set('s1', s1)
    if (s2) next.set('s2', s2)
    router.replace(`/compare?${next.toString()}`, { scroll: false })
  }, [s1, s2, router])

  const winner = record1 && record2
    ? record1.total_compensation > record2.total_compensation ? 1
    : record2.total_compensation > record1.total_compensation ? 2
    : 0
    : 0

  const renderCell = (r: SalaryRecord, field: keyof SalaryRecord) => {
    if (field === 'level')   return <LevelBadge level={r.level} />
    if (SALARY_FIELDS.has(field)) {
      const val = r[field] as number
      return val > 0 ? (
        <span className="font-bold" style={{ color: field === 'total_compensation' ? '#0369A1' : '#222222' }}>
          {formatCurrency(val, 'INR')}
        </span>
      ) : '—'
    }
    if (field === 'experience_years') return `${r[field]} yrs`
    return String(r[field])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#222222' }}>Compare Offers</h1>
        <p className="text-sm" style={{ color: '#717171' }}>
          Select two salary records to compare them side-by-side
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {([
          { label: 'Offer A', value: s1, set: setS1 },
          { label: 'Offer B', value: s2, set: setS2 },
        ] as const).map(({ label, value, set }) => (
          <div key={label}>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717171' }}>{label}</label>
            <select
              value={value}
              onChange={e => set(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
              style={{ borderColor: '#EBEBEB', color: '#222222' }}
            >
              <option value="">Select a record...</option>
              {mockSalaries.map(r => (
                <option key={r.id} value={r.id}>
                  {r.company} · {r.role} · {r.level} · {formatCurrency(r.total_compensation, 'INR')}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {record1 && record2 ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#EBEBEB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F7F7F7', borderBottom: '1px solid #EBEBEB' }}>
                <th className="px-4 py-3 text-left text-xs font-medium w-32" style={{ color: '#717171' }}>Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#717171' }}>
                  Offer A — {record1.company}
                  {winner === 1 && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-[#0369A1]/10 text-[#0369A1]">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#717171' }}>
                  Offer B — {record2.company}
                  {winner === 2 && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-[#0369A1]/10 text-[#0369A1]">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium w-28" style={{ color: '#717171' }}>
                  Δ Delta (A−B)
                </th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((f, i) => {
                const delta = f.numeric
                  ? (record1[f.key] as number) - (record2[f.key] as number)
                  : 0
                return (
                  <tr
                    key={f.key}
                    style={{ borderBottom: '1px solid #EBEBEB', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: '#717171' }}>{f.label}</td>
                    <td className="px-4 py-3">{renderCell(record1, f.key)}</td>
                    <td className="px-4 py-3">{renderCell(record2, f.key)}</td>
                    {f.numeric
                      ? <DeltaCell delta={delta} field={f.key} />
                      : <td className="px-4 py-3 text-center text-xs" style={{ color: '#717171' }}>—</td>
                    }
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="rounded-xl border flex items-center justify-center py-20 text-center"
          style={{ borderColor: '#EBEBEB', background: '#fff' }}
        >
          <div>
            <p className="text-lg font-medium mb-1" style={{ color: '#222222' }}>Select two records above</p>
            <p className="text-sm" style={{ color: '#717171' }}>
              Choose Offer A and Offer B to see a full side-by-side breakdown
            </p>
          </div>
        </div>
      )}
    </div>
  )
}