'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getRevenueChart, getTopProducts } from '@/lib/api/admin.service'
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react'
import { AiReportModal } from '@/components/UI/AiReportModal'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiReport, setAiReport] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleGenerateAiReport = async () => {
    setIsAiModalOpen(true)
    setAiLoading(true)
    try {
      const { getAiTrendReport } = await import('@/lib/api/admin.service')
      const res = await getAiTrendReport()
      setAiReport(res.report || '')
    } catch (err: any) {
      setAiReport('Đã xảy ra lỗi khi tạo báo cáo AI: ' + (err.message || err))
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([getDashboardStats(), getRevenueChart(), getTopProducts()])
      .then(([statsRes, chartRes, topRes]) => {
        setStats(statsRes)
        
        // Normalize and pad revenue-chart data (ensures a line is drawn even with sparse database records)
        const normalizedChart: any[] = []
        const isMonthly = (chartRes || []).some((item: any) => item._id && !('day' in item._id))

        if (isMonthly) {
          // Pad last 12 months
          for (let i = 11; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const m = d.getMonth() + 1
            const y = d.getFullYear()
            const dateStr = `${m}/${y}`
            
            const match = (chartRes || []).find((item: any) => {
              if (item._id && typeof item._id === 'object') {
                return Number(item._id.month) === m && Number(item._id.year) === y
              }
              return false
            })

            normalizedChart.push({
              date: dateStr,
              revenue: match ? match.revenue : 0,
              orders: match ? match.orders : 0
            })
          }
        } else {
          // Pad last 7 days (default)
          for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`
            
            const match = (chartRes || []).find((item: any) => {
              if (item._id && typeof item._id === 'object') {
                return Number(item._id.day) === d.getDate() && Number(item._id.month) === (d.getMonth() + 1)
              }
              return false
            })

            normalizedChart.push({
              date: dateStr,
              revenue: match ? match.revenue : 0,
              orders: match ? match.orders : 0
            })
          }
        }

        setChartData(normalizedChart)
        setTopProducts(topRes)
      })
      .catch((err: any) => {
        const msg = err.message || ''
        if (
          msg.includes('403') || 
          msg.toLowerCase().includes('forbidden') || 
          msg.includes('401') || 
          msg.toLowerCase().includes('unauthorized')
        ) {
          setError('Tài khoản hiện tại của bạn không có quyền quản trị (Admin). Vui lòng Đăng xuất và đăng nhập lại bằng tài khoản Admin (ví dụ: admin@cupstore.com / Admin123!).')
        } else {
          setError('Không thể tải dữ liệu thống kê quản trị. Hãy kiểm tra kết nối server.')
        }
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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
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
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue || 0), 1) : 1

  // SVG Chart Dimensions
  const svgWidth = 600
  const svgHeight = 245
  const paddingLeft = 55
  const paddingRight = 20
  const paddingTop = 25
  const paddingBottom = 40
  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  const points = chartData.map((d: any, idx: number) => {
    const x = chartData.length === 1
      ? paddingLeft + chartWidth / 2
      : paddingLeft + (idx * (chartWidth / (chartData.length - 1)))
    const y = (svgHeight - paddingBottom) - ((d.revenue / maxRevenue) * chartHeight)
    return { x, y, data: d, idx }
  })

  // Line & Area Paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z` 
    : ''

  const gridValues = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="space-y-8">
      {/* Page Title & AI Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Thống kê hệ thống</h1>
          <p className="text-xs text-stone-550 mt-1">Tổng quan về kết quả kinh doanh và số liệu vận hành của cửa hàng.</p>
        </div>
        <button
          onClick={handleGenerateAiReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-md shadow-amber-600/20 hover:from-amber-700 hover:to-orange-700 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4" />
          Phân tích xu hướng (AI)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-semibold uppercase">Doanh thu</span>
            <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">
              {(stats?.totalRevenue || stats?.revenue || 0).toLocaleString('vi-VN')}đ
            </h3>
          </div>
        </div>

        {/* Orders Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-stone-400 font-semibold uppercase">Đơn hàng</span>
            <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">{stats?.totalOrders || 0}</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">
              {stats?.pendingOrders || 0} đang chờ | {stats?.completedOrders || stats?.deliveredOrders || 0} đã giao
            </p>
          </div>
        </div>

        {/* Products Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-800 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-stone-400 font-semibold uppercase">Sản phẩm</span>
            <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">{stats?.totalProducts || 0}</h3>
            {stats?.lowStockProducts > 0 && (
              <p className="text-[10px] text-red-600 mt-0.5 flex items-center gap-1 font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                {stats.lowStockProducts} mặt hàng sắp hết
              </p>
            )}
          </div>
        </div>

        {/* Users Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-stone-100 text-stone-850 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-semibold uppercase">Khách hàng</span>
            <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">{stats?.totalUsers || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart - SVG Line Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs relative">
          <h3 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-wider">Doanh thu theo thời gian</h3>
          
          {chartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-stone-400">
              Không có dữ liệu biểu đồ.
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="auto" className="overflow-visible">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b45309" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines & Y-Axis Labels */}
                {gridValues.map((val, idx) => {
                  const y = (svgHeight - paddingBottom) - (val * chartHeight)
                  const labelVal = Math.round(val * maxRevenue)
                  return (
                    <g key={idx} className="opacity-60">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#f5f5f4"
                        strokeWidth="1.5"
                      />
                      <text
                        x={paddingLeft - 12}
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[9px] fill-stone-400 font-bold"
                      >
                        {labelVal >= 1000000 
                          ? `${(labelVal / 1000000).toFixed(1)}M` 
                          : labelVal >= 1000 
                            ? `${(labelVal / 1000).toFixed(0)}k` 
                            : labelVal}đ
                      </text>
                    </g>
                  )
                })}

                {/* Area under the line */}
                {areaPath && (
                  <path d={areaPath} fill="url(#chart-gradient)" />
                )}

                {/* The line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#b45309"
                    strokeWidth="2.5"
                  />
                ))}

                {/* Interactive Hover Guides & Dots */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <g>
                    {/* Vertical guideline */}
                    <line
                      x1={points[hoveredIndex].x}
                      y1={paddingTop - 10}
                      x2={points[hoveredIndex].x}
                      y2={svgHeight - paddingBottom}
                      stroke="#b45309"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                    {/* Hover pulsing ring */}
                    <circle
                      cx={points[hoveredIndex].x}
                      cy={points[hoveredIndex].y}
                      r="8"
                      fill="#b45309"
                      fillOpacity="0.2"
                      className="animate-ping"
                      style={{ transformOrigin: `${points[hoveredIndex].x}px ${points[hoveredIndex].y}px` }}
                    />
                    {/* Hover highlighted dot */}
                    <circle
                      cx={points[hoveredIndex].x}
                      cy={points[hoveredIndex].y}
                      r="6"
                      fill="#b45309"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* SVG Native Tooltip */}
                    {(() => {
                      const p = points[hoveredIndex]
                      const tooltipWidth = 140
                      const tooltipHeight = 65
                      const tooltipX = p.x + tooltipWidth + 10 > svgWidth - paddingRight ? p.x - tooltipWidth - 10 : p.x + 10
                      const tooltipY = Math.max(p.y - tooltipHeight / 2, paddingTop)

                      return (
                        <g>
                          {/* Shadow rect */}
                          <rect
                            x={tooltipX + 2}
                            y={tooltipY + 2}
                            width={tooltipWidth}
                            height={tooltipHeight}
                            rx="8"
                            fill="#000000"
                            opacity="0.1"
                          />
                          {/* Tooltip container */}
                          <rect
                            x={tooltipX}
                            y={tooltipY}
                            width={tooltipWidth}
                            height={tooltipHeight}
                            rx="8"
                            fill="#1c1917"
                            stroke="#44403c"
                            strokeWidth="1"
                          />
                          <text x={tooltipX + 12} y={tooltipY + 18} fill="#f59e0b" fontSize="10" fontWeight="extrabold" fontFamily="sans-serif">
                            {p.data.date || p.data.month}
                          </text>
                          <text x={tooltipX + 12} y={tooltipY + 35} fill="#d6d3d1" fontSize="9" fontFamily="sans-serif">
                            Doanh thu:
                          </text>
                          <text x={tooltipX + 62} y={tooltipY + 35} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                            {p.data.revenue.toLocaleString('vi-VN')}đ
                          </text>
                          <text x={tooltipX + 12} y={tooltipY + 50} fill="#d6d3d1" fontSize="9" fontFamily="sans-serif">
                            Đơn hàng:
                          </text>
                          <text x={tooltipX + 62} y={tooltipY + 50} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                            {p.data.orders} đơn
                          </text>
                        </g>
                      )
                    })()}
                  </g>
                )}

                {/* X-Axis Labels */}
                {points.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 15}
                    textAnchor="middle"
                    className="text-[9px] fill-stone-400 font-bold"
                  >
                    {p.data.date || p.data.month}
                  </text>
                ))}

                {/* Invisible hover zones */}
                {points.map((p, idx) => {
                  const segmentWidth = chartWidth / (chartData.length || 1)
                  const rectX = p.x - segmentWidth / 2
                  return (
                    <rect
                      key={idx}
                      x={rectX}
                      y={paddingTop - 10}
                      width={segmentWidth}
                      height={chartHeight + 20}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  )
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Top selling products list */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-wider">Top sản phẩm bán chạy</h3>
          
          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Chưa có dữ liệu sản phẩm bán chạy.
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {topProducts.map((p: any, idx: number) => {
                const imageUrl = p.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
                return (
                  <div key={idx} className="flex items-center gap-3 border-b border-stone-50 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-xs font-bold text-stone-400 w-5 text-center shrink-0">#{idx + 1}</span>
                    <img src={imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-stone-50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Đã bán: {p.totalSold} chiếc</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-900 shrink-0">
                      {p.revenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
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
