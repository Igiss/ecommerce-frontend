'use client'

import { useEffect, useState, use } from 'react'
import { getActiveCoupons } from '@/lib/api/coupons.service'
import { Ticket, ChevronLeft, Copy, Check, Clock, Calendar, BadgeInfo, AlertCircle, ShoppingBag, Tag, Percent, Store } from 'lucide-react'
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

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
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
    <div className="mx-auto max-w-2xl px-4 py-3 font-sans">
      {/* Back Link */}
      <Link
        href="/vouchers"
        className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors text-xs font-bold mb-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Kho Voucher
      </Link>

      <div className="space-y-3">
        
        {/* Hero Voucher Card */}
        <div className="w-full bg-white rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:h-40 shadow-md border border-amber-200/50">
          
          {/* Left & Center Main Ticket - Light Cream Gold Background */}
          <div className="flex-1 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/20 p-4.5 flex items-center justify-between gap-4 relative min-w-0">
            {/* Left Edge Cutout */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 h-7 w-7 bg-stone-50 rounded-full border-r border-amber-250/20 z-10 hidden md:block" />

            <div className="flex items-center gap-4 min-w-0">
              {/* Gift Box Icon */}
              <div className="hidden sm:flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-sm shrink-0 relative animate-pulse">
                {/* Ribbon overlay */}
                <div className="absolute inset-0 m-auto h-full w-1.5 bg-amber-200/60" />
                <div className="absolute inset-0 m-auto w-full h-1.5 bg-amber-200/60" />
                <Ticket className="h-8 w-8 text-white drop-shadow-sm z-10" />
              </div>

              {/* Left Text */}
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-wider text-amber-800 block">Voucher</span>
                <span className="text-[8px] font-bold text-amber-700/80 border-b border-amber-700/20 pb-0.5 inline-block">CỦA CỬA HÀNG</span>
                <h3 className="text-sm md:text-base font-black text-amber-950 mt-0.5 leading-tight tracking-tight">
                  ƯU ĐÃI<br />ĐẶC BIỆT
                </h3>
              </div>
            </div>

            {/* Center Text (Discount Rate) */}
            <div className="flex flex-col items-center text-center shrink-0 min-w-[130px]">
              <div className="flex items-baseline text-amber-900 leading-none">
                <span className="text-3xl md:text-4xl font-black tracking-tight">
                  {isPercentage ? `${coupon.discountAmount}%` : `${coupon.discountAmount / 1000}k`}
                </span>
                <span className="text-xs font-black uppercase tracking-wider ml-0.5">OFF</span>
              </div>
              
              <span className="inline-block text-[8px] font-black uppercase tracking-wider bg-amber-900/10 text-amber-900 px-2 py-0.5 rounded-md mt-1 border border-amber-900/15">
                Mã giảm giá chi tiết
              </span>
              <div className="text-[9px] font-bold text-stone-500 mt-1.5 space-y-0.5 leading-tight">
                <p>Giảm tối đa {coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : 'cố định'}</p>
                <p>Cho đơn từ {formatPrice(coupon.minOrderValue)}</p>
              </div>
            </div>
          </div>

          {/* Dashed Separator Line */}
          <div className="relative w-full md:w-0 h-0 md:h-auto border-t-2 md:border-t-0 md:border-r-2 border-dashed border-amber-200 shrink-0 bg-gradient-to-b from-amber-50 to-amber-100 md:bg-none">
            <div className="absolute -top-3.5 md:-top-3.5 -left-3.5 md:-left-3.5 h-7 w-7 bg-stone-50 rounded-full border border-stone-200 hidden md:block" />
            <div className="absolute -bottom-3.5 md:-bottom-3.5 -left-3.5 md:-left-3.5 h-7 w-7 bg-stone-50 rounded-full border border-stone-200 hidden md:block" />
          </div>

          {/* Right Ticket Stub - Dark Brown Background */}
          <div className="w-full md:w-48 bg-gradient-to-br from-amber-800 to-amber-900 text-white p-4.5 flex flex-col justify-center items-center text-center shrink-0 gap-2.5 relative">
            {/* Right Edge Cutout */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 h-7 w-7 bg-stone-50 rounded-full border-l border-amber-950/20 z-10 hidden md:block" />

            <div className="space-y-1 w-full">
              <span className="text-[8px] font-extrabold text-amber-100/70 uppercase tracking-widest block">Mã Code</span>
              <div className="w-full py-1 px-2.5 bg-amber-950/30 rounded-lg border border-white/10 font-mono text-xs font-black tracking-wider text-white truncate shadow-inner">
                {coupon.code}
              </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 pt-0.5">
              <div className="flex items-center gap-1 text-[8px] font-bold text-amber-100/80 uppercase tracking-wider">
                <Clock className="h-2.5 w-2.5 text-amber-300" />
                <span>Còn lại</span>
              </div>
              {isExpired ? (
                <span className="text-xs font-black uppercase text-red-300 tracking-wider">Hết hạn</span>
              ) : (
                <div className="flex items-baseline text-white">
                  <span className="text-xl font-black leading-none">{daysLeftText.match(/\d+/) ? daysLeftText.match(/\d+/)?.[0] : daysLeftText}</span>
                  <span className="text-[9px] font-extrabold ml-0.5 uppercase tracking-wide">
                    {daysLeftText.includes('ngày') ? 'Ngày' : daysLeftText.includes('giờ') ? 'Giờ' : 'Phút'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expiry Banner */}
        <div className={`flex items-center gap-2 rounded-xl py-2 px-3 border text-[11px] font-bold ${
          isExpired 
            ? 'bg-red-50 text-red-700 border-red-150' 
            : 'bg-amber-50/50 text-amber-900 border-amber-200/50'
        }`}>
          <Clock className="h-4 w-4 text-amber-700 shrink-0" />
          <span>Thời gian hiệu lực: {isExpired ? 'Đã hết hạn' : daysLeftText}</span>
        </div>

        {/* Code display with copy */}
        <div className="flex items-center justify-between gap-3 border border-stone-200/85 rounded-xl bg-white p-3 shadow-3xs">
          <div>
            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider block">Mã code giảm giá</span>
            <span className="text-base font-black text-amber-800 font-mono tracking-wide select-all text-amber-900">{coupon.code}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className={`py-1.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow cursor-pointer ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-white hover:bg-stone-50 border border-stone-250 text-stone-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Đã sao chép
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-stone-500" />
                Sao chép mã
              </>
            )}
          </button>
        </div>

        {/* Conditions Box */}
        <div className="bg-white rounded-xl border border-stone-200 p-4.5 space-y-3">
          <h4 className="text-[10px] font-extrabold text-stone-850 uppercase tracking-wider pb-2 border-b border-stone-100">
            Điều kiện áp dụng
          </h4>
          
          <div className="divide-y divide-stone-100/60 text-xs font-semibold text-stone-600">
            <div className="flex justify-between items-center py-2">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Tag className="h-3.5 w-3.5 text-amber-700" />
                Giá trị đơn hàng
              </span>
              <span className="text-stone-800 font-bold">Đơn tối thiểu từ {formatPrice(coupon.minOrderValue)}</span>
            </div>

            {coupon.maxDiscount && (
              <div className="flex justify-between items-center py-2">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <Percent className="h-3.5 w-3.5 text-amber-700" />
                  Mức giảm tối đa
                </span>
                <span className="text-stone-800 font-bold">{formatPrice(coupon.maxDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Calendar className="h-3.5 w-3.5 text-amber-700" />
                Ngày hết hạn
              </span>
              <span className="text-stone-800 font-bold">{formatDateTime(coupon.expiryDate)}</span>
            </div>

            {coupon.ownerId && (
              <div className="flex justify-between items-center py-2">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <Store className="h-3.5 w-3.5 text-amber-700" />
                  Cửa hàng áp dụng (Owner ID)
                </span>
                <span className="text-stone-800 font-mono text-[9px] select-all">{coupon.ownerId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Alert Box */}
        <div className="flex gap-2 p-3 rounded-xl bg-stone-50 border border-stone-150 text-[9px] text-stone-500 leading-normal">
          <BadgeInfo className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Voucher này có thể được áp dụng trực tiếp tại giỏ hàng hoặc chọn từ menu dropdown ở bước đặt hàng khi bạn đạt đủ giá trị đơn hàng tối thiểu. Mỗi mã có thể bị giới hạn số lượng sử dụng toàn hệ thống.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push('/products')}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-2.5 text-xs font-bold text-white shadow-md focus:outline-none cursor-pointer"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          Sử dụng ngay (Đến Cửa hàng)
        </button>

      </div>
    </div>
  )
}
