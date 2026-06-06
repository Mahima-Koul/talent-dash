'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function SortSelect({ current }: { current: string }) {
  const router   = useRouter()
  const params   = useSearchParams()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString())
    next.set('sort', e.target.value)
    next.set('page', '1')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <select
      defaultValue={current}
      onChange={handleChange}
      className="text-xs border rounded px-2 py-1 outline-none"
      style={{ borderColor: '#EBEBEB', color: '#222222' }}
    >
      <option value="total_comp_desc">Total Comp ↓</option>
      <option value="total_comp_asc">Total Comp ↑</option>
      <option value="date_desc">Most Recent</option>
    </select>
  )
}