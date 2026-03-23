import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab components must be used within <Tabs>')
  return ctx
}

interface TabsProps {
  defaultTab: string
  children: ReactNode
  className?: string
  onChange?: (tab: string) => void
}

function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleChange = (tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }

  return (
    <TabsContext value={{ activeTab, setActiveTab: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext>
  )
}

interface TabListProps {
  children: ReactNode
  className?: string
}

function TabList({ children, className }: TabListProps) {
  return (
    <div className={cn('flex border-b border-border', className)} role="tablist">
      {children}
    </div>
  )
}

interface TabProps {
  value: string
  children: ReactNode
  className?: string
}

function Tab({ value, children, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab } = useTabs()
  if (activeTab !== value) return null

  return (
    <div role="tabpanel" className={cn('py-4', className)}>
      {children}
    </div>
  )
}

export { Tabs, TabList, Tab, TabPanel }
export type { TabsProps, TabListProps, TabProps, TabPanelProps }
