'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'
import { getSuggestedProducts } from '@/lib/api/products.service'
import { useDebounce } from '@/hooks/useDebounce'
import type { Product } from '@/types/product'

export function SmartSearch({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 400)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    
    getSuggestedProducts(debouncedQuery.trim())
      .then((data) => {
        if (isMounted) {
          setSuggestions(data || [])
        }
      })
      .catch((err) => {
        console.error('Lỗi khi lấy gợi ý tìm kiếm:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [debouncedQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowDropdown(false)
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSelectProduct = (product: Product) => {
    setShowDropdown(false)
    router.push(`/products/${product.slug || product.id}`)
    setSearchQuery('')
  }

  const handleFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowDropdown(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim().length >= 2) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  return (
    <div className={`relative ${isMobile ? 'w-full mb-3' : 'hidden lg:block'}`} ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm ly sứ (AI)..."
            value={searchQuery}
            onFocus={handleFocus}
            onChange={handleInputChange}
            className={`w-full rounded-full border border-stone-200 bg-stone-100/50 py-1.5 pl-4 pr-10 text-xs transition-all placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none ${!isMobile ? 'lg:w-48 focus:lg:w-72' : ''}`}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {/* AI Suggestion Dropdown */}
      {showDropdown && (debouncedQuery.trim().length >= 2) && (
        <div className={`absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 ${!isMobile ? 'w-[350px] lg:-right-4 lg:left-auto' : ''}`}>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Gợi ý thông minh (AI)
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading && suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <Loader2 className="h-5 w-5 animate-spin mb-2 text-amber-600" />
                <span className="text-xs">Đang tìm kiếm...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectProduct(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 flex items-start gap-3 transition-colors border-b border-stone-50 last:border-0"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-100">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-amber-600 font-extrabold mt-0.5">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500">
                Không tìm thấy sản phẩm phù hợp
              </div>
            )}
          </div>
          
          <div className="bg-stone-50 p-2 text-center border-t border-stone-100">
            <button 
              onClick={handleSearchSubmit}
              className="text-[10px] font-bold text-amber-700 hover:text-amber-900"
            >
              Xem tất cả kết quả cho "{searchQuery}"
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
