'use client'

import { type ReactNode } from 'react'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-stone-50 py-12 min-h-[calc(100vh-64px)] flex justify-center">
      <div className="mx-auto px-4 max-w-5xl w-full">
        {children}
      </div>
    </div>
  )
}
