import { LevelBadge, SourceBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/currency'
import type { SalaryRecord } from '@/types/salary'
import Link from 'next/link'

interface Props {
  records: SalaryRecord[]
  displayCurrency?: string
}

const HEADERS = [
  { key: 'company',            label: 'Company'    },
  { key: 'role',               label: 'Role'       },
  { key: 'level',              label: 'Level'      },
  { key: 'location',           label: 'Location'   },
  { key: 'experience_years',   label: 'Exp'        },
  { key: 'base_salary',        label: 'Base'       },
  { key: 'stock',              label: 'Stock'      },
  { key: 'total_compensation', label: 'Total Comp' },
]

export function SalaryTable({ records, displayCurrency = 'INR' }: Props) {
  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium" style={{ color: '#222222' }}>No records found for these filters.</p>
        <p className="text-sm mt-1" style={{ color: '#717171' }}>Try removing a filter to see more results.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#F7F7F7', borderBottom: '1px solid #EBEBEB' }}>
            {HEADERS.map(h => (
              <th
                key={h.key}
                className="px-4 py-3 text-left font-medium whitespace-nowrap"
                style={{ color: '#717171', fontSize: '12px' }}
              >
                {h.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left font-medium" style={{ color: '#717171', fontSize: '12px' }}>
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={r.id}
              className="transition-colors"
              style={{
                borderBottom: '1px solid #EBEBEB',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
              }}
            >
              <td className="px-4 py-3 font-medium max-w-[180px] truncate" style={{ color: '#222222' }}>
                <Link
                  href={`/companies/${r.company_slug}`}
                  className="hover:underline"
                  style={{ color: '#222222' }}
                >
                  {r.company}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: '#484848' }}>
                {r.role}
              </td>
              <td className="px-4 py-3">
                <LevelBadge level={r.level} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#484848' }}>
                {r.location}
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#484848' }}>
                {r.experience_years} yr{r.experience_years !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#484848' }}>
                {formatCurrency(r.base_salary, displayCurrency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#484848' }}>
                {r.stock > 0 ? formatCurrency(r.stock, displayCurrency) : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-base" style={{ color: '#0369A1' }}>
                {formatCurrency(r.total_compensation, displayCurrency)}
              </td>
              <td className="px-4 py-3">
                <SourceBadge source={r.source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}