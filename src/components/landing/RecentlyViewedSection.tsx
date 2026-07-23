'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'
import { getRecentlyViewedProducts } from '@/lib/utils/user-history'
import { ProductCard } from './ProductCard'
import { Eye, History } from 'lucide-react'

interface RecentlyViewedSectionProps {
  products: Product[]
}

export function RecentlyViewedSection({ products }: RecentlyViewedSectionProps) {
  const [recentItems, setRecentItems] = useState<Product[]>([])

  useEffect(() => {
    if (products && products.length > 0) {
      const list = getRecentlyViewedProducts(products, 4)
      setRecentItems(list)
    }
  }, [products])

  if (recentItems.length === 0) return null

  return (
    <section className="py-12 bg-stone-100/60 border-t border-stone-250">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              Sản phẩm bạn đã xem gần đây
            </h2>
            <p className="text-xs text-stone-550">Xem lại các thiết bị gia dụng nhà bếp bạn quan tâm trong phiên vừa rồi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((product) => (
            <div key={product.id || (product as any)._id} className="h-full flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
