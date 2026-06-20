'use client'

import { Package, Truck, CheckCircle, TrendingUp } from 'lucide-react'

export default function ShippingUnitDashboard() {
  const stats = [
    { label: 'Đơn chờ lấy', value: 12, icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Đang giao', value: 34, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Giao thành công', value: 128, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tỉ lệ thành công', value: '98%', icon: TrendingUp, color: 'text-stone-600', bg: 'bg-stone-100' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Tổng quan</h1>
        <p className="text-sm text-stone-500 mt-1">Thống kê hoạt động giao hàng của đơn vị.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black text-stone-900 leading-none mt-1">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 shadow-sm">
        <Truck className="h-12 w-12 text-stone-300 mx-auto mb-4" />
        <p>Tính năng quản lý đơn hàng chi tiết đang được phát triển.</p>
      </div>
    </div>
  )
}
