'use client'

import { useEffect, useState } from 'react'
import { getActiveCoupons } from '@/lib/api/coupons.service'
import { Ticket, Loader2, AlertCircle, Eye, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'

export default function VouchersListPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, expired
  const [typeFilter, setTypeFilter] = useState('all') // all, percentage, fixed
  const [minOrderFilter, setMinOrderFilter] = useState('all') // all, under200, 200to500, over500
  const [sortBy, setSortBy] = useState('newest') // newest, expiry_asc, expiry_desc

  useEffect(() => {
    getActiveCoupons()
      .then((data) => {
        setCoupons(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('Failed to load vouchers:', err)
        setError('Không thể tải danh sách voucher.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setMinOrderFilter('all')
    setSortBy('newest')
  }

  // Filter & Sort coupons
  const filteredCoupons = coupons
    .filter((coupon) => {
      // Search by code
      if (searchQuery.trim() && !coupon.code.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false
      }

      // Status
      const isExpired = new Date(coupon.expiryDate) < new Date()
      if (statusFilter === 'active' && isExpired) return false
      if (statusFilter === 'expired' && !isExpired) return false

      // Discount type
      if (typeFilter === 'percentage' && coupon.discountType !== 'percentage') return false
      if (typeFilter === 'fixed' && coupon.discountType !== 'fixed') return false

      // Min order value
      if (minOrderFilter === 'under200' && coupon.minOrderValue >= 200000) return false
      if (minOrderFilter === '200to500' && (coupon.minOrderValue < 200000 || coupon.minOrderValue > 500000)) return false
      if (minOrderFilter === 'over500' && coupon.minOrderValue <= 500000) return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
      if (sortBy === 'expiry_asc') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      }
      if (sortBy === 'expiry_desc') {
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
      }
      return 0
    })

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || minOrderFilter !== 'all' || sortBy !== 'newest'

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="bg-white rounded-3xl border border-stone-200/60 p-4 sm:p-6 md:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="border-b border-stone-100 pb-5">
          <h1 className="text-2xl font-black text-stone-905 flex items-center gap-2.5">
            <Ticket className="h-7 w-7 text-amber-700 animate-pulse" />
            Kho Voucher Khuyến Mãi
          </h1>
          <p className="text-xs text-stone-500 mt-2 font-medium">
            Khám phá các ưu đãi đặc biệt từ các chủ cửa hàng (Owner) của CupShop. Chọn mã giảm giá phù hợp để áp dụng cho đơn hàng của bạn.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-stone-50/75 rounded-2xl border border-stone-200/60 p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm voucher theo mã (ví dụ: SUMMER26...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-2.5 text-sm bg-white focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-stone-400"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white font-medium focus:border-amber-600 focus:outline-none text-stone-800 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="expiry_asc">Hạn dùng gần nhất</option>
                <option value="expiry_desc">Hạn dùng xa nhất</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-550 uppercase tracking-wider shrink-0 mr-1">
              <SlidersHorizontal className="h-4 w-4 text-amber-700" />
              Bộ lọc:
            </div>

            {/* Filter by Status */}
            <div className="w-full sm:w-auto sm:min-w-[120px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-amber-600 text-stone-700 cursor-pointer"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="active">Còn hạn dùng</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>

            {/* Filter by Type */}
            <div className="w-full sm:w-auto sm:min-w-[140px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-amber-600 text-stone-700 cursor-pointer"
              >
                <option value="all">Mọi loại giảm</option>
                <option value="percentage">Giảm theo %</option>
                <option value="fixed">Giảm số tiền cố định</option>
              </select>
            </div>

            {/* Filter by Price (Min Order Value) */}
            <div className="w-full sm:w-auto sm:min-w-[160px]">
              <select
                value={minOrderFilter}
                onChange={(e) => setMinOrderFilter(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-amber-600 text-stone-700 cursor-pointer"
              >
                <option value="all">Mọi điều kiện đơn</option>
                <option value="under200">Đơn dưới 200k</option>
                <option value="200to500">Đơn từ 200k - 500k</option>
                <option value="over500">Đơn trên 500k</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-650 hover:text-red-750 hover:underline px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-150">
            <AlertCircle className="h-5 w-5 text-red-650 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-9 w-9 animate-spin text-amber-700" />
              <span className="text-sm text-stone-500 font-medium">Đang tải danh sách voucher...</span>
            </div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center bg-stone-50/20 border border-stone-200/50 border-dashed rounded-3xl">
            <Ticket className="h-14 w-14 text-stone-300 mx-auto mb-4" />
            <p className="text-base text-stone-650 font-bold">Không tìm thấy voucher nào phù hợp</p>
            <p className="text-xs text-stone-400 mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-5 py-2 text-xs font-bold shadow transition-all cursor-pointer"
              >
                Khôi phục bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => {
              const isPercentage = coupon.discountType === 'percentage'
              const isExpired = new Date(coupon.expiryDate) < new Date()
              
              return (
                <div 
                  key={coupon._id} 
                  className={`flex border rounded-2xl bg-amber-50/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow relative ${
                    isExpired ? 'border-red-200/55 bg-red-500/[0.01]' : 'border-amber-200/50'
                  }`}
                >
                  {/* Left part of ticket */}
                  <div className={`w-24 flex flex-col items-center justify-center text-white p-3 shrink-0 relative ${
                    isExpired ? 'bg-gradient-to-br from-stone-500 to-stone-600' : 'bg-gradient-to-br from-amber-700 to-amber-800'
                  }`}>
                    <span className="text-2xl font-black">
                      {isPercentage ? `${coupon.discountAmount}%` : `${coupon.discountAmount / 1000}k`}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 bg-white/20 px-1.5 py-0.5 rounded-sm">
                      GIẢM
                    </span>
                    
                    {/* Ticket circle cutouts */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-2 h-4 w-4 bg-white rounded-full border-r border-amber-200/20" />
                  </div>

                  {/* Divider line */}
                  <div className="border-r-2 border-dashed border-stone-200 h-full relative">
                    <div className="absolute -top-2 -left-1.5 h-3 w-3 bg-white rounded-full border border-stone-200" />
                    <div className="absolute -bottom-2 -left-1.5 h-3 w-3 bg-white rounded-full border border-stone-200" />
                  </div>

                  {/* Right part of ticket */}
                  <div className="flex-1 p-5 flex flex-col justify-between gap-4 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-stone-850 truncate">
                          Mã: <span className="text-amber-800">{coupon.code}</span>
                        </span>
                        {isExpired && (
                          <span className="text-[9px] font-black uppercase bg-red-100 text-red-750 px-1.5 py-0.5 rounded-md border border-red-200/40">
                            Hết hạn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 font-semibold">
                        Đơn tối thiểu: <span className="font-bold text-stone-800">{formatPrice(coupon.minOrderValue)}</span>
                      </p>
                      {coupon.maxDiscount && (
                        <p className="text-xs text-stone-500 font-semibold">
                          Giảm tối đa: <span className="font-bold text-stone-800">{formatPrice(coupon.maxDiscount)}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-t border-stone-100/50 pt-3 shrink-0">
                      <span className="text-[10px] text-stone-400 font-semibold">
                        HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                      
                      <Link
                        href={`/vouchers/${coupon._id}`}
                        className="text-xs font-bold py-1.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow w-full sm:w-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
