'use client'

import { useState, useEffect } from 'react'
import { getShipperOrders, pickupOrder, completeDelivery } from '@/lib/api/shipper.service'
import { Check, Truck, ShieldAlert, Loader2, Search, ChevronRight, PackageCheck, AlertCircle, MapPin } from 'lucide-react'

export default function ShipperOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getShipperOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn giao')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handlePickup = async (orderId: string) => {
    if (!confirm('Bạn xác nhận ĐÃ LẤY HÀNG và bắt đầu đi giao?')) return
    setProcessingId(orderId)
    try {
      await pickupOrder(orderId, { shippingProvider: 'Gia Dụng 24h Express' })
      await fetchOrders()
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái')
    } finally {
      setProcessingId(null)
    }
  }

  const handleComplete = async (orderId: string) => {
    if (!confirm('Bạn xác nhận ĐÃ GIAO THÀNH CÔNG cho khách hàng?')) return
    setProcessingId(orderId)
    try {
      await completeDelivery(orderId)
      await fetchOrders()
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái')
    } finally {
      setProcessingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Danh sách Đơn giao</h1>
        <p className="text-sm text-stone-500 mt-1">Các đơn hàng bạn được phân công đi lấy và giao.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-stone-200 bg-white">
          <Truck className="h-12 w-12 text-stone-300 mb-4" />
          <p className="text-stone-500">Bạn hiện chưa có đơn hàng nào được phân công.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order._id || order.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-xs font-bold text-stone-400 mb-1">
                      #{String(order._id || order.id).substring(String(order._id || order.id).length - 8).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-stone-900">{order.shippingAddress?.fullName}</h3>
                    <p className="text-sm text-stone-500">{order.shippingAddress?.phone}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-900 text-lg">
                      {formatCurrency(order.totalAmount ?? order.totalPrice ?? 0)}
                    </div>
                    {order.paymentMethod?.toUpperCase() === 'COD' && order.paymentStatus?.toLowerCase() === 'unpaid' ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Thu hộ COD</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Đã thanh toán</span>
                    )}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 text-sm">
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-stone-700">
                      {order.shippingAddress?.address
                        ? `${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.province}`
                        : order.shippingAddress?.fullAddress || 'Chưa cập nhật địa chỉ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="bg-stone-50 p-5 sm:w-64 border-t sm:border-t-0 sm:border-l border-stone-100 flex flex-col justify-center gap-3">
                {order.orderStatus === 'assigned' && (
                  <button
                    onClick={() => handlePickup(order._id || order.id)}
                    disabled={processingId === (order._id || order.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-50 transition-colors"
                  >
                    {processingId === (order._id || order.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                    Nhận lấy hàng
                  </button>
                )}

                {order.orderStatus === 'shipping' && (
                  <button
                    onClick={() => handleComplete(order._id || order.id)}
                    disabled={processingId === (order._id || order.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === (order._id || order.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Giao thành công
                  </button>
                )}

                {order.orderStatus === 'completed' && (
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-100 text-green-800 px-4 py-3 text-sm font-bold">
                    <Check className="h-5 w-5" />
                    Đã hoàn thành
                  </div>
                )}
                
                {['cancelled', 'returned'].includes(order.orderStatus) && (
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-100 text-red-800 px-4 py-3 text-sm font-bold">
                    <AlertCircle className="h-5 w-5" />
                    Đơn đã hủy/trả
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
