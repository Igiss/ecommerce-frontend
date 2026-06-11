'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { getOrderById, createVNPayUrl } from '@/lib/api/orders.service'
import { AlertCircle, Paintbrush, Calendar, MapPin, CreditCard, ChevronLeft, CreditCard as CardIcon } from 'lucide-react'
import Link from 'next/link'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { user } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push(`/login?redirect=/orders/${id}`)
      return
    }

    getOrderById(id)
      .then((data: any) => {
        const mapBackendStatusToFrontend = (status: string): string => {
          switch (status) {
            case 'confirmed': return 'processing'
            case 'shipping': return 'shipped'
            case 'completed': return 'delivered'
            default: return status
          }
        }

        const itemsPrice = (data.items || data.orderItems || []).reduce((sum: number, item: any) => sum + (item.price * (item.quantity || item.qty || 0)), 0)
        const totalPrice = data.totalAmount || data.totalPrice || 0
        const shippingPrice = totalPrice > 500000 ? 0 : 30000
        const discountAmount = Math.max(itemsPrice + shippingPrice - totalPrice, 0)

        const normalized = {
          ...data,
          status: mapBackendStatusToFrontend(data.orderStatus || data.status),
          isPaid: data.paymentStatus === 'paid' || data.isPaid || false,
          orderItems: (data.items || data.orderItems || []).map((item: any) => ({
            ...item,
            qty: item.quantity || item.qty || 1
          })),
          totalPrice,
          itemsPrice,
          shippingPrice,
          discountAmount
        }
        setOrder(normalized)
      })
      .catch((err: any) => {
        setError(err.message || 'Không thể lấy thông tin chi tiết đơn hàng.')
      })
      .finally(() => setLoading(false))
  }, [id, user, router])

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex justify-center mb-4 text-red-600">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Không tìm thấy đơn hàng</h2>
        <p className="text-sm text-stone-500 mt-2">{error || 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'}</p>
        <Link
          href="/profile"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-850 border border-stone-200 hover:bg-stone-50 text-stone-700 px-5 py-2 text-sm font-bold shadow-xs transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại Hồ sơ
        </Link>
      </div>
    )
  }

  const handleVNPayRepay = async () => {
    setPayLoading(true)
    setError('')
    try {
      const vnpayRes = await createVNPayUrl(order._id || order.id)
      if (vnpayRes && vnpayRes.paymentUrl) {
        window.location.href = vnpayRes.paymentUrl
      } else {
        setError('Không thể tạo liên kết thanh toán VNPay. Hãy kiểm tra lại sau.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi thanh toán VNPay.')
    } finally {
      setPayLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Đã giao hàng thành công'
      case 'shipped': return 'Đang trên đường vận chuyển'
      case 'processing': return 'Đang được in ấn 3D / Đóng gói'
      case 'cancelled': return 'Đã hủy bỏ'
      default: return 'Chờ hệ thống xác nhận'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-800 bg-green-50 border-green-200'
      case 'shipped': return 'text-blue-800 bg-blue-50 border-blue-200'
      case 'processing': return 'text-amber-800 bg-amber-50 border-amber-200'
      case 'cancelled': return 'text-red-800 bg-red-50 border-red-200'
      default: return 'text-stone-800 bg-stone-50 border-stone-200'
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-800 transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Quay lại đơn hàng của tôi
      </Link>

      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Header card */}
      <div className={`rounded-2xl border p-6 mb-8 shadow-xs ${getStatusColor(order.status)}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Trạng thái đơn hàng</span>
            <h1 className="text-lg sm:text-xl font-black mt-1">{getStatusText(order.status)}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold opacity-80">
            <Calendar className="h-4 w-4" />
            <span>Ngày mua: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Shipping details */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <MapPin className="h-4.5 w-4.5 text-amber-700" />
            Địa chỉ nhận hàng
          </h2>
          <div className="space-y-2.5 text-sm text-stone-600">
            <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
            <p className="flex items-center gap-2">SĐT: {order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}</p>
          </div>
        </div>

        {/* Payment details */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <CreditCard className="h-4.5 w-4.5 text-amber-700" />
            Phương thức & Trạng thái thanh toán
          </h2>
          <div className="space-y-4 text-sm text-stone-600">
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase">Hình thức</span>
              <p className="font-bold text-stone-900 mt-0.5">
                {order.paymentMethod === 'VNPay' ? 'Thanh toán trực tuyến VNPay' : 'Thanh toán tiền mặt khi giao hàng (COD)'}
              </p>
            </div>
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase">Trạng thái</span>
              <p className="mt-0.5 flex items-center gap-2">
                {order.isPaid ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                    Đã thanh toán ({new Date(order.paidAt).toLocaleDateString('vi-VN')})
                  </span>
                ) : (
                  <>
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                      Chưa thanh toán
                    </span>
                    {order.paymentMethod === 'VNPay' && order.status !== 'cancelled' && (
                      <button
                        onClick={handleVNPayRepay}
                        disabled={payLoading}
                        className="ml-2 inline-flex items-center gap-1 rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-3 py-1 text-xs font-bold shadow-xs disabled:bg-stone-400"
                      >
                        <CardIcon className="h-3.5 w-3.5" />
                        Thanh toán lại
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered items list */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs mb-8">
        <h2 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-wide border-b border-stone-100 pb-3">Sản phẩm đã mua</h2>
        
        <div className="divide-y divide-stone-100">
          {order.orderItems.map((item: any, idx: number) => {
            const imageUrl = item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex gap-4">
                  <img src={imageUrl} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-stone-50 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">Đơn giá: {item.price.toLocaleString('vi-VN')}đ | Số lượng: {item.qty}</p>
                    
                    {/* Customization Details */}
                    {item.customization && (
                      <div className="mt-2 flex flex-wrap gap-2.5 items-center bg-amber-50/50 rounded-lg p-2 text-[10px] text-amber-900/80 font-medium">
                        <div className="flex items-center gap-1 shrink-0">
                          <Paintbrush className="h-3 w-3 text-amber-600" />
                          <span>Màu cốc:</span>
                          <span
                            className="h-3 w-3 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.customization.baseColor }}
                          />
                        </div>
                        {item.customization.designName && (
                          <div className="shrink-0">
                            <span>Artwork: </span>
                            <span className="font-semibold text-stone-700">{item.customization.designName}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-stone-900">
                    {(item.price * item.qty).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bill summary */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs max-w-sm ml-auto">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2.5">Tổng giá trị hóa đơn</h2>
        
        <div className="space-y-3.5 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="font-semibold text-stone-900">{order.itemsPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{order.shippingPrice === 0 ? 'Miễn phí' : `${order.shippingPrice.toLocaleString('vi-VN')}đ`}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700 font-medium">
              <span>Mã giảm giá</span>
              <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <hr className="border-stone-100" />
          <div className="flex justify-between text-base font-extrabold text-stone-900">
            <span>Tổng cộng</span>
            <span className="text-amber-900">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  )
}
