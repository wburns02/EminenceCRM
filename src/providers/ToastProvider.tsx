import type { ReactNode } from 'react'
import { ToastContainer } from '@/components/ui/Toast'

function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}

export { ToastProvider }
