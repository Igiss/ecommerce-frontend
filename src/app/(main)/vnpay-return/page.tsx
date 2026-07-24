'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { getOrderById } from '@/lib/api/orders.service'

function VNPayReturnContent() {
  const searchParams = useSearchParams()
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [orderId, setOrderId] = useState<string>('')
  const [responseMsg, setResponseMsg] = useState('')
  const clearCart = useCartStore((state) => state.clearCart)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    const status = searchParams.get('status')
    const responseCode = searchParams.get('responseCode')
    const orderIdParam = searchParams.get('orderId')

    if (orderIdParam) setOrderId(orderIdParam)

    const verify = async () => {
      if (isCheckingRef.current) return
      isCheckingRef.current = true

      if (status === 'success' || responseCode === '00') {
        if (!orderIdParam) {
          setIsSuccess(false)
          setResponseMsg('Không tìm thấy mã đơn hàng.')
          return
        }
        try {
          const order = await getOrderById(orderIdParam)
          if (order.paymentStatus === 'paid') {
            setIsSuccess(true)
            clearCart()
          } else {
            setIsSuccess(false)
            setResponseMsg('Đơn hàng chưa được đánh dấu đã thanh toán trên hệ thống.')
          }
        } catch (err: any) {
          setIsSuccess(false)
          setResponseMsg('Không thể xác nhận trạng thái đơn hàng từ máy chủ.')
        }
      } else {
        setIsSuccess(false)
        switch (responseCode) {
          case '24':
            setResponseMsg('Giao dịch đã bị hủy bởi người dùng.')
            break;
          case '09':
            setResponseMsg('Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking.')
            break;
          case '11':
            setResponseMsg('Giao dịch không thành công do hết hạn chờ xác thực.')
            break;
          default:
            setResponseMsg('Thanh toán không thành công. Vui lòng thử lại.')
            break;
        }
      }
    }

    void verify()
  }, [searchParams, clearCart])

  if (isSuccess === null) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-stone-500 text-sm">Đang xác nhận giao dịch thanh toán...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-xl">
      {isSuccess ? (
        <>
          <div className="flex justify-center mb-6 text-green-600">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">Thanh toán thành công!</h1>
          <p className="text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
            Cảm ơn bạn đã tin tưởng Gia Dụng 24h. Đơn hàng của bạn đã được thanh toán và đang được chuyển sang bộ phận xử lý.
          </p>

          {orderId && (
            <div className="my-6 inline-block bg-stone-50 border border-stone-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-700">
              Mã đơn hàng: <span className="text-amber-800 select-all font-mono">{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 text-sm font-bold shadow-md transition-colors"
            >
              Xem Đơn hàng của tôi
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white text-stone-700 px-5 py-2.5 text-sm font-bold shadow-xs hover:bg-stone-50 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center mb-6 text-red-600">
            <XCircle className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">Thanh toán thất bại</h1>
          <p className="text-sm text-red-600 font-semibold mb-2">{responseMsg}</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
            Nếu tiền đã bị trừ trong tài khoản của bạn, vui lòng liên hệ bộ phận hỗ trợ khách hàng để được xử lý nhanh nhất.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout"
              className="rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-6 py-2.5 text-sm font-bold shadow-md transition-colors inline-block"
            >
              Thử lại thanh toán
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-stone-300 bg-white text-stone-700 px-6 py-2.5 text-sm font-bold shadow-xs hover:bg-stone-50 transition-colors inline-block"
            >
              Quay về Trang chủ
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default function VNPayReturnPage() {
  return (
    <div className="flex min-h-[500px] items-center justify-center bg-stone-50/20 px-4 py-16">
      <Suspense
        fallback={
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-xl">
            <div className="flex justify-center mb-4 text-amber-850">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Đang tải...</h2>
          </div>
        }
      >
        <VNPayReturnContent />
      </Suspense>
    </div>
  )
}
