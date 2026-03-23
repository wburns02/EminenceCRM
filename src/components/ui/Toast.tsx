import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: 'border-l-success bg-success/5',
  error: 'border-l-danger bg-danger/5',
  info: 'border-l-primary bg-primary/5',
  warning: 'border-l-warning bg-warning/5',
}

const iconColorMap = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
  warning: 'text-warning',
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 bg-bg-card border border-border border-l-4 rounded-lg shadow-lg animate-toast-in',
              colorMap[toast.type]
            )}
          >
            <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColorMap[toast.type])} />
            <p className="text-sm text-text-primary flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  return {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    warning: (message: string) => addToast('warning', message),
  }
}

export { ToastContainer, useToast }
