'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'
import Link from 'next/link'
import { Zap, Clock, Flame, Percent, ChevronRight, ShoppingCart, Heart, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'
import { getActivePrice } from '@/utils/price'
import { trackProductView } from '@/lib/utils/user-history'

interface FlashSaleSectionProps {
  products: Product[]
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { hasItem, toggleFavorite } = useWishlistStore()
  const isAuthenticated = useAuthStore((state) => !!state.user)

  // Flash sale countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate discount percentage & filter ONLY deep sale products
  const discountedProducts = (products || [])
    .map((p) => {
      const activePrice = getActivePrice(p)
      const rawOrig = (p as any).originalPrice
      const orig = rawOrig && rawOrig > activePrice ? rawOrig : Math.round(activePrice * 1.28)
      const discountPercent = Math.round(((orig - activePrice) / orig) * 100)
      return { product: { ...p, price: activePrice, originalPrice: orig }, discountPercent }
    })
    .filter((item) => item.discountPercent >= 10)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 4)

  if (discountedProducts.length === 0) return null

  return (
    <section className="relative overflow-hidden py-14 bg-[#121212] border-y border-stone-800/80 text-white font-sans">
      {/* Ambient Red/Orange Glowing Orbs */}
      <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-600/15 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" />
      <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-amber-500/10 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER & COUNTDOWN & VIEW ALL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-stone-800/80">
          {/* Title & Badge */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/40 rounded-2xl text-orange-400 shadow-[0_0_15px_rgba(255,77,0,0.25)]">
              <Zap className="h-7 w-7 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  ⚡ GIỜ VÀNG GIÁ SỐC
                </span>
                <span className="flex items-center gap-1 text-[11px] text-red-400 font-extrabold uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-bounce" /> SALE SÂU
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                FLASH SALE GIA DỤNG 24H
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Countdown Clock */}
            <div className="flex items-center gap-3 bg-[#1E1E24]/90 border border-[#33333E] p-2.5 sm:p-3 rounded-2xl backdrop-blur-md shadow-lg">
              <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-orange-400 animate-spin-slow" />
              <span className="text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider">Kết thúc sau:</span>
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black">
                <span className="bg-gradient-to-b from-red-500 to-red-700 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-red-400/40">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-orange-400 font-black">:</span>
                <span className="bg-gradient-to-b from-red-500 to-red-700 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-red-400/40">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-orange-400 font-black">:</span>
                <span className="bg-gradient-to-b from-red-500 to-red-700 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-red-400/40">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* See All Sale Products Link */}
            <Link
              href="/products?sale=true"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-950/40 transition-all active:scale-95 cursor-pointer border border-orange-400/30"
            >
              Xem tất cả Sale
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* PRODUCTS GRID (GLASSMORPHIC CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map(({ product, discountPercent }, idx) => {
            const isLiked = hasItem(String(product.id))
            const soldPercent = Math.min(96, 74 + (idx * 7) % 20)
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

            return (
              <div
                key={product.id || (product as any)._id}
                className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-[#33333E] bg-[#1E1E24]/85 p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/50 hover:shadow-[0_10px_30px_rgba(255,77,0,0.18)]"
              >
                {/* Top Discount Badge */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-0.5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg border border-red-400/50 animate-pulse">
                  <Percent className="h-3 w-3" />
                  <span>GIẢM {discountPercent}%</span>
                </div>

                <Link
                  href={`/products/${product.slug || product.id}`}
                  onClick={handleCardClick}
                  className="flex flex-col h-full justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-900/80 border border-stone-800/80 shrink-0">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.modelUrl && (
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        3D Custom
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col pt-3 pb-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                        {(product as any).category || 'Gia Dụng'}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed min-h-[2.25rem]">
                        {product.description || 'Sản phẩm gia dụng nhà bếp cao cấp chính hãng Gia Dụng 24h.'}
                      </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-800/80 pt-2.5 shrink-0">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-amber-400">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-stone-500 line-through">
                            {product.originalPrice.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Wishlist Button */}
                        <button
                          onClick={handleToggleFavorite}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all hover:scale-105 focus:outline-none cursor-pointer ${
                            isLiked
                              ? 'border-red-500/60 bg-red-950/60 text-red-400 shadow-sm'
                              : 'border-stone-700 bg-stone-900/80 text-stone-400 hover:border-red-500/50 hover:text-red-400 hover:bg-stone-800'
                          }`}
                          title={isLiked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
                        </button>

                        {/* Quick Add Cart Button */}
                        <button
                          onClick={handleAddToCart}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-700 bg-stone-900/80 text-stone-300 transition-colors hover:border-amber-500 hover:bg-amber-600 hover:text-white focus:outline-none cursor-pointer"
                          title="Thêm nhanh vào giỏ"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Integrated Stock Deal Progress Bar INSIDE Card */}
                    <div className="mt-3 bg-stone-950/90 border border-stone-800/80 p-2.5 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-300 mb-1">
                        <span className="flex items-center gap-1 text-red-400 font-extrabold">
                          <Flame className="h-3 w-3 fill-red-500 animate-pulse" /> Sắp cháy hàng
                        </span>
                        <span className="text-amber-300 font-extrabold">Đã bán {soldPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,77,0,0.6)]"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
