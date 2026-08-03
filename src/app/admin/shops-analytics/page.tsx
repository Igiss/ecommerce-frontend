"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import {
  getAdminShopsCategoryBreakdown,
  getAdminShopsComparison,
  getAdminShopsTrendChart,
  type AdminShopCategoryBreakdownItem,
  type AdminShopComparisonItem,
  type AdminShopComparisonResponse,
  type AdminShopTrendChartResponse,
} from "@/lib/api/admin.service"

type PeriodOption = "7days" | "30days" | "12months" | "custom"
type SortFieldOption = "totalItemsSold" | "totalRevenue" | "totalOrders" | "completionRate" | "totalProducts"

const PERIOD_LABELS: Record<PeriodOption, string> = {
  "7days": "7 ngày gần nhất",
  "30days": "30 ngày gần nhất",
  "12months": "12 tháng gần nhất",
  custom: "Tùy chọn ngày",
}

function formatCurrency(val: number): string {
  return `${Math.round(val || 0).toLocaleString("vi-VN")}đ`
}

function formatCompactCurrency(val: number): string {
  if (!val) return "0đ"
  return `${new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val)}đ`
}

export default function AdminShopsAnalyticsPage() {
  // State
  const [period, setPeriod] = useState<PeriodOption>("30days")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortFieldOption>("totalItemsSold")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const limit = 10

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [comparisonData, setComparisonData] = useState<AdminShopComparisonResponse | null>(null)
  const [trendChartData, setTrendChartData] = useState<AdminShopTrendChartResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<AdminShopCategoryBreakdownItem[]>([])

  // Fetch Data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const isCustom = period === "custom"
      const apiPeriod = isCustom ? undefined : period
      const apiFrom = isCustom && fromDate ? fromDate : undefined
      const apiTo = isCustom && toDate ? toDate : undefined

      const [compRes, trendRes, catRes] = await Promise.all([
        getAdminShopsComparison({
          period: apiPeriod,
          from: apiFrom,
          to: apiTo,
          sortBy,
          order,
          page,
          limit,
          search: search.trim() || undefined,
        }),
        getAdminShopsTrendChart({
          period: apiPeriod,
          sortBy,
        }),
        getAdminShopsCategoryBreakdown({
          from: apiFrom,
          to: apiTo,
        }),
      ])

      setComparisonData(compRes)
      setTrendChartData(trendRes)
      setCategoryBreakdown(catRes)
    } catch (err: any) {
      console.error("Failed to load shop analytics:", err)
      setError(err?.message || "Không thể tải dữ liệu thống kê shop. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period, sortBy, order, page, search])

  // Handle manual filter submit for custom date
  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleSortChange = (field: SortFieldOption) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setOrder("desc")
    }
    setPage(1)
  }

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (!comparisonData || comparisonData.data.length === 0) {
      return {
        topShop: null,
        totalItemsSold: 0,
        totalRevenue: 0,
        avgCompletionRate: 0,
        totalShops: 0,
      }
    }

    const items = comparisonData.data
    const topShop = items[0]
    const totalItemsSold = items.reduce((acc, curr) => acc + (curr.totalItemsSold || 0), 0)
    const totalRevenue = items.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0)
    const avgCompletionRate =
      items.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / items.length

    return {
      topShop,
      totalItemsSold,
      totalRevenue,
      avgCompletionRate,
      totalShops: comparisonData.meta.total,
    }
  }, [comparisonData])

  // Highest volume in current view for comparative bar percentages
  const maxItemsSoldInView = useMemo(() => {
    if (!comparisonData?.data.length) return 1
    return Math.max(...comparisonData.data.map((item) => item.totalItemsSold || 0), 1)
  }, [comparisonData])

  const maxRevenueInView = useMemo(() => {
    if (!comparisonData?.data.length) return 1
    return Math.max(...comparisonData.data.map((item) => item.totalRevenue || 0), 1)
  }, [comparisonData])

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Store className="h-4 w-4" />
            Báo cáo Quản trị Admin
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900 md:text-3xl">
            So sánh & Thống kê Các Shop
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Phân tích số lượng bán, doanh thu và hiệu suất vận hành của từng nhà bán hàng trên toàn hệ thống.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:text-stone-900 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Bar & Time Horizon Picker */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Period Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-stone-100 p-1">
            {(Object.keys(PERIOD_LABELS) as PeriodOption[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setPeriod(key)
                  setPage(1)
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  period === key
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {PERIOD_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm shop, chủ shop..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-4 py-2 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Custom Date Picker Range (Shown when 'custom' is active) */}
        {period === "custom" && (
          <form onSubmit={handleCustomDateSubmit} className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Từ ngày:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Đến ngày:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
            >
              Áp dụng
            </button>
          </form>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData()} className="underline font-bold hover:text-red-900">
            Thử lại
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Top Performer Card */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
              Shop Dẫn Đầu Bán Chạy
            </span>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-black text-stone-900 truncate">
              {summaryMetrics.topShop ? summaryMetrics.topShop.storeName : "Chưa có dữ liệu"}
            </p>
            <p className="mt-1 text-xs text-amber-700 font-bold">
              {summaryMetrics.topShop
                ? `${summaryMetrics.topShop.totalItemsSold.toLocaleString("vi-VN")} sản phẩm (${formatCompactCurrency(summaryMetrics.topShop.totalRevenue)})`
                : "--"}
            </p>
          </div>
        </div>

        {/* Total Items Sold Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Tổng Sản Lượng Bán
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-stone-900">
              {summaryMetrics.totalItemsSold.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-xs text-stone-500 font-medium">Sản phẩm đã bán ra trong kỳ</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Doanh Thu Đa Shop
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-emerald-700">
              {formatCompactCurrency(summaryMetrics.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-stone-500 font-medium">
              Chưa trừ chiết khấu vận chuyển
            </p>
          </div>
        </div>

        {/* Avg Completion Rate Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Tỷ Lệ Hoàn Thành TB
            </span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-stone-900">
              {summaryMetrics.avgCompletionRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-stone-500 font-medium">
              Trên tổng số {summaryMetrics.totalShops} nhà bán hàng
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts & Comparison Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 Shops Comparative Chart Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                  Top 5 Shop Bán Chạy Nhất
                </h3>
                <p className="text-xs text-stone-500">So sánh sản lượng bán ra giữa các Shop hàng đầu</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {trendChartData?.shops && trendChartData.shops.length > 0 ? (
                comparisonData?.data.slice(0, 5).map((shop, idx) => {
                  const percentage = Math.round((shop.totalItemsSold / maxItemsSoldInView) * 100)
                  return (
                    <div key={shop.ownerId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 truncate">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-[10px] font-extrabold text-stone-700">
                            {idx + 1}
                          </span>
                          <span className="truncate text-stone-900 font-bold">{shop.storeName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-stone-900">
                            {shop.totalItemsSold.toLocaleString("vi-VN")} cái
                          </span>
                          <span className="text-stone-400 font-normal">
                            ({formatCompactCurrency(shop.totalRevenue)})
                          </span>
                        </div>
                      </div>
                      {/* Comparative Progress Bar */}
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">Chưa có dữ liệu so sánh</div>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown Matrix */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-600" />
                  Sản Lượng Bán Theo Danh Mục
                </h3>
                <p className="text-xs text-stone-500">Phân bổ doanh số của các Shop trong từng nhóm sản phẩm</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 max-h-72 overflow-y-auto pr-1">
              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat) => (
                  <div key={cat._id.categoryId} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                        {cat._id.categoryName}
                      </span>
                      <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        Tổng: {cat.categoryTotalItemsSold.toLocaleString("vi-VN")} cái
                      </span>
                    </div>

                    {/* Top seller in category */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cat.shops.slice(0, 3).map((shop) => (
                        <div
                          key={shop.ownerId}
                          className="flex items-center gap-1.5 rounded-lg bg-white border border-stone-200/80 px-2.5 py-1 text-[11px] font-medium text-stone-700"
                        >
                          <Store className="h-3 w-3 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[120px] font-bold text-stone-800">{shop.storeName}</span>
                          <span className="text-stone-400 font-semibold">({shop.totalItemsSold})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  Chưa có dữ liệu danh mục trong kỳ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Comparison Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 p-5 bg-stone-50/40">
          <div>
            <h3 className="text-base font-bold text-stone-900">Bảng So Sánh Chi Tiết Các Shop</h3>
            <p className="text-xs text-stone-500">
              Nhấn vào tiêu đề từng cột để sắp xếp thứ tự danh sách.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortFieldOption)
                setPage(1)
              }}
              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="totalItemsSold">Số lượng bán nhiều nhất</option>
              <option value="totalRevenue">Doanh thu cao nhất</option>
              <option value="totalOrders">Số đơn hàng nhiều nhất</option>
              <option value="completionRate">Tỷ lệ hoàn thành cao nhất</option>
              <option value="totalProducts">Số lượng sản phẩm</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-100/70 text-[11px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3.5 w-16 text-center">Hạng</th>
                <th className="px-5 py-3.5 min-w-[200px]">Cửa hàng / Chủ Shop</th>
                <th
                  onClick={() => handleSortChange("totalProducts")}
                  className="px-5 py-3.5 text-center cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    Sản phẩm
                    {sortBy === "totalProducts" && (
                      <span className="text-amber-600">{order === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("totalOrders")}
                  className="px-5 py-3.5 text-center cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    Số đơn hàng
                    {sortBy === "totalOrders" && (
                      <span className="text-amber-600">{order === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("totalItemsSold")}
                  className="px-5 py-3.5 text-right cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    Số lượng bán
                    {sortBy === "totalItemsSold" && (
                      <span className="text-amber-600">{order === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("totalRevenue")}
                  className="px-5 py-3.5 text-right cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    Doanh thu
                    {sortBy === "totalRevenue" && (
                      <span className="text-amber-600">{order === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("completionRate")}
                  className="px-5 py-3.5 text-center cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    Tỷ lệ hoàn thành
                    {sortBy === "completionRate" && (
                      <span className="text-amber-600">{order === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4 text-center">
                      <div className="h-6 w-6 rounded-full bg-stone-200 mx-auto" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 rounded bg-stone-200 mb-1" />
                      <div className="h-3 w-20 rounded bg-stone-100" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="h-4 w-8 rounded bg-stone-200 mx-auto" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="h-4 w-12 rounded bg-stone-200 mx-auto" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-4 w-16 rounded bg-stone-200 ml-auto" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-4 w-24 rounded bg-stone-200 ml-auto" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="h-4 w-12 rounded bg-stone-200 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : comparisonData?.data && comparisonData.data.length > 0 ? (
                comparisonData.data.map((shop, index) => {
                  const rankNumber = (page - 1) * limit + index + 1
                  const isTop1 = rankNumber === 1
                  const isTop2 = rankNumber === 2
                  const isTop3 = rankNumber === 3

                  return (
                    <tr
                      key={shop.ownerId}
                      className="hover:bg-amber-50/30 transition-colors group"
                    >
                      {/* Rank Badge */}
                      <td className="px-5 py-4 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-extrabold shadow-sm border border-amber-300">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-extrabold shadow-sm border border-slate-300">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 text-sm font-extrabold shadow-sm border border-amber-800/20">
                            🥉
                          </span>
                        ) : (
                          <span className="text-stone-500 font-semibold">{rankNumber}</span>
                        )}
                      </td>

                      {/* Store / Owner Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center border border-amber-200 uppercase">
                            {shop.storeName ? shop.storeName.charAt(0) : "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                              {shop.storeName}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">
                              {shop.email || shop.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Products */}
                      <td className="px-5 py-4 text-center font-semibold text-stone-700">
                        {shop.totalProducts}
                      </td>

                      {/* Total Orders */}
                      <td className="px-5 py-4 text-center font-semibold text-stone-700">
                        {shop.totalOrders}
                      </td>

                      {/* Total Items Sold */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-stone-900 text-sm">
                          {shop.totalItemsSold.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-normal">sản phẩm</span>
                      </td>

                      {/* Total Revenue */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-emerald-700 text-sm">
                          {formatCurrency(shop.totalRevenue)}
                        </span>
                      </td>

                      {/* Completion Rate */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${
                              shop.completionRate >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : shop.completionRate >= 70
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {shop.completionRate}%
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={`h-full rounded-full ${
                                shop.completionRate >= 90
                                  ? "bg-emerald-500"
                                  : shop.completionRate >= 70
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(shop.completionRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-stone-400">
                    Không tìm thấy nhà bán hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {comparisonData?.meta && comparisonData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 p-4 bg-stone-50/50 text-xs">
            <span className="text-stone-500 font-medium">
              Hiển thị {comparisonData.data.length} trên tổng số {comparisonData.meta.total} shop
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              <span className="text-stone-700 font-bold px-2">
                {page} / {comparisonData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(comparisonData.meta.totalPages, p + 1))}
                disabled={page >= comparisonData.meta.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-40"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
