'use client'

import { useEffect, useState } from 'react'
import { getAdminOrders, updateOrderStatus, deliverOrder } from '@/lib/api/admin.service'
import { Calendar, Eye, X, AlertCircle, RefreshCw, Paintbrush } from 'lucide-react'

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  const mapBackendStatusToFrontend = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'processing'
      case 'shipping': return 'shipped'
      case 'completed': return 'delivered'
      default: return status
    }
  }

  const fetchOrdersList = () => {
    setLoading(true)
    getAdminOrders()
      .then((data: any) => {
        let list: any[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object' && 'orders' in data && Array.isArray(data.orders)) {
          list = data.orders
        }

        const normalized = list.map((order: any) => ({
          ...order,
          status: mapBackendStatusToFrontend(order.orderStatus || order.status),
          totalPrice: order.totalAmount || order.totalPrice || 0,
          orderItems: (order.items || order.orderItems || []).map((item: any) => ({
            ...item,
            qty: item.quantity || item.qty || 1
          })),
          isPaid: order.paymentStatus === 'paid' || order.isPaid || false
        }))

        if (statusFilter === 'all') {
          setOrders(normalized)
        } else {
          setOrders(normalized.filter((order: any) => order.status === statusFilter))
        }
      })
      .catch((err) => {
        setError('Không thể tải danh sách đơn hàng.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrdersList()
  }, [statusFilter])

  // Change status of order
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      if (newStatus === 'delivered') {
        // VNPay delivery endpoint marks as delivered and records date
        await deliverOrder(orderId)
      } else {
        await updateOrderStatus(orderId, newStatus)
      }
      
      // Update modal order instance if open
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, isDelivered: newStatus === 'delivered', deliveredAt: newStatus === 'delivered' ? new Date() : undefined })
      }

      fetchOrdersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng.')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200'
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-stone-50 text-stone-700 border-stone-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Đã giao'
      case 'shipped': return 'Đang giao'
      case 'processing': return 'Đang xử lý'
      case 'cancelled': return 'Đã hủy'
      default: return 'Chờ xác nhận'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Đơn hàng</h1>
        <p className="text-xs text-stone-500 mt-1">Duyệt thông tin đơn hàng, thay đổi trạng thái giao nhận và quản lý thanh toán.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all focus:outline-none ${
              statusFilter === tab.value
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-amber-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-550 text-sm">Chưa có đơn hàng nào thuộc trạng thái này.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">ID Đơn hàng</th>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-6">Ngày đặt</th>
                <th className="py-3.5 px-6">Thanh toán</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6">Tổng tiền</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN')
                return (
                  <tr key={order._id || order.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs font-bold text-stone-850 select-all">
                      {(order._id || order.id).slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-6 font-bold text-stone-900">
                      {order.shippingAddress?.fullName || order.user?.name || 'Khách vãng lai'}
                    </td>
                    <td className="py-3 px-6 text-xs text-stone-500">{dateStr}</td>
                    <td className="py-3 px-6">
                      {order.isPaid ? (
                        <span className="inline-flex rounded-full bg-green-50 text-green-700 border border-green-150 px-2 py-0.5 text-[10px] font-bold">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 text-red-705 border border-red-150 px-2 py-0.5 text-[10px] font-bold">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-extrabold text-stone-950">
                      {order.totalPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-700 transition-colors shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Chi tiết đơn hàng</h3>
                <p className="text-[10px] font-mono text-stone-400 mt-0.5">ID: {selectedOrder._id || selectedOrder.id}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Shipping address & payment summary */}
              <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-450 uppercase mb-2">Thông tin giao nhận</h4>
                  <div className="text-xs text-stone-600 space-y-1">
                    <p className="font-bold text-stone-800">{selectedOrder.shippingAddress?.fullName}</p>
                    <p>SĐT: {selectedOrder.shippingAddress?.phone}</p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-450 uppercase mb-2">Thành tiền & Thanh toán</h4>
                  <div className="text-xs text-stone-600 space-y-1">
                    <p>Tổng tiền: <strong className="text-amber-900 font-extrabold text-sm">{selectedOrder.totalPrice.toLocaleString('vi-VN')}đ</strong></p>
                    <p>Hình thức: <strong>{selectedOrder.paymentMethod}</strong></p>
                    <p>
                      Đã trả:{' '}
                      <strong>{selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Manager */}
              <div className="bg-stone-50 border border-stone-150 rounded-xl p-4">
                <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Cập nhật trạng thái vận đơn</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedOrder.status}
                    disabled={statusUpdateLoading || selectedOrder.status === 'cancelled'}
                    onChange={(e) => handleStatusChange(selectedOrder._id || selectedOrder.id, e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold focus:outline-none disabled:bg-stone-100"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang xử lý (In 3D)</option>
                    <option value="shipped">Đang giao hàng</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled" disabled>Đã hủy</option>
                  </select>
                  
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'cancelled')}
                      disabled={statusUpdateLoading}
                      className="rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-stone-450 uppercase mb-3">Danh sách ly cốc</h4>
                <div className="divide-y divide-stone-100 border border-stone-150 rounded-xl p-4 bg-white">
                  {selectedOrder.orderItems?.map((item: any, idx: number) => {
                    const imageUrl = item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'
                    return (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 justify-between items-center">
                        <div className="flex gap-3">
                          <img src={imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-stone-50 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-stone-850">{item.name}</p>
                            <p className="text-[10px] text-stone-450 mt-0.5">Số lượng: {item.qty} | Đơn giá: {item.price.toLocaleString('vi-VN')}đ</p>
                            
                            {/* Customization Details */}
                            {item.customization && (
                              <div className="mt-1.5 flex gap-2 items-center text-[9px] text-amber-900 font-medium">
                                <span className="flex items-center gap-0.5 shrink-0">
                                  <Paintbrush className="h-2.5 w-2.5" /> Màu:
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-stone-300 inline-block"
                                    style={{ backgroundColor: item.customization.baseColor }}
                                  />
                                </span>
                                {item.customization.designName && (
                                  <span>Artwork: {item.customization.designName}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-stone-900">
                          {(item.price * item.qty).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-stone-100">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-750 hover:bg-stone-50 transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
