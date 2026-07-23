import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'
import { ShoppingCart, Sparkles, Heart } from 'lucide-react'
import Image from 'next/image'
import { getActivePrice } from '@/utils/price'

import { trackProductView } from '@/lib/utils/user-history'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { hasItem, toggleFavorite } = useWishlistStore()
  const isAuthenticated = useAuthStore((state) => !!state.user)
  
  const isLiked = hasItem(String(product.id))

  // Extract first image or use a beautiful Unsplash fallback photo
  const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=60'

  const handleCardClick = () => {
    trackProductView(product)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product, isAuthenticated)
  }

  const activePrice = getActivePrice(product);
  const isSale = activePrice < product.price;

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-stone-200/60 bg-white/60 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/30 hover:shadow-xl cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
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
      <div className="flex flex-1 flex-col pt-3 pb-1 justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">
            {(product as any).category || 'Gia Dụng'}
          </span>
          <h3 className="mt-1 text-sm font-bold text-stone-900 line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {product.description || 'Sản phẩm gia dụng nhà bếp cao cấp chính hãng Gia Dụng 24h.'}
          </p>
        </div>
        
        {/* Price & Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5 shrink-0">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-amber-900">
              {activePrice.toLocaleString('vi-VN')}đ
            </span>
            {isSale && (
              <span className="text-[10px] text-stone-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Wishlist Button (Bên trái nút Giỏ hàng) */}
            <button
              onClick={handleToggleFavorite}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 focus:outline-none cursor-pointer ${
                isLiked
                  ? 'border-red-200 bg-red-50 text-red-500 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50/50'
              }`}
              title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
            </button>

            {/* Quick Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:border-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:outline-none cursor-pointer"
              title="Thêm nhanh vào giỏ"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            {/* 3D Customizer */}
            {product.modelUrl && (
              <div
                className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-800 px-3 text-xs font-bold text-white transition-colors hover:bg-amber-900"
              >
                Tự Thiết Kế
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
