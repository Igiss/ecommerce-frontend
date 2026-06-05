import React, { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'

export default function Home({ onCustomize }) {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
  }, [])

  return (
    <div className="container">
      <h1>Cup Shop</h1>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onCustomize={onCustomize} />
        ))}
      </div>
    </div>
  )
}
