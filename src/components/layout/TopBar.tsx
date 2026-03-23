import { ChevronDown, LogOut, User } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Dropdown } from '@/components/ui/Dropdown'
import { useAuth } from '@/features/auth/useAuth'
import NotificationBell from '@/components/shared/NotificationBell'

function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <SearchInput
        onChange={() => {/* TODO: global search */}}
        placeholder="Search deals, companies, contacts..."
        className="w-80"
      />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        {/* User dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user?.full_name?.charAt(0) ?? 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {user?.full_name ?? 'User'}
                </p>
                <p className="text-xs text-text-muted leading-tight">
                  {user?.role ?? 'Member'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>
          }
          items={[
            {
              label: 'Profile',
              icon: <User className="h-4 w-4" />,
              onClick: () => {/* TODO: navigate to profile */},
            },
            {
              label: 'Sign out',
              icon: <LogOut className="h-4 w-4" />,
              onClick: logout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  )
}

export { TopBar }
