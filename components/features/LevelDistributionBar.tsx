import type { Level } from '@/types/salary'
import { LEVEL_LABELS } from '@/lib/utils'

const COLORS: Partial<Record<Level, string>> = {
  L3: '#94a3b8', SDE_I: '#94a3b8',
  L4: '#3b82f6', SDE_II: '#3b82f6', IC4: '#3b82f6',
  L5: '#6366f1', SDE_III: '#6366f1', IC5: '#6366f1',
  L6: '#a855f7', STAFF: '#a855f7',
  PRINCIPAL: '#1e3a5f',
}

interface Props {
  distribution: Partial<Record<Level, number>>
}

export function LevelDistributionBar({ distribution }: Props) {
  const entries = Object.entries(distribution) as [Level, number][]
  const total = entries.reduce((s, [, n]) => s + n, 0)
  if (!total) return null

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: '#717171' }}>Level distribution</p>
      <div className="flex h-3 rounded-full overflow-hidden w-full" style={{ background: '#EBEBEB' }}>
        {entries.map(([level, count]) => (
          <div
            key={level}
            style={{
              width: `${(count / total) * 100}%`,
              background: COLORS[level] ?? '#cbd5e1',
              minWidth: count > 0 ? '2px' : 0,
            }}
            title={`${LEVEL_LABELS[level]}: ${count} record${count !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {entries.map(([level, count]) => (
          <div key={level} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[level] ?? '#cbd5e1' }} />
            <span className="text-xs" style={{ color: '#717171' }}>
              {LEVEL_LABELS[level]} ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}