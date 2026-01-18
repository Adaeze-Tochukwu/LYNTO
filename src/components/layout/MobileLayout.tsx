import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  noPadding?: boolean
}

export function MobileLayout({
  children,
  className,
  header,
  footer,
  noPadding = false,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50">
      {header}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          !noPadding && 'px-4 py-6',
          className
        )}
      >
        {children}
      </main>
      {footer}
    </div>
  )
}
