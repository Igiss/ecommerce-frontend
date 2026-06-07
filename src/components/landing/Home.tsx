import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'

interface HomeProps {
  onCustomize: (product: Product) => void
}

export function Home({ onCustomize }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
  }, [])

  return (
    <div className="container">
      <h1>Cup Shop</h1>
      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onCustomize={onCustomize}
          />
        ))}
      </div>
    </div>
  )
}
