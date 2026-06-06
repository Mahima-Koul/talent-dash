interface Props {
  page: number
  totalPages: number
  total: number
  limit: number
  onPage: (p: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPage }: Props) {
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#EBEBEB' }}>
      <p className="text-sm" style={{ color: '#717171' }}>
        Showing <span className="font-medium" style={{ color: '#222222' }}>{from}–{to}</span> of{' '}
        <span className="font-medium" style={{ color: '#222222' }}>{total.toLocaleString()}</span> records
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          style={{ borderColor: '#EBEBEB', color: '#484848' }}
        >
          ← Previous
        </button>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          style={{ borderColor: '#EBEBEB', color: '#484848' }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}