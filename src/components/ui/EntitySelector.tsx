import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Search, ChevronDown, X } from 'lucide-react'

interface EntityOption {
  id: string
  label: string
  sublabel?: string
  icon?: ReactNode
}

interface EntitySelectorProps {
  label?: string
  placeholder?: string
  options: EntityOption[]
  value?: string | null
  onChange: (id: string | null) => void
  onSearch?: (query: string) => void
  loading?: boolean
  className?: string
}

function EntitySelector({
  label,
  placeholder = 'Search...',
  options,
  value,
  onChange,
  onSearch,
  loading,
  className,
}: EntitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.id === value) ?? null

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = onSearch
    ? options
    : options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(query.toLowerCase())
      )

  const handleQueryChange = (val: string) => {
    setQuery(val)
    onSearch?.(val)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-border bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
          !selected && 'text-text-muted'
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
                setQuery('')
              }}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="h-3.5 w-3.5 text-text-muted" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-card border border-border rounded-lg shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-4 text-sm text-text-muted text-center">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-text-muted text-center">No results found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                    value === opt.id && 'bg-primary/5 text-primary'
                  )}
                >
                  {opt.icon}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-text-muted truncate">{opt.sublabel}</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { EntitySelector }
export type { EntitySelectorProps, EntityOption }
