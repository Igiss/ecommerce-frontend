"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
import { AiReportModal } from "@/components/UI/AiReportModal"
import {
  getOwnerAiTrendReport,
  getOwnerAnalytics,
  type OwnerAnalytics,
  type OwnerAnalyticsPeriod,
  type OwnerStatusBreakdown,
} from "@/lib/api/owner.service"

const PERIOD_OPTIONS: Array<{
  value: OwnerAnalyticsPeriod
  label: string
  caption: string
}> = [
  { value: "7days", label: "7 ngày", caption: "7 ngày gần nhất" },
  { value: "30days", label: "30 ngày", caption: "30 ngày gần nhất" },
  { value: "12months", label: "12 tháng", caption: "12 tháng gần nhất" },
]

const STATUS_CONFIG: Record<
  OwnerStatusBreakdown["_id"],
  { label: string; color: string }
> = {
  pending: { label: "Chờ xử lý", color: "#f59e0b" },
  confirmed: { label: "Đã xác nhận", color: "#3b82f6" },
  assigned: { label: "Đã phân giao", color: "#8b5cf6" },
  shipping: { label: "Đang giao", color: "#06b6d4" },
  completed: { label: "Hoàn tất", color: "#10b981" },
  cancelled: { label: "Đã hủy", color: "#f43f5e" },
}

const STATUS_ORDER = Object.keys(
  STATUS_CONFIG,
) as OwnerStatusBreakdown["_id"][]

function formatCurrency(value: number) {
  return `${Math.round(value || 0).toLocaleString("vi-VN")}đ`
}

function formatCompactCurrency(value: number) {
  if (!value) return "0đ"
  return `${new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}đ`
}

function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  tone: "amber" | "blue" | "emerald" | "violet"
}) {
  const toneClasses = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  }

  return (
    <article className="group rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_12px_30px_rgba(120,53,15,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-400">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-tight text-stone-900">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
        {description}
      </p>
    </article>
  )
}

type ChartDatum = {
  key: string
  label: string
  revenue: number
  orders: number
}

function buildChartData(analytics: OwnerAnalytics): ChartDatum[] {
  const values = new Map(
    analytics.revenueChart.map((point) => [
      `${point._id.year}-${point._id.month}-${point._id.day || 1}`,
      point,
    ]),
  )
  const endDate = new Date(analytics.periodEnd)

  if (analytics.period === "12months") {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - 11 + index,
        1,
      )
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-1`
      const point = values.get(key)
      return {
        key,
        label: `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`,
        revenue: point?.revenue || 0,
        orders: point?.orders || 0,
      }
    })
  }

  const length = analytics.period === "7days" ? 7 : 30
  return Array.from({ length }, (_, index) => {
    const date = new Date(endDate)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (length - 1 - index))
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const point = values.get(key)
    const label =
      analytics.period === "7days"
        ? new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date)
        : `${date.getDate()}/${date.getMonth() + 1}`

    return {
      key,
      label,
      revenue: point?.revenue || 0,
      orders: point?.orders || 0,
    }
  })
}

function RevenueChart({ analytics }: { analytics: OwnerAnalytics }) {
  const data = useMemo(() => buildChartData(analytics), [analytics])
  const chartWidth = 760
  const chartHeight = 260
  const left = 58
  const right = 16
  const top = 18
  const bottom = 34
  const plotWidth = chartWidth - left - right
  const plotHeight = chartHeight - top - bottom
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 0)
  const scaleMax = maxRevenue > 0 ? maxRevenue * 1.12 : 1
  const points = data.map((item, index) => {
    const x = left + (index / Math.max(data.length - 1, 1)) * plotWidth
    const y = top + plotHeight - (item.revenue / scaleMax) * plotHeight
    return { ...item, x, y }
  })
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const areaPath = points.length
    ? `${linePath} L ${points.at(-1)?.x} ${top + plotHeight} L ${points[0].x} ${top + plotHeight} Z`
    : ""
  const labelIndexes = new Set(
    Array.from({ length: 5 }, (_, index) =>
      Math.round((index * (data.length - 1)) / 4),
    ),
  )
  const hasRevenue = maxRevenue > 0

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
            Doanh thu đã hoàn tất
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-stone-900">
            {formatCurrency(analytics.dashboard.totalRevenue)}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {analytics.dashboard.completedOrders} đơn hoàn tất
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Biểu đồ doanh thu của cửa hàng"
        >
          <defs>
            <linearGradient id="ownerRevenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }, (_, index) => {
            const y = top + (index / 4) * plotHeight
            const value = scaleMax * (1 - index / 4)
            return (
              <g key={index}>
                <line
                  x1={left}
                  y1={y}
                  x2={chartWidth - right}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray="4 5"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#a8a29e"
                  fontSize="10"
                  fontWeight="600"
                >
                  {formatCompactCurrency(value)}
                </text>
              </g>
            )
          })}

          {areaPath && <path d={areaPath} fill="url(#ownerRevenueArea)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#d97706"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((point, index) => (
            <g key={point.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r={data.length <= 12 ? 4 : 2.5}
                fill="white"
                stroke="#d97706"
                strokeWidth="2"
              >
                <title>
                  {point.label}: {formatCurrency(point.revenue)} · {point.orders} đơn
                </title>
              </circle>
              {labelIndexes.has(index) && (
                <text
                  x={point.x}
                  y={chartHeight - 9}
                  textAnchor="middle"
                  fill="#78716c"
                  fontSize="10"
                  fontWeight="600"
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {!hasRevenue && (
          <div className="pointer-events-none absolute inset-x-16 top-[43%] text-center">
            <p className="text-sm font-bold text-stone-500">
              Chưa có doanh thu hoàn tất trong kỳ này
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              Biểu đồ sẽ tự cập nhật khi đơn hàng được hoàn thành.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderStatusCard({ analytics }: { analytics: OwnerAnalytics }) {
  const rows = STATUS_ORDER.map((status) => {
    const source = analytics.statusBreakdown.find((item) => item._id === status)
    return {
      status,
      ...STATUS_CONFIG[status],
      count: source?.orders || 0,
    }
  })
  const statusTotal = rows.reduce((sum, item) => sum + item.count, 0)
  let cursor = 0
  const gradient = statusTotal
    ? `conic-gradient(${rows
        .filter((item) => item.count > 0)
        .map((item) => {
          const start = cursor
          cursor += (item.count / statusTotal) * 100
          return `${item.color} ${start}% ${cursor}%`
        })
        .join(", ")})`
    : "#e7e5e4"
  const completed =
    rows.find((item) => item.status === "completed")?.count || 0
  const completionRate = statusTotal
    ? Math.round((completed / statusTotal) * 100)
    : 0

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-stone-900">
            Tiến độ đơn hàng
          </h2>
          <p className="mt-1 text-[11px] text-stone-500">
            Theo trạng thái xử lý của shop
          </p>
        </div>
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600">
          {analytics.periodOrderCount} đơn
        </span>
      </div>

      <div className="my-5 flex justify-center">
        <div
          className="relative flex h-36 w-36 items-center justify-center rounded-full"
          style={{ background: gradient } as CSSProperties}
        >
          <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-2xl font-black text-stone-900">
              {completionRate}%
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-stone-400">
              hoàn tất
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map((item) => (
          <div key={item.status} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-[10px] font-medium text-stone-600">
                {item.label}
              </span>
            </div>
            <span className="text-[11px] font-black text-stone-800">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-3">
          <div className="h-7 w-72 rounded-lg bg-stone-200" />
          <div className="h-3 w-96 rounded bg-stone-100" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-stone-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-stone-200/70" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.85fr)]">
        <div className="h-[390px] rounded-2xl bg-stone-200/70" />
        <div className="h-[390px] rounded-2xl bg-stone-200/70" />
      </div>
    </div>
  )
}

export default function OwnerDashboardPage() {
  const [period, setPeriod] = useState<OwnerAnalyticsPeriod>("30days")
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiReport, setAiReport] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setRefreshing(true)
    setError("")

    getOwnerAnalytics(period)
      .then((data) => {
        if (!cancelled) setAnalytics(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu thống kê cửa hàng."
          setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [period])

  const handleGenerateAiReport = async () => {
    setIsAiModalOpen(true)
    setAiLoading(true)
    setAiReport("")
    try {
      const report = await getOwnerAiTrendReport()
      setAiReport(report)
    } catch {
      setAiReport(
        "Hiện chưa thể tạo báo cáo AI. Hệ thống có thể đang bận, bạn vui lòng thử lại sau ít phút.",
      )
    } finally {
      setAiLoading(false)
    }
  }

  if (loading && !analytics) {
    return <DashboardSkeleton />
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <CircleAlert className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-3 font-bold text-red-700">
          {error || "Không thể tải dữ liệu thống kê cửa hàng."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại trang
        </button>
      </div>
    )
  }

  const periodCaption =
    PERIOD_OPTIONS.find((item) => item.value === period)?.caption ||
    "Kỳ được chọn"
  const statusCount = (status: OwnerStatusBreakdown["_id"]) =>
    analytics.statusBreakdown.find((item) => item._id === status)?.orders || 0
  const completedOrders = statusCount("completed")
  const awaitingOrders = statusCount("pending") + statusCount("confirmed")
  const shippingOrders = statusCount("assigned") + statusCount("shipping")
  const averageOrderValue = completedOrders
    ? analytics.dashboard.totalRevenue / completedOrders
    : 0
  const maxProductSold = Math.max(
    ...analytics.topProducts.map((item) => item.totalSold),
    1,
  )

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-stone-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Store className="h-5 w-5" />
            </span>
            Kênh người bán – Tổng quan
          </h1>
          <p className="mt-2 text-xs text-stone-500">
            Theo dõi doanh thu, đơn hàng và những việc cần ưu tiên của cửa hàng.
          </p>
        </div>

        <button
          onClick={handleGenerateAiReport}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700"
        >
          <Sparkles className="h-4 w-4" />
          Phân tích xu hướng (AI)
        </button>
      </header>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="px-2">
          <p className="text-xs font-bold text-stone-800">Kỳ báo cáo</p>
          <p className="mt-0.5 text-[10px] text-stone-400">
            Dữ liệu doanh thu chỉ tính các đơn đã hoàn tất.
          </p>
        </div>
        <div className="flex rounded-xl bg-stone-100 p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`relative flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:flex-none ${
                period === option.value
                  ? "bg-white text-amber-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {option.label}
              {period === option.value && refreshing && (
                <RefreshCw className="ml-1.5 inline h-3 w-3 animate-spin" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          <CircleAlert className="h-4 w-4 shrink-0" />
          Chưa thể làm mới số liệu: {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Doanh thu"
          value={formatCurrency(analytics.dashboard.totalRevenue)}
          description={`${periodCaption} · đơn hoàn tất`}
          icon={BadgeDollarSign}
          tone="amber"
        />
        <KpiCard
          label="Đơn hàng"
          value={analytics.periodOrderCount}
          description={`${periodCaption} · mọi trạng thái`}
          icon={ShoppingBag}
          tone="blue"
        />
        <KpiCard
          label="Sản phẩm trong đơn"
          value={analytics.periodItemCount}
          description="Tổng số lượng khách đã đặt"
          icon={ShoppingCart}
          tone="emerald"
        />
        <KpiCard
          label="Giá trị đơn trung bình"
          value={formatCurrency(averageOrderValue)}
          description="Trên mỗi đơn đã hoàn tất"
          icon={TrendingUp}
          tone="violet"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]">
        <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <RevenueChart analytics={analytics} />
        </article>
        <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <OrderStatusCard analytics={analytics} />
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-stone-900">
                Sản phẩm bán chạy
              </h2>
              <p className="mt-1 text-[11px] text-stone-500">
                Xếp hạng theo số lượng bán trong {periodCaption.toLowerCase()}
              </p>
            </div>
            <Link
              href="/owner/products"
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900"
            >
              Xem sản phẩm
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {analytics.topProducts.length > 0 ? (
            <div className="mt-5 space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                      index === 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-bold text-stone-800">
                        {product.name}
                      </p>
                      <span className="shrink-0 text-[11px] font-black text-stone-800">
                        {product.totalSold} đã bán
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        style={{
                          width: `${Math.max(
                            (product.totalSold / maxProductSold) * 100,
                            5,
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[9px] font-medium text-stone-400">
                      {formatCurrency(product.revenue)} doanh thu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/70 text-center">
              <Package className="h-8 w-8 text-stone-300" />
              <p className="mt-2 text-xs font-bold text-stone-500">
                Chưa có sản phẩm bán chạy
              </p>
              <p className="mt-1 text-[10px] text-stone-400">
                Số liệu sẽ xuất hiện khi có đơn hoàn tất.
              </p>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-black text-stone-900">
              Việc cần ưu tiên
            </h2>
            <p className="mt-1 text-[11px] text-stone-500">
              Các đầu việc có thể ảnh hưởng đến vận hành shop
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href="/owner/orders"
              className="group flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 transition-colors hover:bg-amber-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <Clock3 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-800">
                  Đơn đang chờ xử lý
                </p>
                <p className="mt-0.5 text-[10px] text-stone-500">
                  Kiểm tra và chuẩn bị hàng sớm
                </p>
              </div>
              <span className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-black text-white">
                {awaitingOrders}
              </span>
            </Link>

            <Link
              href="/owner/orders"
              className="group flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 transition-colors hover:bg-sky-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                <Truck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-800">
                  Đơn đang vận chuyển
                </p>
                <p className="mt-0.5 text-[10px] text-stone-500">
                  Theo dõi tiến độ giao hàng
                </p>
              </div>
              <span className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-black text-white">
                {shippingOrders}
              </span>
            </Link>

            <Link
              href="/owner/products"
              className="group flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 transition-colors hover:bg-rose-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm">
                <Warehouse className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-800">
                  Sản phẩm sắp hết hàng
                </p>
                <p className="mt-0.5 text-[10px] text-stone-500">
                  Tồn kho dưới 5 sản phẩm
                </p>
              </div>
              <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-black text-white">
                {analytics.dashboard.lowStockProducts}
              </span>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-stone-200 rounded-xl border border-stone-200 bg-stone-50/60 py-3">
            <div className="px-3 text-center">
              <Users className="mx-auto h-4 w-4 text-blue-600" />
              <p className="mt-1.5 text-sm font-black text-stone-900">
                {analytics.dashboard.totalCustomers}
              </p>
              <p className="text-[9px] font-medium text-stone-400">Khách hàng</p>
            </div>
            <div className="px-3 text-center">
              <Package className="mx-auto h-4 w-4 text-violet-600" />
              <p className="mt-1.5 text-sm font-black text-stone-900">
                {analytics.lifetime.productCount}
              </p>
              <p className="text-[9px] font-medium text-stone-400">Sản phẩm</p>
            </div>
            <div className="px-3 text-center">
              <Ticket className="mx-auto h-4 w-4 text-rose-600" />
              <p className="mt-1.5 text-sm font-black text-stone-900">
                {analytics.lifetime.couponCount}
              </p>
              <p className="text-[9px] font-medium text-stone-400">Mã giảm giá</p>
            </div>
          </div>
        </article>
      </section>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold text-stone-800">
              Số liệu được cập nhật từ đơn hàng thực tế
            </p>
            <p className="mt-0.5 text-[10px] text-stone-500">
              Tổng cộng toàn thời gian: {analytics.lifetime.orderCount} đơn ·{" "}
              {formatCurrency(analytics.lifetime.revenue)} doanh thu.
            </p>
          </div>
        </div>
        <Link
          href="/owner/orders"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
        >
          Quản lý đơn hàng
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
