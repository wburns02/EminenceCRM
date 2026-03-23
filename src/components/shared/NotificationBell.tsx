import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from '@/api/hooks/useNotifications'

const TYPE_ICONS: Record<string, string> = {
  task_due: 'bg-amber-100 text-amber-600',
  deal_update: 'bg-blue-100 text-blue-600',
  buyer_status: 'bg-purple-100 text-purple-600',
  document: 'bg-green-100 text-green-600',
  mention: 'bg-primary/10 text-primary',
  system: 'bg-gray-100 text-gray-500',
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: notifications } = useNotifications()
  const { data: unreadCount } = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleNotificationClick = (notification: { id: string; link?: string | null; read: boolean }) => {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
    setOpen(false)
  }

  const displayCount = unreadCount ?? 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {displayCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold px-1">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-80 bg-bg-card border border-border rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            {displayCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-border last:border-0',
                    !n.read && 'bg-primary/[0.02]'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', TYPE_ICONS[n.type] ?? TYPE_ICONS.system)}>
                    {n.read ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', n.read ? 'text-text-secondary' : 'text-text-primary font-medium')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-text-muted mt-1">{formatDate(n.created_at)}</p>
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
