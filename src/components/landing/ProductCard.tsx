import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { ShoppingCart, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  onCustomize: (product: Product) => void
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  // Extract first image or use a beautiful Unsplash fallback cup photo
  const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product, 1)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/60 bg-white/60 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/30 hover:shadow-xl">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.modelUrl && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            3D Custom
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">
          {(product as any).category || 'Ly Cốc'}
        </span>
        <h3 className="mt-1 text-sm font-bold text-stone-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 flex-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Price & Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
          <span className="text-base font-extrabold text-amber-900">
            {product.price.toLocaleString('vi-VN')}đ
          </span>

          <div className="flex gap-1.5">
            {/* Quick add */}
            <button
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:border-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:outline-none"
              title="Thêm nhanh vào giỏ"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            {/* 3D Customizer */}
            {product.modelUrl && (
              <button
                onClick={() => onCustomize(product)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-800 px-3 text-xs font-bold text-white transition-colors hover:bg-amber-900 focus:outline-none"
              >
                Tự Thiết Kế
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
