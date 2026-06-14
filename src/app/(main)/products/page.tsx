'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { getProducts } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from '@/components/landing/ProductCard'
import { ProductDetails } from '@/components/landing/ProductDetails'
import { Storefront } from '@/components/landing/Storefront'
import { Filter, Search, RefreshCw } from 'lucide-react'

const CATEGORIES = ['Tất cả', 'Ly sứ', 'Ly giữ nhiệt', 'Ly thủy tinh', 'Ly nhựa']

function ProductsCatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)

  // Sync state from query parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const productIdParam = searchParams.get('productId') || searchParams.get('id')

    if (categoryParam) {
      setSelectedCategory(categoryParam)
    } else {
      setSelectedCategory('Tất cả')
    }

    if (searchParam) {
      setSearchQuery(searchParam.toLowerCase())
    } else {
      setSearchQuery('')
    }

    if (productIdParam && allProducts.length > 0) {
      const found = allProducts.find(
        (p) =>
          String(p.id) === String(productIdParam) ||
          String((p as any)._id) === String(productIdParam)
      )
      if (found) {
        setSelectedProduct(found)
      } else {
        setSelectedProduct(null)
      }
    } else {
      setSelectedProduct(null)
    }
  }, [searchParams, allProducts])

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product)
    const params = new URLSearchParams(searchParams.toString())
    if (product) {
      params.set('productId', product.id)
    } else {
      params.delete('productId')
      params.delete('id')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Fetch all products
  useEffect(() => {
    setLoading(true)
    getProducts()
      .then((data: any) => {
        let list: Product[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            list = data.items
          } else if ('products' in data && Array.isArray(data.products)) {
            list = data.products
          }
        }

        const normalized = list.map((item: any) => ({
          ...item,
          id: item.id || item._id
        }))
        setAllProducts(normalized)
      })
      .catch((err) => {
        setError('Không thể tải danh sách sản phẩm.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Apply filters client-side
  useEffect(() => {
    let result = [...allProducts]

    if (selectedCategory !== 'Tất cả') {
      result = result.filter((p: any) => p.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.description.toLowerCase().includes(searchQuery)
      )
    }

    setFilteredProducts(result)
  }, [selectedCategory, searchQuery, allProducts])

  if (selectedProduct) {
    if (isCustomizing) {
      const ProductCustomizer = require('@/components/customizer/ProductCustomizer').default
      return (
        <ProductCustomizer
          product={selectedProduct}
          onBack={() => {
            setIsCustomizing(false)
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('customize')
              url.searchParams.set('productId', selectedProduct.id)
              window.history.replaceState({}, '', url.toString())
            }
          }}
        />
      )
    }

    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => {
          handleSelectProduct(null)
        }}
        onCustomize={() => {
          setIsCustomizing(true)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('productId')
            url.searchParams.set('customize', selectedProduct.id)
            window.history.pushState({}, '', url.toString())
          }
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-stone-200 pb-5">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : 'Tất cả sản phẩm'}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Tìm thấy {filteredProducts.length} sản phẩm phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden lg:block space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs shrink-0">
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-amber-700" />
              Lọc theo danh mục
            </h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    // Update URL params
                    const params = new URLSearchParams(window.location.search)
                    if (cat === 'Tất cả') params.delete('category')
                    else params.set('category', cat)
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
                  }}
                  className={`text-left rounded-lg px-3 py-2 text-xs font-bold transition-all focus:outline-none ${
                    selectedCategory === cat
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-amber-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filters (dropdown) */}
        <div className="lg:hidden flex flex-col gap-3 mb-6 bg-white border border-stone-200 p-4 rounded-2xl">
          <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-amber-700" />
            Chọn danh mục sản phẩm
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              const params = new URLSearchParams(window.location.search)
              if (e.target.value === 'Tất cả') params.delete('category')
              else params.set('category', e.target.value)
              window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
            }}
            className="w-full rounded-lg border border-stone-350 bg-stone-50/50 p-2 text-xs focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex py-20 justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-800" />
            </div>
          ) : error ? (
            <div className="text-center py-16 rounded-2xl bg-red-50 text-red-700 border border-red-150">
              <p className="font-bold">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
              <p className="text-stone-550 text-sm">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCustomize={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  )
}
