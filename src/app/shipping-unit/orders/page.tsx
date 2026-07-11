'use client'

import { useState, useEffect } from 'react'
import { getShippingUnitOrders, getShippers, assignShipperToOrder } from '@/lib/api/shipping-units.service'
import { Check, X, ShieldAlert, Loader2, Package, Search, ChevronRight, Truck } from 'lucide-react'

export default function ShippingUnitOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [shippers, setShippers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [assignShipperId, setAssignShipperId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [ordersData, shippersData] = await Promise.all([
        getShippingUnitOrders(),
        getShippers()
      ])
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setShippers(Array.isArray(shippersData) ? shippersData : [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssignShipper = async () => {
    if (!assignShipperId || !selectedOrder) return
    setAssignLoading(true)
    setAssignError('')
    try {
      await assignShipperToOrder(selectedOrder._id, assignShipperId)
      setSelectedOrder(null)
      fetchData() // Refresh list
    } catch (err: any) {
      setAssignError(err.message || 'Phân công thất bại')
    } finally {
      setAssignLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-xs font-bold">Chờ lấy hàng</span>
      case 'shipping':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-xs font-bold">Đang giao</span>
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-md text-xs font-bold">Thành công</span>
      default:
        return <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Đơn hàng</h1>
        <p className="text-sm text-stone-500 mt-1">Các đơn hàng được hệ thống phân cho đơn vị của bạn.</p>
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-bold text-stone-900">Mã đơn</th>
                <th className="px-6 py-4 font-bold text-stone-900">Khách hàng</th>
                <th className="px-6 py-4 font-bold text-stone-900">Tổng tiền</th>
                <th className="px-6 py-4 font-bold text-stone-900">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-stone-900">Tài xế nhận</th>
                <th className="px-6 py-4 font-bold text-stone-900 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    Chưa có đơn hàng nào được phân cho đơn vị của bạn.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id || order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-stone-900">
                      #{String(order._id || order.id).substring(String(order._id || order.id).length - 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{order.shippingAddress?.fullName}</div>
                      <div className="text-xs text-stone-500">{order.shippingAddress?.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-amber-900">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {order.shipperId ? (
                        <div className="text-sm font-medium text-stone-900">
                          {shippers.find(s => (s.userId?._id || s.userId?.id) === order.shipperId)?.userId?.fullName || 'Đã phân công'}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Chưa có tài xế</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setAssignShipperId(order.shipperId || '')
                        }}
                        className="inline-flex items-center gap-1 p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors font-medium text-xs"
                      >
                        Chi tiết
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail / Assign Shipper */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-lg font-black text-stone-900">Chi tiết Phân công</h2>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500 block mb-1">Mã đơn hàng</span>
                    <span className="font-mono font-bold">#{String(selectedOrder._id || selectedOrder.id).substring(String(selectedOrder._id || selectedOrder.id).length - 8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block mb-1">Trạng thái</span>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500 block mb-1">Địa chỉ giao</span>
                    <span className="font-medium text-stone-900">
                      {selectedOrder.shippingAddress?.address
                        ? `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.ward}, ${selectedOrder.shippingAddress.province}`
                        : selectedOrder.shippingAddress?.fullAddress || 'Chưa cập nhật địa chỉ'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.orderStatus === 'assigned' && (
                <div>
                  <h3 className="font-bold text-stone-900 mb-3 text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-800" />
                    Chỉ định Tài xế giao hàng
                  </h3>
                  
                  {assignError && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      {assignError}
                    </div>
                  )}

                  <select
                    value={assignShipperId}
                    onChange={(e) => setAssignShipperId(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Chọn tài xế --</option>
                    {shippers.filter(s => s.isAvailable).map((shipper: any) => (
                      <option key={shipper.userId?._id || shipper.userId?.id} value={shipper.userId?._id || shipper.userId?.id}>
                        {shipper.userId?.fullName} - {shipper.vehicleType} ({shipper.licensePlate})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-stone-500 mt-2 italic">
                    Chỉ những tài xế đang Bật trạng thái "Sẵn sàng giao" mới hiển thị trong danh sách này.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-stone-100 px-6 py-4 flex gap-3 justify-end shrink-0 bg-stone-50/50">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                Đóng
              </button>
              {selectedOrder.orderStatus === 'assigned' && (
                <button
                  onClick={handleAssignShipper}
                  disabled={assignLoading || !assignShipperId || assignShipperId === selectedOrder.shipperId}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 shadow-sm disabled:opacity-50 transition-colors"
                >
                  {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Cập nhật phân công
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
