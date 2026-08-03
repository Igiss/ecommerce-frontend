'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductsByStoreName } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from '@/components/landing/ProductCard'
import { ArrowLeft, Store, Mail, Phone, ShoppingBag, Sparkles, RefreshCw, Search, X } from 'lucide-react'

export default function StoreProfilePage() {
  const params = useParams()
  const router = useRouter()
  
  const shopNameUrl = params.shopName as string

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search, filter & pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const itemsPerPage = 8

  useEffect(() => {
    if (!shopNameUrl) return

    setLoading(true)
    const decodedShopName = decodeURIComponent(shopNameUrl)

    getProductsByStoreName(decodedShopName)
      .then((data) => {
        setProducts(data)
        setError('')
      })
      .catch((err) => {
        console.error('Failed to fetch store products:', err)
        setError('Không thể tải danh sách sản phẩm của cửa hàng. Vui lòng thử lại.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [shopNameUrl])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setPageInput('1')
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  // Helper to safely extract category name
  const getProdCatName = (p: Product): string => {
    const cat = p.categoryId || p.category
    if (typeof cat === 'object' && cat !== null) return cat.name || ''
    if (typeof cat === 'string') return cat
    return ''
  }

  // Extract categories dynamically from store products
  const storeCategories = [
    'Tất cả',
    ...Array.from(
      new Set(
        products
          .map(getProdCatName)
          .filter(Boolean)
      )
    )
  ]

  // Get total count per category
  const getCategoryProductCount = (catName: string) => {
    if (catName === 'Tất cả') return products.length
    return products.filter((p) => getProdCatName(p) === catName).length
  }

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      getProdCatName(p) === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Extract owner info from the first product
  const sampleProduct = products[0]
  const shopName = (sampleProduct as any)?.createdBy?.fullName || decodeURIComponent(shopNameUrl || '') || 'Chủ cửa hàng'
  const storeName = (sampleProduct as any)?.createdBy?.storeName || shopName
  const storeEmail = (sampleProduct as any)?.createdBy?.email || ''
  const storePhone = (sampleProduct as any)?.createdBy?.storePhone || ''

  return (
    <div className="pt-24 pb-16 bg-stone-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Breadcrumb Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50 transition-all active:scale-95 cursor-pointer focus:outline-none w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Cửa hàng</span>
            <span>/</span>
            <span className="text-amber-800/80">{storeName}</span>
          </div>
        </div>

        {/* Store Banner Profile Card */}
        <div className="relative overflow-hidden bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          {/* Background Decorative Blur Orbs */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-400/5 blur-2xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Store Avatar */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-amber-100 to-amber-250 flex items-center justify-center text-amber-900 border border-amber-300/30 shadow-md font-black text-2xl sm:text-3xl shrink-0">
                {storeName.charAt(0).toUpperCase()}
              </div>

              {/* Store Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-700 shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {storeName}
                  </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-550 font-semibold">
                  {storeEmail && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {storeEmail}
                    </span>
                  )}
                  {storePhone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {storePhone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Statistics Badges */}
            <div className="flex flex-wrap gap-3.5 border-t border-stone-100 pt-4 md:border-t-0 md:pt-0 shrink-0">
              <div className="bg-stone-50 border border-stone-150 rounded-2xl px-5 py-3 text-center min-w-[100px] shadow-3xs">
                <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider mb-0.5">Sản phẩm</p>
                <p className="text-lg font-black text-amber-900 flex items-center justify-center gap-1">
                  <ShoppingBag className="h-4.5 w-4.5 text-amber-700 shrink-0" />
                  {loading ? '...' : products.length}
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-150 rounded-2xl px-5 py-3 text-center min-w-[100px] shadow-3xs">
                <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider mb-0.5">Đánh giá</p>
                <p className="text-lg font-black text-amber-900 flex items-center justify-center gap-1">
                  <Sparkles className="h-4.5 w-4.5 text-amber-700 shrink-0" />
                  5.0 ★
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        {!loading && !error && products.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-5 mb-8 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm trong cửa hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-700 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="text-xs text-stone-500 font-bold shrink-0">
                Hiển thị {filteredProducts.length} trên {products.length} sản phẩm
              </div>
            </div>

            {/* Category Pills Filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              {storeCategories.map((cat) => {
                const isActive = selectedCategory === cat
                const count = getCategoryProductCount(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-3xs cursor-pointer ${
                      isActive
                        ? 'bg-amber-850 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    {cat} <span className={`ml-1 text-[10px] opacity-75 font-extrabold`}>({count})</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-150 text-red-700 px-6 py-4 rounded-2xl text-sm font-semibold flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Thử lại
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-stone-100 rounded-2xl w-full" />
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-5 bg-stone-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Products Listing Grid */}
        {!loading && !error && (
          <>
            {paginatedProducts.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
                    {/* First Page Button */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                      title="Trang đầu"
                    >
                      Đầu
                    </button>

                    {/* Previous Page Button */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                    >
                      Trước
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                          currentPage === page
                            ? 'bg-amber-850 text-white shadow-xs'
                            : 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Page Button */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                    >
                      Sau
                    </button>

                    {/* Last Page Button */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                      title="Trang cuối"
                    >
                      Cuối
                    </button>

                    {/* Jump to Page Input */}
                    <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-4">
                      <span className="text-xs text-stone-500">Đến trang:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(pageInput, 10)
                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                              setCurrentPage(val)
                            }
                          }
                        }}
                        className="w-12 h-9 text-center text-xs font-bold border border-stone-200 rounded-xl focus:outline-none focus:border-amber-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                <div className="h-16 w-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-7 w-7 text-stone-400" />
                </div>
                <h3 className="text-base font-black text-stone-850 mb-1.5">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-stone-400 font-semibold mb-6">
                  {products.length > 0 
                    ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc tìm kiếm.'
                    : 'Cửa hàng này hiện chưa đăng bán sản phẩm nào lên hệ thống.'
                  }
                </p>
                {(searchQuery || selectedCategory !== 'Tất cả') ? (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('Tất cả')
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-850 hover:bg-amber-900 text-xs font-bold text-white px-6 transition-all duration-200 shadow-sm active:scale-98 cursor-pointer focus:outline-none"
                  >
                    Xóa bộ lọc
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/')}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-800 hover:bg-amber-900 text-xs font-bold text-white px-6 transition-all duration-200 shadow-sm active:scale-98 cursor-pointer focus:outline-none"
                  >
                    Quay lại Trang chủ
                  </button>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
