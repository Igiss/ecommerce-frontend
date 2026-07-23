'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'
import { getPersonalizedProducts } from '@/lib/utils/user-history'
import { ProductCard } from './ProductCard'
import Link from 'next/link'
import { Sparkles, Compass, ThumbsUp, ChevronRight } from 'lucide-react'

interface PersonalizedRecommendationsProps {
  products: Product[]
}

export function PersonalizedRecommendations({ products }: PersonalizedRecommendationsProps) {
  const [recommendedItems, setRecommendedItems] = useState<Product[]>([])
  const [reasonText, setReasonText] = useState('')

  useEffect(() => {
    if (products && products.length > 0) {
      const res = getPersonalizedProducts(products, 4)
      setRecommendedItems(res.items)
      setReasonText(res.reason)
    }
  }, [products])

  if (recommendedItems.length === 0) return null

  return (
    <section className="py-14 bg-gradient-to-b from-amber-50/70 to-orange-50/30 border-b border-amber-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              Gợi ý cá nhân hóa
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-2 flex items-center gap-2">
              Dành Riêng Cho Bạn
              <ThumbsUp className="h-6 w-6 text-amber-600" />
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 flex items-center gap-1 font-medium">
              <Compass className="h-4 w-4 text-amber-700 shrink-0" />
              <span>{reasonText}</span>
            </p>
          </div>

          <Link
            href="/products?recommended=true"
            className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            Xem tất cả gợi ý
            <ChevronRight className="h-4 w-4 text-stone-500" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedItems.map((product) => (
            <div key={product.id || (product as any)._id} className="relative h-full flex flex-col">
              <span className="absolute top-3 right-3 z-20 bg-amber-800 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                Gợi ý 💡
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
