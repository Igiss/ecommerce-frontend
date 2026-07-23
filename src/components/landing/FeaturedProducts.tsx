'use client'

import { useState } from 'react'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import Link from 'next/link'
import { Star, Award, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'toprated' | 'new'>('bestseller')

  if (!products || products.length === 0) return null

  // Filter products based on tab
  let displayed = [...products]
  if (activeTab === 'bestseller') {
    displayed = displayed.slice(0, 4)
  } else if (activeTab === 'toprated') {
    displayed = [...displayed].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5)).slice(0, 4)
  } else if (activeTab === 'new') {
    displayed = [...displayed].reverse().slice(0, 4)
  }

  return (
    <section className="py-14 bg-white border-b border-stone-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-stone-150 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-900">
              <Award className="h-3.5 w-3.5 text-orange-600" />
              Bộ Sưu Tập Độc Quyền
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Sản Phẩm Nổi Bật Gia Dụng 24h
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                onClick={() => setActiveTab('bestseller')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'bestseller'
                    ? 'bg-amber-800 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Bán chạy nhất
              </button>

              <button
                onClick={() => setActiveTab('toprated')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'toprated'
                    ? 'bg-amber-800 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                Đánh giá 5★
              </button>

              <button
                onClick={() => setActiveTab('new')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'new'
                    ? 'bg-amber-800 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Mới về
              </button>
            </div>

            {/* See All Button */}
            <Link
              href="/products?featured=true"
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4 text-stone-500" />
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayed.map((product) => (
            <div key={product.id || (product as any)._id} className="relative h-full flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
