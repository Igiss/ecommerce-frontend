'use client'

import { useEffect, useState } from 'react'
import {
  DiscountValueType,
  PriceAdjustmentType,
  Product,
  ProductPriceSchedule,
  ScheduleStatus,
} from '@/types/product'
import { priceScheduleService } from '@/lib/api/price-schedule.service'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  X,
  Zap,
  TrendingDown,
  Tag,
  AlertCircle,
} from 'lucide-react'

interface PriceScheduleModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PriceScheduleModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: PriceScheduleModalProps) {
  const [schedules, setSchedules] = useState<ProductPriceSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [type, setType] = useState<PriceAdjustmentType>(PriceAdjustmentType.SALE_CAMPAIGN)
  const [valueType, setValueType] = useState<DiscountValueType>(DiscountValueType.FIXED_PRICE)
  const [value, setValue] = useState<number>(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [title, setTitle] = useState<string>('')

  // Fetch price schedules when modal opens
  useEffect(() => {
    if (isOpen && product) {
      const pId = product._id || product.id || product.productId
      if (pId) {
        loadSchedules(String(pId))
      }

      // Set default datetime to now + 5 minutes
      const now = new Date()
      now.setMinutes(now.getMinutes() + 5)
      setStartDate(now.toISOString().slice(0, 16))

      const defaultEnd = new Date()
      defaultEnd.setDate(defaultEnd.getDate() + 3)
      setEndDate(defaultEnd.toISOString().slice(0, 16))

      setValue(product.price || 0)
    }
  }, [isOpen, product])

  const loadSchedules = async (prodId: string) => {
    setLoading(true)
    try {
      const res = await priceScheduleService.getByProduct(prodId)
      setSchedules(res || [])
    } catch (err: unknown) {
      console.error('Lỗi tải danh sách lịch giá:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !product) return null

  const targetProductId = product._id || product.id || product.productId


  // Calculate preview price
  let previewPrice = product.price
  if (valueType === DiscountValueType.FIXED_PRICE) {
    previewPrice = Number(value) || 0
  } else if (valueType === DiscountValueType.PERCENTAGE) {
    previewPrice = Math.max(0, Math.round(product.price * (1 - (Number(value) || 0) / 100)))
  } else if (valueType === DiscountValueType.AMOUNT_OFF) {
    previewPrice = Math.max(0, Math.round(product.price - (Number(value) || 0)))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!startDate) {
      setErrorMsg('Vui lòng chọn ngày/giờ bắt đầu.')
      return
    }

    if (type === PriceAdjustmentType.SALE_CAMPAIGN && !endDate) {
      setErrorMsg('Chiến dịch Sale bắt buộc phải chọn ngày/giờ kết thúc.')
      return
    }

    if (type === PriceAdjustmentType.SALE_CAMPAIGN && new Date(endDate) <= new Date(startDate)) {
      setErrorMsg('Ngày kết thúc phải lớn hơn ngày bắt đầu.')
      return
    }

    setSubmitting(true)
    try {
      await priceScheduleService.create({
        productId: String(targetProductId),
        type,
        valueType,
        value: Number(value),
        startDate: new Date(startDate).toISOString(),
        endDate: type === PriceAdjustmentType.SALE_CAMPAIGN ? new Date(endDate).toISOString() : undefined,
        title,
      })

      setShowAddForm(false)
      setTitle('')
      await loadSchedules(String(targetProductId))
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo lịch trình giá.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (scheduleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch trình điều chỉnh giá này?')) return
    try {
      await priceScheduleService.cancel(scheduleId)
      await loadSchedules(String(targetProductId))
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể hủy lịch trình giá.'
      alert(msg)
    }
  }

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.PENDING:
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Chờ kích hoạt</span>
      case ScheduleStatus.ACTIVE:
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><Zap className="h-3 w-3 fill-red-600" /> Đang Sale</span>
      case ScheduleStatus.APPLIED:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Đã hạ giá gốc</span>
      case ScheduleStatus.EXPIRED:
        return <span className="bg-stone-100 text-stone-600 text-xs px-2.5 py-0.5 rounded-full font-bold">Hết hạn</span>
      case ScheduleStatus.CANCELLED:
        return <span className="bg-stone-100 text-stone-400 text-xs px-2.5 py-0.5 rounded-full font-bold">Đã hủy</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-amber-600" />
              Lịch Trình Giá & Khuyến Mãi
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Sản phẩm: <span className="font-semibold text-stone-800">{product.name}</span> (Giá gốc: {product.price?.toLocaleString('vi-VN')}đ)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              Danh sách đợt lên lịch giá
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-all shadow-sm"
            >
              {showAddForm ? (
                'Đóng Form'
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Tạo Lịch Điều Chỉnh Giá
                </>
              )}
            </button>
          </div>

          {/* Form Tạo Lịch Mới */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" /> Cấu hình đợt chỉnh giá mới
              </h4>

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Loại Điều Chỉnh */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    type === PriceAdjustmentType.SALE_CAMPAIGN
                      ? 'border-red-500 bg-red-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="adjustmentType"
                      checked={type === PriceAdjustmentType.SALE_CAMPAIGN}
                      onChange={() => setType(PriceAdjustmentType.SALE_CAMPAIGN)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-red-600 fill-red-600" /> Sale Khuyến Mãi
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 pl-5">
                    Có ngày bắt đầu & ngày kết thúc. Hết hạn tự khôi phục giá gốc.
                  </span>
                </label>

                <label
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    type === PriceAdjustmentType.BASE_PRICE_CHANGE
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="adjustmentType"
                      checked={type === PriceAdjustmentType.BASE_PRICE_CHANGE}
                      onChange={() => setType(PriceAdjustmentType.BASE_PRICE_CHANGE)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" /> Hạ / Đổi Giá Gốc
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 pl-5">
                    Cập nhật giá gốc mới vĩnh viễn từ mốc giờ bắt đầu.
                  </span>
                </label>
              </div>

              {/* Tên Chương Trình */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tên đợt / Lý do điều chỉnh</label>
                <input
                  type="text"
                  placeholder={type === PriceAdjustmentType.SALE_CAMPAIGN ? 'VD: Flash Sale 8/8' : 'VD: Hạ giá đợt xả kho'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Cách Tính Giá */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kiểu tính giá</label>
                  <select
                    value={valueType}
                    onChange={(e) => setValueType(e.target.value as DiscountValueType)}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value={DiscountValueType.FIXED_PRICE}>Giá cố định (VNĐ)</option>
                    <option value={DiscountValueType.PERCENTAGE}>Giảm theo %</option>
                    <option value={DiscountValueType.AMOUNT_OFF}>Giảm bớt tiền (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giá trị nhập</label>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giá thực tế sau tính</label>
                  <div className="w-full text-xs font-black text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-2 rounded-lg">
                    {previewPrice.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              {/* Chọn Ngày Giờ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giờ bắt đầu áp dụng (*)</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                {type === PriceAdjustmentType.SALE_CAMPAIGN && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Giờ kết thúc Sale (*)</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lên Lịch Ngay'}
                </button>
              </div>
            </form>
          )}

          {/* List Of Price Schedules */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-stone-100 border border-stone-200 rounded-xl w-full"></div>
              <div className="h-16 bg-stone-100 border border-stone-200 rounded-xl w-full"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-stone-300 rounded-xl bg-stone-50/50">
              <Calendar className="h-8 w-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-600">Chưa có lịch trình điều chỉnh giá nào</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Nhấn "Tạo Lịch Điều Chỉnh Giá" để thiết lập đợt Sale hoặc Hạ giá gốc.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {item.title || (item.type === PriceAdjustmentType.BASE_PRICE_CHANGE ? 'Hạ giá gốc' : 'Sale khuyến mãi')}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-600">
                      <span>
                        Giá mới: <strong className="text-amber-900">{item.calculatedPrice?.toLocaleString('vi-VN')}đ</strong>
                      </span>
                      <span className="text-stone-300">|</span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Clock className="h-3 w-3 text-stone-400" />
                        Bắt đầu: {new Date(item.startDate).toLocaleString('vi-VN')}
                      </span>
                      {item.endDate && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-500">
                          - Kết thúc: {new Date(item.endDate).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {(item.status === ScheduleStatus.PENDING || item.status === ScheduleStatus.ACTIVE) && (
                    <button
                      onClick={() => handleCancel(item.id || item._id!)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hủy lịch trình"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
