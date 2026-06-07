'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { Product } from '@/types/product'
import { Home } from './Home'

const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  { ssr: false }
)

export function Storefront() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (selectedProduct) {
    return (
      <ProductCustomizer
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    )
  }

  return <Home onCustomize={setSelectedProduct} />
}
