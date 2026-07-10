import type { ReactNode } from 'react'
import InternalSidebar from './components/InternalSidebar'

export default function BPAAppControlLayout({ children }: { children: ReactNode }) {
  return (
    <div className="row g-3 align-items-stretch">
      <div className="col-12 col-xl-3 col-xxl-2">
        <InternalSidebar />
      </div>
      <div className="col-12 col-xl-9 col-xxl-10">
        {children}
      </div>
    </div>
  )
}
