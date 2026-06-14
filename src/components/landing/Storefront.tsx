'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Product } from '@/types/product'
import { Home } from './Home'
import { getProductById } from '@/lib/api/products.service'
import { ProductDetails } from '@/components/landing/ProductDetails'
import { RefreshCw } from 'lucide-react'

const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  { ssr: false }
)

function StorefrontContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const customizeId = searchParams.get('customize')
    const productId = searchParams.get('productId') || searchParams.get('id')

    if (customizeId) {
      setLoading(true)
      getProductById(customizeId)
        .then((product) => {
          if (product) {
            const normalized = {
              ...product,
              id: String(product.id || (product as any)._id || (product as any).productId)
            }
            setSelectedProduct(normalized)
            setIsCustomizing(true)
          }
        })
        .catch((err) => {
          console.error('Failed to load product for customizer:', err)
        })
        .finally(() => setLoading(false))
    } else if (productId) {
      setLoading(true)
      getProductById(productId)
        .then((product) => {
          if (product) {
            const normalized = {
              ...product,
              id: String(product.id || (product as any)._id || (product as any).productId)
            }
            setSelectedProduct(normalized)
            setIsCustomizing(false)
          }
        })
        .catch((err) => {
          console.error('Failed to load product details:', err)
        })
        .finally(() => setLoading(false))
    } else {
      setSelectedProduct(null)
      setIsCustomizing(false)
    }
  }, [searchParams])

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product)
    const params = new URLSearchParams(searchParams.toString())
    if (product) {
      params.set('productId', product.id)
    } else {
      params.delete('productId')
      params.delete('id')
      params.delete('customize')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    )
  }

  if (selectedProduct) {
    if (isCustomizing) {
      return (
        <ProductCustomizer
          product={selectedProduct}
          onBack={() => {
            setIsCustomizing(false)
            const params = new URLSearchParams(searchParams.toString())
            params.delete('customize')
            params.set('productId', selectedProduct.id)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
          }}
        />
      )
    }

    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => {
          handleSelectProduct(null)
        }}
        onCustomize={() => {
          setIsCustomizing(true)
          const params = new URLSearchParams(searchParams.toString())
          params.delete('productId')
          params.set('customize', selectedProduct.id)
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }}
      />
    )
  }

  return <Home onCustomize={handleSelectProduct} />
}

export function Storefront() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      }
    >
      <StorefrontContent />
    </Suspense>
  )
}
