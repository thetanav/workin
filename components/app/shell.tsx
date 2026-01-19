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
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      <div className="hero-grid rounded-3xl p-2 mt-4">
        <header className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/60 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="display-font text-2xl font-semibold tracking-tight truncate">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground truncate">{subtitle}</p>
              ) : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </header>

        <main className="px-0 py-4 md:p-4">{children}</main>
      </div>
    </div>
  )
}
