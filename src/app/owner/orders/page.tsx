'use client'

import { useEffect, useState } from 'react'
import { getOwnerOrders, updateOwnerOrderStatus, updateOwnerReturnStatus, handOverToShipping } from '@/lib/api/owner.service'
import { useAuthStore } from '@/store/auth.store'
import { Calendar, Eye, X, AlertCircle, Paintbrush } from 'lucide-react'

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
]

export default function OwnerOrdersPage() {
  const { user } = useAuthStore()
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

  const fetchOrdersList = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const ordersData = await getOwnerOrders()
      const allOrdersList = Array.isArray(ordersData) ? ordersData : []

      const normalized = allOrdersList.map((order: any) => {
        const orderItems = (order.items || order.orderItems || []).map((item: any) => ({
          ...item,
          qty: item.quantity || item.qty || 1
        }))

        const ownerSubtotal = Number(order.ownerTotal)
          || orderItems.reduce(
            (sum: number, item: any) => sum + Number(item.total ?? item.price * item.qty),
            0
          )
        const globalStatus = order.orderStatus || order.status
        const rawStatus = ['completed', 'cancelled', 'returned'].includes(globalStatus) 
          ? globalStatus 
          : (orderItems[0]?.fulfillmentStatus || globalStatus)

        return {
          ...order,
          status: mapBackendStatusToFrontend(rawStatus),
          totalPrice: order.totalAmount || order.totalPrice || 0,
          ownerSubtotal,
          orderItems,
          isPaid: order.paymentStatus === 'paid' || order.isPaid || false
        }
      })

      if (statusFilter === 'all') {
        setOrders(normalized)
      } else {
        setOrders(normalized.filter((order: any) => order.status === statusFilter))
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdersList()
  }, [user, statusFilter])

  const mapFrontendStatusToBackend = (status: string): string => {
    switch (status) {
      case 'processing': return 'confirmed'
      case 'shipped': return 'shipping'
      case 'delivered': return 'completed'
      default: return status
    }
  }

  // Change status of order
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      const backendStatus = mapFrontendStatusToBackend(newStatus)
      await updateOwnerOrderStatus(orderId, backendStatus)
      
      // Update modal order instance if open
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus, 
          isDelivered: newStatus === 'delivered', 
          deliveredAt: newStatus === 'delivered' ? new Date() : undefined 
        })
      }

      fetchOrdersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng.')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleHandover = async (orderId: string) => {
    setStatusUpdateLoading(true)
    try {
      await handOverToShipping(orderId)
      alert('Đã xác nhận bàn giao hàng cho đơn vị vận chuyển thành công!')
      
      if (selectedOrder) {
        const updatedItems = selectedOrder.orderItems.map((item: any) => {
          if (String(item.ownerId?.id || item.ownerId?._id || item.ownerId) === String(user?.id)) {
            return { ...item, handedOverToShipping: true }
          }
          return item
        })
        setSelectedOrder({ ...selectedOrder, orderItems: updatedItems })
      }
      fetchOrdersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xác nhận bàn giao.')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleReturnStatusChange = async (orderId: string, itemId: string, returnStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      await updateOwnerReturnStatus(orderId, itemId, returnStatus)
      
      if (selectedOrder) {
        const updatedItems = selectedOrder.orderItems.map((item: any) => {
          if (item._id === itemId || item.id === itemId || item.productId === itemId) {
            return { ...item, returnStatus }
          }
          return item
        })
        setSelectedOrder({ ...selectedOrder, orderItems: updatedItems })
      }
      fetchOrdersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái đổi trả.')
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
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Quản lý Đơn hàng của Cửa hàng
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Theo dõi và xử lý các đơn hàng mua sản phẩm từ shop của bạn.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
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
          <p className="text-stone-550 text-sm">Không có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">ID Đơn</th>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-6">Ngày đặt</th>
                <th className="py-3.5 px-6">Thanh toán</th>
                <th className="py-3.5 px-6">Trạng thái đơn</th>
                <th className="py-3.5 px-6">Doanh thu Shop</th>
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
                    <td className="py-3 px-6 font-extrabold text-amber-900">
                      {order.ownerSubtotal.toLocaleString('vi-VN')}đ
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
                    <p>{selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.province}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-450 uppercase mb-2">Doanh thu Shop của bạn</h4>
                  <div className="text-xs text-stone-600 space-y-1">
                    <p>Doanh thu của shop: <strong className="text-amber-900 font-extrabold text-sm">{selectedOrder.ownerSubtotal.toLocaleString('vi-VN')}đ</strong></p>
                    <p>Tổng giá trị đơn: <strong>{selectedOrder.totalPrice.toLocaleString('vi-VN')}đ</strong></p>
                    <p>Hình thức: <strong>{selectedOrder.paymentMethod}</strong></p>
                    <p>
                      Trạng thái thanh toán:{' '}
                      <strong>{selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Manager */}
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-900 uppercase mb-3">Trạng thái vận đơn (Cập nhật cho toàn đơn)</h4>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold border ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                  
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'processing')}
                      disabled={statusUpdateLoading}
                      className="rounded-lg border border-amber-800 bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      {statusUpdateLoading ? 'Đang xử lý...' : 'Xác nhận & Chuẩn bị hàng'}
                    </button>
                  )}

                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id || selectedOrder.id, 'cancelled')}
                      disabled={statusUpdateLoading}
                      className="rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
                {/* Handover Button */}
                {(selectedOrder.status === 'processing' || selectedOrder.status === 'shipped') && (
                  <div className="mt-4 pt-4 border-t border-amber-200/50">
                    <button
                      onClick={() => handleHandover(selectedOrder._id || selectedOrder.id)}
                      disabled={statusUpdateLoading || selectedOrder.orderItems?.some((i: any) => String(i.ownerId?.id || i.ownerId?._id || i.ownerId) === String(user?.id) && i.handedOverToShipping)}
                      className="rounded-lg border border-amber-800 bg-amber-800 text-white hover:bg-amber-900 px-4 py-2 text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:bg-stone-400 disabled:border-stone-400"
                    >
                      {selectedOrder.orderItems?.some((i: any) => String(i.ownerId?.id || i.ownerId?._id || i.ownerId) === String(user?.id) && i.handedOverToShipping) 
                        ? 'Đã bàn giao cho Shipper' 
                        : 'Bàn giao cho đơn vị vận chuyển'}
                    </button>
                  </div>
                )}
              </div>

              {/* Items List - Only show items belonging to this owner */}
              <div>
                <h4 className="text-xs font-bold text-stone-450 uppercase mb-3">Sản phẩm thuộc Shop của bạn</h4>
                <div className="divide-y divide-stone-100 border border-stone-150 rounded-xl p-4 bg-white">
                  {selectedOrder.orderItems
                    ?.filter((item: any) => {
                      const itemOwnerId = item.ownerId?.id || item.ownerId?._id || item.ownerId
                      return itemOwnerId && String(itemOwnerId) === String(user?.id)
                    })
                    .map((item: any, idx: number) => {
                      const imageUrl = item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'
                      return (
                        <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 justify-between items-center">
                          <div className="flex gap-3">
                            <img src={imageUrl} alt={item.productName} className="h-12 w-12 rounded-lg object-cover bg-stone-50 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-stone-850">{item.productName}</p>
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
                              
                              {/* Return Processing */}
                              {item.returnStatus && item.returnStatus !== 'NONE' && (
                                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-2.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-800 uppercase">Yêu cầu đổi/trả hàng</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-red-200 text-red-600">
                                      {item.returnStatus === 'PENDING' ? 'Chờ duyệt' : 
                                       item.returnStatus === 'APPROVED' ? 'Đã duyệt' : 
                                       item.returnStatus === 'REJECTED' ? 'Đã từ chối' : 
                                       item.returnStatus === 'RECEIVED' ? 'Đã nhận hàng trả' : item.returnStatus}
                                    </span>
                                  </div>
                                  <p className="text-xs text-red-600"><span className="font-semibold">Lý do:</span> {item.returnReason}</p>
                                  {item.returnStatus === 'PENDING' && (
                                    <div className="flex gap-2 pt-1">
                                      <button 
                                        disabled={statusUpdateLoading}
                                        onClick={() => handleReturnStatusChange(selectedOrder._id || selectedOrder.id, item._id || item.id || item.productId, 'APPROVED')}
                                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded shadow-sm disabled:opacity-50"
                                      >
                                        Chấp nhận
                                      </button>
                                      <button 
                                        disabled={statusUpdateLoading}
                                        onClick={() => handleReturnStatusChange(selectedOrder._id || selectedOrder.id, item._id || item.id || item.productId, 'REJECTED')}
                                        className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold rounded shadow-sm disabled:opacity-50"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  )}
                                  {item.returnStatus === 'APPROVED' && (
                                    <div className="pt-1">
                                      <button 
                                        disabled={statusUpdateLoading}
                                        onClick={() => handleReturnStatusChange(selectedOrder._id || selectedOrder.id, item._id || item.id || item.productId, 'RECEIVED')}
                                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded shadow-sm disabled:opacity-50"
                                      >
                                        Đã nhận được hàng trả
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-stone-900 mt-1 self-start">
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
