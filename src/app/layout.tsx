import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { siteConfig } from '@/config/site'
import { AppProviders } from '@/provider/AppProviders'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | CupShop',
    default: siteConfig.name,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: 'https://cupshop.vn',
    siteName: siteConfig.name,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
