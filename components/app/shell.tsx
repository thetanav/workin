'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Shell({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8', className)}>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
