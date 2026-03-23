import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          error
            ? 'border-danger focus:ring-danger/30 focus:border-danger'
            : 'border-border',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }
