'use client'

import { useEffect, useState } from 'react'
import { getMyOrders } from '@/lib/api/orders.service'
import { ShoppingBag, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export default function ProfileOrdersPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersError, setOrdersError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      fetchOrdersList()
    }
  }, [mounted, user])

  const mapBackendStatusToFrontend = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'processing'
      case 'assigned': return 'processing'
      case 'shipping': return 'shipped'
      case 'completed': return 'delivered'
      default: return status
    }
  }

  const fetchOrdersList = () => {
    setOrdersLoading(true)
    setOrdersError('')
    getMyOrders()
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
          orderItems: order.items || order.orderItems || [],
          isPaid: order.paymentStatus === 'paid' || order.isPaid || false
        }))
        setOrders(normalized)
      })
      .catch((err) => {
        setOrders([])
        setOrdersError(err.message || 'Không thể tải lịch sử đơn hàng.')
      })
      .finally(() => setOrdersLoading(false))
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border border-green-200/50'
      case 'shipped': return 'bg-blue-50 text-blue-700 border border-blue-200/50'
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200/50'
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200/50'
      default: return 'bg-stone-50 text-stone-700 border border-stone-200/50'
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

  if (!mounted || !user) return null

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs min-h-[400px]">
      <div className="space-y-6">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-amber-700" />
          Lịch sử mua hàng
        </h2>

        {ordersLoading ? (
          <div className="flex py-12 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
          </div>
        ) : ordersError ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
            <span>{ordersError}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
            <p className="text-stone-550 text-sm">Bạn chưa thực hiện bất kỳ đơn hàng nào.</p>
            <Link href="/products" className="mt-4 inline-block text-xs font-bold text-amber-800 hover:underline">
              Bắt đầu mua sắm ngay &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm text-stone-600 border-collapse">
              <thead>
                <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                  <th className="py-3 px-5">Mã đơn hàng</th>
                  <th className="py-3 px-5">Ngày đặt</th>
                  <th className="py-3 px-5">Thanh toán</th>
                  <th className="py-3 px-5">Vận chuyển</th>
                  <th className="py-3 px-5">Tổng tiền</th>
                  <th className="py-3 px-5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN')
                  return (
                    <tr key={order._id || order.id} className="hover:bg-stone-50/45 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-stone-850 select-all font-bold">
                        {(order._id || order.id).slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-5 text-stone-500 text-xs">{dateStr}</td>
                      <td className="py-3.5 px-5">
                        {order.isPaid ? (
                          <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-150">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-150">
                            Chưa thanh toán
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-stone-900">
                        {order.totalPrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Link
                          href={`/orders/${order._id || order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-700 transition-colors shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
