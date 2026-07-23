import type { Metadata } from 'next'
import { Storefront } from '@/components/landing/Storefront'
import { getActiveBanners } from '@/lib/api/banners.service'
import { siteConfig } from '@/config/site'

export async function generateMetadata(): Promise<Metadata> {
  let bannerImage: string = siteConfig.ogImage

  try {
    const banners = await getActiveBanners()
    if (Array.isArray(banners) && banners.length > 0) {
      const topBanner = banners[0]
      const chosenUrl = topBanner.bgImageUrl || topBanner.imageUrl
      if (chosenUrl) {
        bannerImage = chosenUrl
      }
    }
  } catch {
    // Fallback to siteConfig.ogImage if API fails
  }

  return {
    title: siteConfig.title,
    description: siteConfig.description,
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      images: [bannerImage],
    },
  }
}

export default function Page() {
  return <Storefront />
}
