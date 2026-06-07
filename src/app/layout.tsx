import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { siteConfig } from '@/config/site'
import { AppProviders } from '@/provider/AppProviders'
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
