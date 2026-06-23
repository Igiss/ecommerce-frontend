'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getProducts } from '@/lib/api/products.service'
import { getCategories } from '@/lib/api/categories.service'
import type { Product } from '@/types/product'
import { ProductCard } from '@/components/landing/ProductCard'
import { Filter, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

function ProductsCatalogContent() {
  const searchParams = useSearchParams()
  
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState<string[]>(['Tất cả'])
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
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
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')

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
      .catch((err) => {
        setError('Không thể tải danh sách sản phẩm.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Apply filters client-side and reset page
  useEffect(() => {
    let result = [...allProducts]

    if (selectedCategory !== 'Tất cả') {
      result = result.filter((p: any) => {
        const catName = typeof p.category === 'object' ? p.category?.name : (p.category || p.categoryId?.name);
        if (!catName) return false;
        return catName.toLowerCase() === selectedCategory.toLowerCase();
      })
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.description.toLowerCase().includes(searchQuery)
      )
    }

    setFilteredProducts(result)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, allProducts])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)



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
              {(isExpanded ? categories : categories.slice(0, 6)).map((cat) => (
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

              {categories.length > 6 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-left px-3 py-2 text-xs font-extrabold text-amber-805 hover:text-amber-950 flex items-center gap-1.5 focus:outline-none transition-colors cursor-pointer"
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
            {categories.map((cat) => (
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
                  {/* First Page Button */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                    title="Trang đầu tiên"
                  >
                    Đầu
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Trước
                  </button>

                  {/* Page Number Buttons */}
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

                  {/* Next Page Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  >
                    Sau
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                    title="Trang cuối cùng"
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
