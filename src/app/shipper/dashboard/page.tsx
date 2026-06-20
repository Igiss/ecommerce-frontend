'use client'

import { useEffect, useState } from 'react'
import { getShipperOrders, pickupOrder, completeDelivery } from '@/lib/api/shipper.service'
import { Package, Truck, CheckCircle, RefreshCw, Loader2, MapPin, User, Phone, Map } from 'lucide-react'

export default function ShipperDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getShipperOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handlePickup = async (id: string) => {
    setActionLoading(id)
    try {
      await pickupOrder(id, { shippingProvider: 'Giao Hàng Tiết Kiệm' }) // Mặc định hoặc tự chọn
      await fetchOrders()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nhận đơn.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (id: string) => {
    setActionLoading(id)
    try {
      await completeDelivery(id)
      await fetchOrders()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hoàn thành đơn.')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold"><Package className="h-3 w-3" /> Chờ lấy hàng</span>
      case 'shipping':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold"><Truck className="h-3 w-3" /> Đang giao</span>
      case 'completed':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle className="h-3 w-3" /> Đã giao</span>
      default:
        return <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Map className="h-6 w-6 text-amber-700" />
            Đơn hàng cần giao
          </h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý và cập nhật trạng thái các đơn hàng được phân công.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50 shadow-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Không có đơn hàng nào</h3>
          <p className="text-stone-500 mt-1">Hiện tại bạn chưa được phân công đơn hàng nào đang chờ giao.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
                <span className="text-xs font-bold text-stone-500">Mã: #{order.orderId || order._id.slice(-8).toUpperCase()}</span>
                {getStatusBadge(order.orderStatus)}
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-stone-900">{order.shippingAddress?.fullName}</p>
                    <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      {order.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-stone-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-600">
                    {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.province}
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <p className="text-xs font-bold text-stone-500 uppercase mb-2">Thông tin thu tiền (COD)</p>
                  <p className="text-lg font-black text-amber-800">
                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' 
                      ? `${order.totalPrice.toLocaleString('vi-VN')}đ` 
                      : '0đ (Đã thanh toán)'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                {order.orderStatus === 'assigned' && (
                  <button
                    onClick={() => handlePickup(order._id)}
                    disabled={actionLoading === order._id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70"
                  >
                    {actionLoading === order._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    Nhận đi giao
                  </button>
                )}
                
                {order.orderStatus === 'shipping' && (
                  <button
                    onClick={() => handleComplete(order._id)}
                    disabled={actionLoading === order._id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 shadow-md transition-colors disabled:opacity-70"
                  >
                    {actionLoading === order._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Giao thành công
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
