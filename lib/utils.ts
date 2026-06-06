import type { Level, SalaryRecord } from '@/types/salary'

export const LEVEL_ORDER: Level[] = [
  'L3','SDE_I','L4','SDE_II','L5','SDE_III','IC4','L6','IC5','STAFF','PRINCIPAL',
]

export const LEVEL_LABELS: Record<Level, string> = {
  L3: 'L3', L4: 'L4', L5: 'L5', L6: 'L6',
  SDE_I: 'SDE-I', SDE_II: 'SDE-II', SDE_III: 'SDE-III',
  STAFF: 'Staff', PRINCIPAL: 'Principal', IC4: 'IC4', IC5: 'IC5',
}

// Badge colour per tier — Tailwind classes
export const LEVEL_BADGE: Record<Level, string> = {
  L3:        'bg-slate-100 text-slate-700',
  SDE_I:     'bg-slate-100 text-slate-700',
  L4:        'bg-blue-100 text-blue-700',
  SDE_II:    'bg-blue-100 text-blue-700',
  IC4:       'bg-blue-100 text-blue-700',
  L5:        'bg-indigo-100 text-indigo-700',
  SDE_III:   'bg-indigo-100 text-indigo-700',
  IC5:       'bg-indigo-100 text-indigo-700',
  L6:        'bg-purple-100 text-purple-700',
  STAFF:     'bg-purple-100 text-purple-700',
  PRINCIPAL: 'bg-navy-100 text-[#1e3a5f] bg-[#dce8f5]',
}

export function computeMedian(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? (sorted[mid] ?? 0)
    : Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2)
}

export function getSalariesByCompany(records: SalaryRecord[], slug: string) {
  return records
    .filter(r => r.company_slug === slug)
    .sort((a, b) => b.total_compensation - a.total_compensation)
}

export function getLevelDistribution(records: SalaryRecord[]): Partial<Record<Level, number>> {
  return records.reduce<Partial<Record<Level, number>>>((acc, r) => {
    acc[r.level] = (acc[r.level] ?? 0) + 1
    return acc
  }, {})
}

export function getUniqueCompanies(records: SalaryRecord[]) {
  return [...new Map(records.map(r => [r.company_slug, r.company])).entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getUniqueValues<T extends keyof SalaryRecord>(
  records: SalaryRecord[], key: T
): string[] {
  return [...new Set(records.map(r => String(r[key])))].sort()
}