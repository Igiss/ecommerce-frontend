'use client'

import { useEffect, useState } from 'react'
import { getOrderById, createVNPayUrl, cancelOrder } from '@/lib/api/orders.service'
import { AlertCircle, Calendar, MapPin, CreditCard, CreditCard as CardIcon, XCircle, Star, X, Loader2 } from 'lucide-react'
import { ReviewModal } from '@/components/UI/ReviewModal'
import { ReturnModal } from '@/components/UI/ReturnModal'

interface OrderDetailModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onOrderUpdated?: () => void
}

export function OrderDetailModal({ orderId, isOpen, onClose, onOrderUpdated }: OrderDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const [reviewProduct, setReviewProduct] = useState<any>(null)
  const [returnProduct, setReturnProduct] = useState<any>(null)

  const normalizeOrder = (data: any) => {
    const mapBackendStatusToFrontend = (status: string): string => {
      switch (status) {
        case 'confirmed': return 'processing'
        case 'shipping': return 'shipped'
        case 'completed': return 'delivered'
        default: return status
      }
    }
    const orderItems = (data.items || data.orderItems || []).map((item: any) => ({
      ...item,
      name: item.productName || item.name || 'Sản phẩm',
      qty: item.quantity || item.qty || 1,
      lineTotal: Number(item.total ?? item.price * (item.quantity || item.qty || 1))
    }))

    return {
      ...data,
      id: data.id || data._id,
      status: mapBackendStatusToFrontend(data.orderStatus || data.status),
      isPaid: data.paymentStatus === 'paid' || data.isPaid || data.orderStatus === 'completed' || false,
      orderItems,
      totalPrice: Number(data.totalAmount ?? data.totalPrice ?? 0),
      itemsPrice: Number(
        data.subtotal ??
        orderItems.reduce((sum: number, item: any) => sum + item.lineTotal, 0)
      ),
      shippingPrice: Number(data.shippingFee ?? 0),
      discountAmount: Number(data.discountAmount ?? 0)
    }
  }

  const loadOrder = async () => {
    if (!orderId) return
    setLoading(true)
    setError('')
    try {
      const data = await getOrderById(orderId)
      setOrder(normalizeOrder(data))
    } catch (err: any) {
      setError(err.message || 'Không thể lấy thông tin chi tiết đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && orderId) {
      void loadOrder()
    }
  }, [orderId, isOpen])

  const handleVNPayRepay = async () => {
    if (!order) return
    setPayLoading(true)
    setError('')
    try {
      const vnpayRes = await createVNPayUrl(order.id)
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

  const handleCancelOrder = async () => {
    if (!order) return
    const reason = window.prompt('Lý do hủy đơn hàng (không bắt buộc):') || undefined
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return

    setCancelLoading(true)
    setError('')
    try {
      const updated = await cancelOrder(order.id, reason)
      setOrder(normalizeOrder(updated))
      if (onOrderUpdated) onOrderUpdated()
    } catch (err: any) {
      setError(err.message || 'Không thể hủy đơn hàng.')
    } finally {
      setCancelLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Đã giao hàng'
      case 'shipped': return 'Đang vận chuyển'
      case 'processing': return 'Đang xử lý'
      case 'cancelled': return 'Đã hủy'
      default: return 'Chờ xác nhận'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0 bg-stone-50/50">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            Mã đơn hàng: <span className="font-mono text-amber-850 uppercase">{orderId.slice(-8).toUpperCase()}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-150 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
              <span className="text-sm text-stone-500 font-semibold">Đang tải thông tin chi tiết đơn hàng...</span>
            </div>
          ) : error || !order ? (
            <div className="flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
              <p>{error || 'Không tìm thấy thông tin đơn hàng.'}</p>
            </div>
          ) : (
            <>
              {/* Header Status Card */}
              <div className={`rounded-2xl border p-5 shadow-3xs ${getStatusColor(order.status)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Trạng thái đơn hàng</span>
                    <h4 className="text-sm font-bold mt-0.5">{getStatusText(order.status)}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-85">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày mua: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                {order.status === 'pending' && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    {cancelLoading ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
              </div>

              {/* Grid 2-column info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping info */}
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-3xs">
                  <h5 className="text-xs font-black text-stone-900 mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-stone-100 pb-2">
                    <MapPin className="h-4 w-4 text-amber-700" />
                    Địa chỉ nhận hàng
                  </h5>
                  <div className="space-y-2 text-xs text-stone-600 font-medium">
                    <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
                    <p>SĐT: {order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.ward}, {order.shippingAddress.province}</p>
                    {order.shippingProvider && (
                      <p className="pt-1">Đơn vị vận chuyển: <strong className="text-stone-850">{order.shippingProvider}</strong></p>
                    )}
                    {order.trackingCode && (
                      <p>Mã vận đơn: <strong className="select-all text-amber-800 font-mono">{order.trackingCode}</strong></p>
                    )}
                  </div>
                </div>

                {/* Payment info */}
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-3xs">
                  <h5 className="text-xs font-black text-stone-900 mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-stone-100 pb-2">
                    <CreditCard className="h-4 w-4 text-amber-700" />
                    Thanh toán
                  </h5>
                  <div className="space-y-3.5 text-xs text-stone-600 font-medium">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Hình thức</span>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {order.paymentMethod === 'VNPAY' ? 'Thanh toán trực tuyến VNPay' : 'Thanh toán khi nhận hàng (COD)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Trạng thái</span>
                      <p className="mt-0.5 flex items-center gap-1.5">
                        {order.isPaid ? (
                          <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-150">
                            Đã thanh toán
                            {order.paidAt
                              ? ` (${new Date(order.paidAt).toLocaleDateString('vi-VN')})`
                              : ''}
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-150">
                              Chưa thanh toán
                            </span>
                            {order.paymentMethod === 'VNPAY' && order.status !== 'cancelled' && (
                              <button
                                onClick={handleVNPayRepay}
                                disabled={payLoading}
                                className="ml-1.5 inline-flex items-center gap-1 rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm disabled:bg-stone-450 cursor-pointer"
                              >
                                <CardIcon className="h-3 w-3" />
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

              {/* Items Card */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-3xs">
                <h5 className="text-xs font-black text-stone-900 mb-4 uppercase tracking-wide border-b border-stone-100 pb-2">Sản phẩm đã mua</h5>
                <div className="divide-y divide-stone-100">
                  {order.orderItems.map((item: any, idx: number) => {
                    const imageUrl = item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className="flex gap-3 min-w-0">
                          <img src={imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-contain bg-stone-50 shrink-0 border border-stone-100" />
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-stone-900 truncate">{item.name}</h6>
                            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                              Đơn giá: {item.price.toLocaleString('vi-VN')}đ | Số lượng: {item.qty}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <span className="text-xs font-extrabold text-stone-900">
                            {item.lineTotal.toLocaleString('vi-VN')}đ
                          </span>
                          {order.status === 'delivered' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setReviewProduct(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold hover:bg-amber-100 transition-colors border border-amber-150 cursor-pointer"
                              >
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                Đánh giá
                              </button>
                              <button
                                onClick={() => setReturnProduct(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
                              >
                                Đổi/Trả
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bill totals */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-3xs w-full">
                <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3 border-b border-stone-100 pb-1.5">Tổng giá trị hóa đơn</h5>
                <div className="space-y-2.5 text-xs text-stone-650 font-medium">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-bold text-stone-900">{order.itemsPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao hàng</span>
                    <span className="font-bold text-stone-900">
                      {order.shippingPrice === 0
                        ? 'Miễn phí'
                        : `${order.shippingPrice.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                  {order.couponCode && (
                    <div className="flex justify-between">
                      <span>Mã giảm giá</span>
                      <span className="font-bold text-amber-800 font-mono uppercase">{order.couponCode}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Giảm giá</span>
                      <span className="font-bold">-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <hr className="border-stone-100" />
                  <div className="flex justify-between text-sm font-extrabold text-stone-900">
                    <span>Tổng cộng</span>
                    <span className="text-amber-900">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {order && (
        <>
          <ReviewModal 
            isOpen={!!reviewProduct}
            onClose={() => setReviewProduct(null)}
            orderId={order.id}
            product={reviewProduct}
            onSuccess={() => {
              setReviewProduct(null)
            }}
          />

          <ReturnModal
            isOpen={!!returnProduct}
            onClose={() => setReturnProduct(null)}
            orderId={order.id}
            product={returnProduct}
            onSuccess={() => {
              setReturnProduct(null)
              void loadOrder()
            }}
          />
        </>
      )}
    </div>
  )
}
