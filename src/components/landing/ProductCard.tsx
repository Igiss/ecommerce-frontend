import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  onCustomize: (product: Product) => void
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong>${product.price}</strong>
      <button className="primary-btn" onClick={() => onCustomize(product)}>
        Customize
      </button>
    </div>
  )
}
