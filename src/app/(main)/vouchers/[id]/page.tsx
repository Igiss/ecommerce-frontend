'use client'

import { useEffect, useState, use } from 'react'
import { getActiveCoupons } from '@/lib/api/coupons.service'
import { Ticket, ChevronLeft, Copy, Check, Clock, Calendar, ShieldCheck, BadgeInfo, AlertCircle, ShoppingBag, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VoucherDetailPageProps {
  params: Promise<{ id: string }>
}

export default function VoucherDetailPage({ params }: VoucherDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    
    getActiveCoupons()
      .then((data) => {
        const coupons = Array.isArray(data) ? data : []
        const found = coupons.find(c => c._id === id || c.code === id)
        if (found) {
          setCoupon(found)
        } else {
          setError('Không tìm thấy thông tin chi tiết của voucher này.')
        }
      })
      .catch((err) => {
        console.error('Failed to load voucher detail:', err)
        setError('Có lỗi xảy ra khi lấy chi tiết voucher.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const calculateDaysLeft = (expiryDateStr: string) => {
    const now = new Date()
    const expiry = new Date(expiryDateStr)
    const diffTime = expiry.getTime() - now.getTime()
    if (diffTime <= 0) return 'Đã hết hạn'
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      return `Còn lại ${diffDays} ngày`
    }
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours > 0) {
      return `Còn lại ${diffHours} giờ`
    }
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    return `Còn lại ${diffMinutes} phút`
  }

  const handleCopyCode = () => {
    if (!coupon) return
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !coupon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-red-650">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Không tìm thấy voucher</h2>
        <p className="text-sm text-stone-500 mt-2">{error || 'Mã giảm giá không tồn tại hoặc đã hết hạn.'}</p>
        <Link
          href="/vouchers"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại Kho Voucher
        </Link>
      </div>
    )
  }

  const isPercentage = coupon.discountType === 'percentage'
  const daysLeftText = calculateDaysLeft(coupon.expiryDate)
  const isExpired = daysLeftText === 'Đã hết hạn'

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Back Link */}
      <Link
        href="/vouchers"
        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors text-xs font-bold mb-6"
      >
        <ChevronLeft className="h-4.5 w-4.5" />
        Quay lại Kho Voucher
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Ticket Header section */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-8 relative flex flex-col items-center justify-center text-center">
          <div className="absolute top-4 left-4 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
            <Ticket className="h-3 w-3" />
            Voucher của Cửa hàng
          </div>

          <span className="text-5xl font-black mt-4 tracking-tight">
            {isPercentage ? `${coupon.discountAmount}%` : formatPrice(coupon.discountAmount)}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest mt-2 bg-white/25 px-3 py-1 rounded-lg">
            Mã Giảm Giá Chi Tiết
          </span>

          {/* Ticket semi circles cutout */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 w-full justify-between px-10">
            <div className="h-6 w-6 bg-white rounded-full" />
            <div className="h-6 w-6 bg-white rounded-full" />
            <div className="h-6 w-6 bg-white rounded-full" />
          </div>
        </div>

        {/* Details section */}
        <div className="p-8 space-y-6 bg-amber-50/5">
          <div className="space-y-4">
            
            {/* Expiry remaining banner */}
            <div className={`flex items-center gap-2 rounded-2xl p-4 border text-xs font-bold ${
              isExpired 
                ? 'bg-red-50 text-red-700 border-red-150' 
                : 'bg-amber-100/40 text-amber-900 border-amber-200/50'
            }`}>
              <Clock className="h-4.5 w-4.5 text-amber-700 shrink-0" />
              <span>Thời gian hiệu lực: {daysLeftText}</span>
            </div>

            {/* Coupon Code display with Copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-stone-200/80 rounded-2xl bg-white p-4.5 shadow-3xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Mã code giảm giá</span>
                <span className="text-lg font-black text-amber-800 font-mono tracking-wide select-all">{coupon.code}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`w-full sm:w-auto py-2 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-amber-800 hover:bg-amber-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Sao chép mã
                  </>
                )}
              </button>
            </div>

            {/* Terms List */}
            <div className="bg-white rounded-2xl border border-stone-150 p-6 space-y-4">
              <h4 className="text-xs font-extrabold text-stone-850 uppercase tracking-wider border-b border-stone-100 pb-2">Điều kiện áp dụng</h4>
              
              <div className="space-y-3.5 text-xs text-stone-600 font-medium">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-stone-400 shrink-0">Giá trị đơn hàng</span>
                  <span className="text-stone-850 font-bold text-right">Đơn tối thiểu từ {formatPrice(coupon.minOrderValue)}</span>
                </div>
                
                {coupon.maxDiscount && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-stone-400 shrink-0">Mức giảm tối đa</span>
                    <span className="text-stone-850 font-bold text-right">{formatPrice(coupon.maxDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-start gap-4">
                  <span className="text-stone-400 shrink-0">Ngày hết hạn</span>
                  <span className="text-stone-850 font-bold text-right flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                    {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')} {new Date(coupon.expiryDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-stone-400 shrink-0">Cửa hàng áp dụng</span>
                  {coupon.ownerId ? (
                    typeof coupon.ownerId === 'object' && (coupon.ownerId.storeName || coupon.ownerId.fullName) ? (
                      <Link
                        href={`/store/${encodeURIComponent(coupon.ownerId.storeName || coupon.ownerId.fullName)}`}
                        className="font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1.5 text-right transition-colors text-xs"
                      >
                        <Store className="h-3.5 w-3.5 text-amber-700" />
                        {coupon.ownerId.storeName || coupon.ownerId.fullName}
                      </Link>
                    ) : (
                      <Link
                        href="/store"
                        className="font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1.5 text-right transition-colors text-xs"
                      >
                        <Store className="h-3.5 w-3.5 text-amber-700" />
                        Xem Cửa Hàng
                      </Link>
                    )
                  ) : (
                    <span className="text-stone-850 font-bold text-right flex items-center gap-1.5 text-xs">
                      <Store className="h-3.5 w-3.5 text-amber-700" />
                      Toàn sàn (Tất cả cửa hàng)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Support info note */}
            <div className="flex gap-2.5 p-4 rounded-2xl bg-stone-50 border border-stone-150 text-[10px] text-stone-500 leading-normal">
              <BadgeInfo className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>Voucher này có thể được áp dụng trực tiếp tại giỏ hàng hoặc chọn từ menu dropdown ở bước đặt hàng khi bạn đạt đủ giá trị đơn hàng tối thiểu. Mỗi mã có thể bị giới hạn số lượng sử dụng toàn hệ thống.</span>
            </div>

          </div>

          {/* Checkout action button */}
          <button
            onClick={() => {
              if (coupon?.ownerId && typeof coupon.ownerId === 'object' && (coupon.ownerId.storeName || coupon.ownerId.fullName)) {
                const storeSlug = encodeURIComponent(coupon.ownerId.storeName || coupon.ownerId.fullName)
                router.push(`/store/${storeSlug}`)
              } else {
                router.push('/products')
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-800 hover:bg-amber-900 transition-colors py-3.5 text-sm font-bold text-white shadow-md focus:outline-none cursor-pointer"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {coupon?.ownerId ? 'Sử dụng ngay (Đến Cửa hàng áp dụng)' : 'Sử dụng ngay (Khám phá Sản phẩm)'}
          </button>
        </div>
      </div>
    </div>
  )
}
