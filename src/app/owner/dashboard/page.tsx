"use client"

import { useEffect, useState } from "react"
import { getOwnerDashboard } from "@/lib/api/owner.service"
import { DollarSign, ShoppingBag, Package, Ticket, ShoppingCart, Store, Sparkles } from "lucide-react"
import { AiReportModal } from "@/components/UI/AiReportModal"

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiReport, setAiReport] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const handleGenerateAiReport = async () => {
    setIsAiModalOpen(true)
    setAiLoading(true)
    try {
      const { getOwnerAiTrendReport } = await import("@/lib/api/owner.service")
      const report = await getOwnerAiTrendReport()
      setAiReport(report)
    } catch (err: any) {
      setAiReport("Đã xảy ra lỗi khi tạo báo cáo AI: " + (err.message || err))
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    getOwnerDashboard()
      .then((data: any) => {
        setStats(data)
      })
      .catch((err: any) => {
        setError(err.message || "Không thể tải dữ liệu thống kê cửa hàng.")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <p className="text-red-700 font-bold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-red-600 hover:bg-red-700 transition-colors text-white px-5 py-2 text-xs font-bold"
        >
          Tải lại trang
        </button>
      </div>
    )
  }

  const statItems = [
    {
      label: "Doanh thu cửa hàng",
      value: `${(stats?.revenue || 0).toLocaleString("vi-VN")}đ`,
      icon: DollarSign,
      color: "bg-amber-50 text-amber-800 border-amber-100",
    },
    {
      label: "Đơn hàng của shop",
      value: stats?.orderCount || 0,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-800 border-blue-100",
    },
    {
      label: "Số lượng sản phẩm đã bán",
      value: stats?.itemCount || 0,
      icon: ShoppingCart,
      color: "bg-emerald-50 text-emerald-800 border-emerald-100",
    },
    {
      label: "Sản phẩm đang bán",
      value: stats?.productCount || 0,
      icon: Package,
      color: "bg-purple-50 text-purple-800 border-purple-100",
    },
    {
      label: "Mã giảm giá đã tạo",
      value: stats?.couponCount || 0,
      icon: Ticket,
      color: "bg-rose-50 text-rose-800 border-rose-100",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Title & AI Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-amber-800" />
            Kênh người bán - Tổng quan
          </h1>
          <p className="text-xs text-stone-550 mt-1">
            Theo dõi kết quả kinh doanh và hiệu suất cửa hàng của bạn.
          </p>
        </div>
        <button
          onClick={handleGenerateAiReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-md shadow-amber-600/20 hover:from-amber-700 hover:to-orange-700 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4" />
          Phân tích xu hướng (AI)
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="rounded-2xl border border-stone-250/50 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md"
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                  {item.label}
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 mt-1 truncate">
                  {item.value}
                </h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-6">
        <h3 className="text-sm font-bold text-amber-900 mb-2">Chào mừng đến với Kênh Người Bán</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Tại đây bạn có thể quản lý các sản phẩm của shop mình, cập nhật trạng thái đơn hàng khi có khách hàng đặt mua, 
          và phát hành các chương trình khuyến mãi (coupon) dành riêng cho các mẫu cốc của shop. Hệ thống sẽ tự động tổng hợp 
          và hiển thị doanh thu thực nhận của riêng shop bạn sau khi đơn hàng được hoàn tất.
        </p>
      </div>

      <AiReportModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        report={aiReport} 
        loading={aiLoading} 
      />
    </div>
  )
}
