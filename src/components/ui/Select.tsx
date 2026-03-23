import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-primary transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M7%207l3%203%203-3%22/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10',
          error
            ? 'border-danger focus:ring-danger/30 focus:border-danger'
            : 'border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps }
