'use client'

import { useState } from 'react'
import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'
import { ArrowLeft, ShoppingCart, Sparkles, Plus, Minus, Heart, Share2 } from 'lucide-react'
import { ProductReviews } from '@/components/UI/ProductReviews'
import { getActivePrice } from '@/utils/price'

interface ProductDetailsProps {
  product: Product
  onBack?: () => void
  onCustomize?: () => void
}

export function ProductDetails({ product, onBack, onCustomize }: ProductDetailsProps) {
  const router = import('next/navigation').then(m => m.useRouter).catch(() => null)
  const addItem = useCartStore((state) => state.addItem)
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite)
  const isFavorite = useWishlistStore((state) => state.hasItem(product.id))
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState('')

  const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
  const stockQty = (product as any).stock ?? (product as any).countInStock ?? 0
  const isLowStock = stockQty < 5
  
  const activePrice = getActivePrice(product)
  const isSale = activePrice < product.price

  const handleAddToCart = () => {
    if (qty > stockQty) {
      setStatus('Số lượng vượt quá tồn kho hiện tại!')
      setTimeout(() => setStatus(''), 2000)
      return
    }
    addItem(product, qty)
    setStatus('Đã thêm vào giỏ hàng thành công!')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/products?search=${encodeURIComponent(product.name)}`
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setStatus('Đã sao chép liên kết chia sẻ sản phẩm!')
            setTimeout(() => setStatus(''), 2000)
          })
          .catch(() => {
            setStatus('Không thể sao chép liên kết!')
            setTimeout(() => setStatus(''), 2000)
          })
      } else {
        setStatus('Đã sao chép liên kết chia sẻ sản phẩm!')
        setTimeout(() => setStatus(''), 2000)
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => {
          if (onBack) onBack()
          else if (typeof window !== 'undefined') window.history.back()
        }}
        className="flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-200"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Quay lại cửa hàng
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Product Image Panel (Left) */}
        <div className="md:col-span-5 aspect-square w-full relative overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
          {product.modelUrl && (
            <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              3D Custom
            </span>
          )}
        </div>

        {/* Product Details Panel (Right) */}
        <div className="md:col-span-7 flex flex-col h-full justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              {(product as any).category || 'Ly Cốc'}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">
                {activePrice.toLocaleString('vi-VN')}đ
              </span>
              {isSale && (
                <span className="text-sm font-medium text-stone-400 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mô tả sản phẩm</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {product.description || 'Chưa có thông tin mô tả chi tiết cho chiếc cốc này.'}
              </p>
            </div>

            {/* Stock status */}
            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs text-stone-500">Trạng thái kho:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                stockQty === 0 
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : isLowStock 
                    ? 'bg-amber-50 text-amber-800 border border-amber-100'
                    : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                {stockQty === 0 
                  ? 'Hết hàng' 
                  : isLowStock 
                    ? `Sắp hết hàng (Còn ${stockQty} cốc)` 
                    : `Còn hàng (${stockQty} cốc)`
                }
              </span>
            </div>

            {/* Favorite & Share Buttons */}
            <div className="mt-3 flex items-center gap-2">
              {/* Wishlist Toggle Button */}
              <button
                onClick={() => toggleFavorite(product, !!useAuthStore.getState().user)}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-stone-600 shadow-xs cursor-pointer"
                title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart className={`h-4.5 w-4.5 transition-transform active:scale-95 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-stone-400'}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-stone-600 shadow-xs cursor-pointer"
                title="Chia sẻ sản phẩm"
              >
                <Share2 className="h-4 w-4 text-stone-400 hover:text-stone-600" />
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 border-t border-stone-100 pt-6 space-y-4">
            {stockQty > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-500 uppercase">Số lượng:</span>
                <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 text-stone-500 hover:text-stone-700 transition-colors"
                    disabled={qty <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-stone-850">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => Math.min(stockQty, prev + 1))}
                    className="p-1.5 text-stone-500 hover:text-stone-700 transition-colors"
                    disabled={qty >= stockQty}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {status && (
              <p className={`text-xs font-bold ${status.includes('thành công') || status.includes('sao chép') ? 'text-green-700' : 'text-red-700'}`}>
                {status}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={stockQty === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-3 px-6 text-sm font-bold text-white shadow-md disabled:bg-stone-200 disabled:text-stone-400"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Thêm vào giỏ hàng
              </button>

              {/* Design in 3D */}
              <button 
                onClick={() => {
                  if (onCustomize) onCustomize()
                  else if (typeof window !== 'undefined') window.location.href = `/custom?productId=${product?.id}`
                }}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-800 text-sm font-bold text-white transition-colors hover:bg-amber-900 focus:outline-none"
              >
                <Sparkles className="h-4.5 w-4.5 text-white" />
                Tự thiết kế 3D
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ProductReviews productId={product.id} />
    </div>
  )
}
