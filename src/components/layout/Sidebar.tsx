import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Kanban,
  Building2,
  Users,
  FileText,
  Activity,
  CheckSquare,
  BarChart3,
  Brain,
  Settings,
} from 'lucide-react'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/ai', label: 'AI Hub', icon: Brain },
]

const bottomNav = [
  { to: '/settings', label: 'Settings', icon: Settings },
]

function Sidebar() {
  const location = useLocation()

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-bg-sidebar flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-gold flex items-center justify-center text-primary-dark text-lg font-bold">
          E
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-wide">EMINENCE</span>
          <span className="block text-primary-light text-[10px] uppercase tracking-widest">M&A Platform</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => {
          const active = isActive(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white border-l-[3px] border-accent-gold ml-0 pl-[9px]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="px-3 py-4 border-t border-white/10">
        {bottomNav.map((item) => {
          const active = isActive(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white border-l-[3px] border-accent-gold ml-0 pl-[9px]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}

export { Sidebar }
