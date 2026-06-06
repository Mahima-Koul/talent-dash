import { LEVEL_BADGE, LEVEL_LABELS } from '@/lib/utils'
import type { Level } from '@/types/salary'

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${LEVEL_BADGE[level]}`}>
      {LEVEL_LABELS[level]}
    </span>
  )
}

export function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    CONTRIBUTOR:  'bg-green-50 text-green-700',
    SCRAPED:      'bg-yellow-50 text-yellow-700',
    AI_INFERRED:  'bg-gray-100 text-gray-600',
  }
  const labels: Record<string, string> = {
    CONTRIBUTOR: 'Verified', SCRAPED: 'Scraped', AI_INFERRED: 'AI',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[source] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[source] ?? source}
    </span>
  )
}