'use client'

import { useState, useEffect } from 'react'
import { useWishlistStore } from '@/store/wishlist.store'
import { ProductCard } from '@/components/landing/ProductCard'
import { Heart, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((state) => state.items)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    )
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            Sản phẩm yêu thích
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Danh sách các mẫu ly cốc bạn yêu thích và lưu lại.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-850 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại cửa hàng
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20 max-w-xl mx-auto px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 shadow-inner">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Danh sách yêu thích trống</h3>
          <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Hãy khám phá các sản phẩm ly sứ, cốc giữ nhiệt độc đáo của chúng tôi và nhấn nút Trái tim để lưu lại tại đây!
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-2.5 px-6 text-xs font-bold text-white shadow-md cursor-pointer"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  )
}
