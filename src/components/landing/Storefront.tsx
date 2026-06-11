'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { Product } from '@/types/product'
import { Home } from './Home'
import { getProductById } from '@/lib/api/products.service'
import { ProductDetails } from '@/components/landing/ProductDetails'

const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  { ssr: false }
)

export function Storefront() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const customizeId = params.get('customize')
      const productId = params.get('productId') || params.get('id')

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
      } else if (productId) {
        getProductById(productId)
          .then((product) => {
            if (product) {
              const normalized = {
                ...product,
                id: product.id || (product as any)._id || (product as any).productId
              }
              setSelectedProduct(normalized)
              setIsCustomizing(false)
            }
          })
          .catch((err) => {
            console.error('Failed to load product details:', err)
          })
      }
    }
  }, [])

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (product) {
        url.searchParams.set('productId', product.id)
      } else {
        url.searchParams.delete('productId')
      }
      window.history.pushState({}, '', url.toString())
    }
  }

  if (selectedProduct) {
    if (isCustomizing) {
      return (
        <ProductCustomizer
          product={selectedProduct}
          onBack={() => {
            setIsCustomizing(false)
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('customize')
              url.searchParams.set('productId', selectedProduct.id)
              window.history.replaceState({}, '', url.toString())
            }
          }}
        />
      )
    }

    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => {
          handleSelectProduct(null)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('customize')
            url.searchParams.delete('productId')
            url.searchParams.delete('id')
            window.history.replaceState({}, '', url.toString())
          }
        }}
        onCustomize={() => {
          setIsCustomizing(true)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('productId')
            url.searchParams.set('customize', selectedProduct.id)
            window.history.pushState({}, '', url.toString())
          }
        }}
      />
    )
  }

  return <Home onCustomize={handleSelectProduct} />
}
