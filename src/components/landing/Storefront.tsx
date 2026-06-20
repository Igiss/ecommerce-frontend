'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { Product } from '@/types/product'
import { Home } from './Home'
import { getProductById } from '@/lib/api/products.service'

const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  { ssr: false }
)

export function Storefront() {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const customizeId = params.get('customize')

      if (customizeId) {
        getProductById(customizeId)
          .then((product) => {
            if (product) {
              const normalized = {
                ...product,
                id: product.id || (product as any)._id || (product as any).productId
              }
              setSelectedProduct(normalized)
              setIsCustomizing(true)
            }
          })
          .catch((err) => {
            console.error('Failed to load product for customizer:', err)
          })
      }
    }
  }, [])

  if (selectedProduct && isCustomizing) {
    return (
      <ProductCustomizer
        product={selectedProduct}
        onBack={() => {
          setIsCustomizing(false)
          setSelectedProduct(null)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('customize')
            window.history.replaceState({}, '', url.toString())
          }
        }}
      />
    )
  }

  return <Home />
}
