'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { Level } from '@/types/salary'

const ALL_LEVELS: Level[] = [
  'L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5'
]

const LEVEL_LABELS: Record<Level, string> = {
  L3:'L3', L4:'L4', L5:'L5', L6:'L6',
  SDE_I:'SDE-I', SDE_II:'SDE-II', SDE_III:'SDE-III',
  STAFF:'Staff', PRINCIPAL:'Principal', IC4:'IC4', IC5:'IC5',
}

interface Props {
  companies: string[]
  roles:     string[]
  locations: string[]
}

export function FilterBar({ companies, roles, locations }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const [, startTransition] = useTransition()

  const [company,  setCompany]  = useState(params.get('company')  ?? '')
  const [role,     setRole]     = useState(params.get('role')      ?? '')
  const [location, setLocation] = useState(params.get('location')  ?? '')
  const [currency, setCurrency] = useState(params.get('currency')  ?? 'INR')
  const [levels,   setLevels]   = useState<Level[]>(
    params.get('level') ? (params.get('level')!.split(',') as Level[]) : []
  )
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const pushParams = useCallback((overrides: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k)
    })
    next.set('page', '1')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }, [params, pathname, router])

  const handleCompany = (val: string) => {
    setCompany(val)
    if (debounceTimer) clearTimeout(debounceTimer)
    const t = setTimeout(() => pushParams({ company: val }), 300)
    setDebounceTimer(t)
  }

  const handleLevel = (level: Level) => {
    const next = levels.includes(level) ? levels.filter(l => l !== level) : [...levels, level]
    setLevels(next)
    pushParams({ level: next.join(',') })
  }

  const clearAll = () => {
    setCompany(''); setRole(''); setLocation(''); setCurrency('INR'); setLevels([])
    startTransition(() => router.push(pathname))
  }

  const hasFilters = company || role || location || levels.length > 0 || currency !== 'INR'

  return (
    <div className="rounded-xl border p-4 space-y-4" style={{ background: '#fff', borderColor: '#EBEBEB' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: '#222222' }}>Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-medium hover:underline" style={{ color: '#FF5A5F' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Company search */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: '#717171' }}>Company</label>
        <input
          type="text"
          value={company}
          onChange={e => handleCompany(e.target.value)}
          placeholder="e.g. Google, Amazon..."
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 transition"
          style={{ borderColor: '#EBEBEB', color: '#222222' }}
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: '#717171' }}>Role</label>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); pushParams({ role: e.target.value }) }}
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
          style={{ borderColor: '#EBEBEB', color: '#222222' }}
        >
          <option value="">All roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: '#717171' }}>Location</label>
        <select
          value={location}
          onChange={e => { setLocation(e.target.value); pushParams({ location: e.target.value }) }}
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
          style={{ borderColor: '#EBEBEB', color: '#222222' }}
        >
          <option value="">All locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Level multi-select */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#717171' }}>Level</label>
        <div className="flex flex-wrap gap-2">
          {ALL_LEVELS.map(l => (
            <button
              key={l}
              onClick={() => handleLevel(l)}
              className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                levels.includes(l)
                  ? 'border-[#FF5A5F] bg-[#FF5A5F]/10 text-[#FF5A5F]'
                  : 'border-[#EBEBEB] text-[#484848] hover:border-[#484848]'
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Currency toggle */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#717171' }}>Currency</label>
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#EBEBEB' }}>
          {(['INR', 'USD'] as const).map(c => (
            <button
              key={c}
              onClick={() => { setCurrency(c); pushParams({ currency: c }) }}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                currency === c
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#484848] hover:bg-[#F7F7F7]'
              }`}
            >
              {c === 'INR' ? '₹ INR' : '$ USD'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}