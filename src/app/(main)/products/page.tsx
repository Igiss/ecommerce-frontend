'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getProducts } from '@/lib/api/products.service'
import { getCategories } from '@/lib/api/categories.service'
import type { Product } from '@/types/product'
import { ProductCard } from '@/components/landing/ProductCard'
import {
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  RotateCcw,
  Tag,
  Star
} from 'lucide-react'

function ProductsCatalogContent() {
  const searchParams = useSearchParams()
  
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter States
  const [categories, setCategories] = useState<string[]>(['Tất cả'])
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc' | 'bestseller' | 'discount'>('newest')
  const [pricePreset, setPricePreset] = useState<'all' | 'under_500k' | '500k_2m' | '2m_5m' | 'above_5m' | 'custom'>('all')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [pageInput, setPageInput] = useState('')

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  // Fetch active categories dynamically from database
  useEffect(() => {
    getCategories('active')
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((c: any) => c.name)
          setCategories(['Tất cả', ...names])
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err)
      })
  }, [])

  // Sync state from query parameters
  const isSaleFilter = searchParams.get('sale') === 'true' || searchParams.get('sale') === '1'
  const isFeaturedFilter = searchParams.get('featured') === 'true' || searchParams.get('featured') === '1'
  const isRecommendedFilter = searchParams.get('recommended') === 'true' || searchParams.get('recommended') === '1'

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const sortParam = searchParams.get('sort')

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
    if (sortParam && ['newest', 'price_asc', 'price_desc', 'bestseller', 'discount'].includes(sortParam)) {
      setSortOption(sortParam as any)
    }
  }, [searchParams])

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
      .catch(() => {
        setError('Không thể tải danh sách sản phẩm.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Apply filters & sorting client-side
  useEffect(() => {
    let result = [...allProducts]

    // Special URL filters
    if (isSaleFilter) {
      result = result.filter((p) => (p.originalPrice && p.originalPrice > p.price) || (p.price && p.price < (p.originalPrice || 0)))
    }

    if (isFeaturedFilter) {
      result = result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
    }

    // Category Filter
    if (selectedCategory !== 'Tất cả') {
      result = result.filter((p: any) => {
        const catName = typeof p.category === 'object' ? p.category?.name : (p.category || p.categoryId?.name)
        if (!catName) return false
        return catName.toLowerCase() === selectedCategory.toLowerCase()
      })
    }

    // In-Page Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    // Price Range Filter
    if (pricePreset === 'under_500k') {
      result = result.filter((p) => p.price < 500000)
    } else if (pricePreset === '500k_2m') {
      result = result.filter((p) => p.price >= 500000 && p.price <= 2000000)
    } else if (pricePreset === '2m_5m') {
      result = result.filter((p) => p.price > 2000000 && p.price <= 5000000)
    } else if (pricePreset === 'above_5m') {
      result = result.filter((p) => p.price > 5000000)
    } else if (pricePreset === 'custom') {
      const min = minPrice ? parseFloat(minPrice) : 0
      const max = maxPrice ? parseFloat(maxPrice) : Infinity
      result = result.filter((p) => p.price >= min && p.price <= max)
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 4.5) >= minRating)
    }

    // Sorting Logic
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortOption === 'bestseller') {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
    } else if (sortOption === 'discount') {
      result.sort((a, b) => {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0
        return discB - discA
      })
    } else {
      // newest
      result.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())
    }

    setFilteredProducts(result)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, pricePreset, minPrice, maxPrice, minRating, sortOption, isSaleFilter, isFeaturedFilter, isRecommendedFilter, allProducts])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả')
    setSearchQuery('')
    setPricePreset('all')
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setSortOption('newest')
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const hasActiveFilters =
    selectedCategory !== 'Tất cả' ||
    searchQuery !== '' ||
    pricePreset !== 'all' ||
    minRating > 0 ||
    isSaleFilter ||
    isFeaturedFilter ||
    isRecommendedFilter

  const getPageTitle = () => {
    if (searchQuery) return `Kết quả tìm kiếm cho: "${searchQuery}"`
    if (isSaleFilter) return '⚡ Flash Sale - Danh sách sản phẩm đang giảm giá sâu'
    if (isFeaturedFilter) return '🔥 Danh sách sản phẩm Nổi bật & Bán chạy'
    if (isRecommendedFilter) return '🤖 Sản phẩm được gợi ý dành riêng cho bạn'
    if (selectedCategory !== 'Tất cả') return `Danh mục: ${selectedCategory}`
    return 'Tất cả sản phẩm'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Title */}
      <div className="mb-6 border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Tìm thấy <span className="font-extrabold text-amber-900">{filteredProducts.length}</span> sản phẩm phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden lg:block space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs shrink-0">
          {/* In-Page Search Bar */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-amber-700" />
              Tìm kiếm sản phẩm
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full rounded-xl border border-stone-300 pl-3.5 pr-8 py-2 text-xs focus:border-amber-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <hr className="border-stone-150" />

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-amber-700" />
              Lọc theo danh mục
            </h3>
            <div className="flex flex-col gap-1.5">
              {(isExpanded ? categories : categories.slice(0, 6)).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    const params = new URLSearchParams(window.location.search)
                    if (cat === 'Tất cả') params.delete('category')
                    else params.set('category', cat)
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
                  }}
                  className={`text-left rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white shadow-sm'
                      : 'text-stone-650 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {categories.length > 6 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-left px-3 py-1.5 text-xs font-extrabold text-amber-800 hover:text-amber-950 flex items-center gap-1 focus:outline-none transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Thu gọn <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Xem thêm ({categories.length - 6}) <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <hr className="border-stone-150" />

          {/* Price Range Filter */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-amber-700" />
              Lọc theo khoảng giá
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="pricePreset"
                  checked={pricePreset === 'all'}
                  onChange={() => setPricePreset('all')}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                Tất cả mức giá
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="pricePreset"
                  checked={pricePreset === 'under_500k'}
                  onChange={() => setPricePreset('under_500k')}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                Dưới 500.000đ
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="pricePreset"
                  checked={pricePreset === '500k_2m'}
                  onChange={() => setPricePreset('500k_2m')}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                500.000đ - 2.000.000đ
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="pricePreset"
                  checked={pricePreset === '2m_5m'}
                  onChange={() => setPricePreset('2m_5m')}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                2.000.000đ - 5.000.000đ
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="pricePreset"
                  checked={pricePreset === 'above_5m'}
                  onChange={() => setPricePreset('above_5m')}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                Trên 5.000.000đ
              </label>
            </div>

            {/* Custom Price Range Inputs */}
            <div className="mt-3 pt-3 border-t border-stone-150 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Nhập khoảng giá (đ)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    setPricePreset('custom')
                  }}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs focus:border-amber-600 focus:outline-none"
                />
                <span className="text-stone-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    setPricePreset('custom')
                  }}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs focus:border-amber-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-stone-150" />

          {/* Rating Filter */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Lọc theo đánh giá
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                Tất cả đánh giá
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === 5}
                  onChange={() => setMinRating(5)}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  ⭐⭐⭐⭐⭐ <span className="text-stone-700 font-medium">(5.0)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === 4}
                  onChange={() => setMinRating(4)}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  ⭐⭐⭐⭐ <span className="text-stone-700 font-medium">trở lên (≥ 4.0)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-stone-50 rounded-lg text-stone-700">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === 3}
                  onChange={() => setMinRating(3)}
                  className="text-amber-800 focus:ring-amber-600 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  ⭐⭐⭐ <span className="text-stone-700 font-medium">trở lên (≥ 3.0)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </aside>

        {/* MAIN PRODUCT AREA */}
        <div className="lg:col-span-3 space-y-6">
          {/* TOP TOOLBAR: Sort Dropdown & Active Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-2xl shadow-xs">
            {/* Active Filters Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-500 uppercase text-[11px]">Đang lọc:</span>
              {selectedCategory !== 'Tất cả' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => setSelectedCategory('Tất cả')} />
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {pricePreset !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  {pricePreset === 'under_500k' && 'Dưới 500k'}
                  {pricePreset === '500k_2m' && '500k - 2tr'}
                  {pricePreset === '2m_5m' && '2tr - 5tr'}
                  {pricePreset === 'above_5m' && 'Trên 5tr'}
                  {pricePreset === 'custom' && `${minPrice || 0}đ - ${maxPrice || '∞'}đ`}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => { setPricePreset('all'); setMinPrice(''); setMaxPrice(''); }} />
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  Từ {minRating}⭐ trở lên
                  <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => setMinRating(0)} />
                </span>
              )}

              {isSaleFilter && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 px-2.5 py-1 rounded-lg font-bold border border-red-200">
                  ⚡ Flash Sale
                </span>
              )}

              {!hasActiveFilters && (
                <span className="text-stone-400 italic">Mặc định</span>
              )}
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1 shrink-0">
                <ArrowUpDown className="h-3.5 w-3.5 text-amber-700" />
                Sắp xếp theo:
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:border-amber-600 focus:outline-none cursor-pointer"
              >
                <option value="newest">🆕 Mới nhất</option>
                <option value="price_asc">💵 Giá: Thấp đến Cao</option>
                <option value="price_desc">💎 Giá: Cao đến Thấp</option>
                <option value="bestseller">🔥 Bán chạy / Rating cao</option>
                <option value="discount">⚡ Giảm giá % nhiều nhất</option>
              </select>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col h-[340px] rounded-2xl border border-stone-200/60 bg-white p-3 shadow-sm animate-pulse">
                  <div className="aspect-square w-full rounded-xl bg-stone-200"></div>
                  <div className="mt-3 h-4 bg-stone-200 rounded w-3/4"></div>
                  <div className="mt-2 h-3 bg-stone-150 rounded w-1/2"></div>
                  <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div className="h-5 bg-stone-200 rounded w-1/3"></div>
                    <div className="h-8 w-8 bg-stone-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 rounded-2xl bg-red-50 text-red-700 border border-red-150">
              <p className="font-bold">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white p-8 space-y-4">
              <p className="text-stone-600 text-sm font-semibold">Không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại.</p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 text-white px-5 py-2.5 text-xs font-bold hover:bg-amber-900 transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Xóa bộ lọc & Thử lại
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <div key={product.id || (product as any)._id} className="h-full flex flex-col">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Đầu
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Sau
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Cuối
                  </button>

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
                          const val = parseInt(pageInput, 10);
                          if (!isNaN(val) && val >= 1 && val <= totalPages) {
                            setCurrentPage(val);
                          } else {
                            setPageInput(String(currentPage));
                          }
                        }
                      }}
                      className="w-12 h-9 rounded-xl border border-stone-200 bg-white text-center text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(pageInput, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                        } else {
                          setPageInput(String(currentPage));
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer active:scale-95 transition-all"
                    >
                      Đi
                    </button>
                  </div>
                </div>
              )}
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
