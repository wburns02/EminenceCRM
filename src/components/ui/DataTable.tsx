import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  className?: string
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const [localSortKey, setLocalSortKey] = useState(sortKey || '')
  const [localSortDir, setLocalSortDir] = useState<'asc' | 'desc'>(sortDirection || 'asc')

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key)
    } else {
      if (localSortKey === key) {
        setLocalSortDir(localSortDir === 'asc' ? 'desc' : 'asc')
      } else {
        setLocalSortKey(key)
        setLocalSortDir('asc')
      }
    }
  }

  const activeSortKey = sortKey ?? localSortKey
  const activeSortDir = sortDirection ?? localSortDir

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider',
                  col.sortable && 'cursor-pointer select-none hover:text-text-primary'
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="h-4 w-4">
                      {activeSortKey === col.key ? (
                        activeSortDir === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-text-primary">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export { DataTable }
export type { DataTableProps, Column }
