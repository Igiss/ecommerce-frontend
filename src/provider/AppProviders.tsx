'use client'

import type { ReactNode } from 'react'

import { AuthBootstrap } from "./AuthBootstrap"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      <AuthBootstrap />
      {children}
    </>
  )
}
