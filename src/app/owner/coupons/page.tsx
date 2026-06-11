'use client'

import { useEffect, useState } from 'react'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api/admin.service'
import { useAuthStore } from '@/store/auth.store'
import { Plus, Edit2, Trash2, X, AlertCircle, Calendar, Ticket } from 'lucide-react'

export default function OwnerCouponsPage() {
  const { user } = useAuthStore()
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null)

  // Form Fields
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [minOrderValue, setMinOrderValue] = useState(0)
  const [maxDiscount, setMaxDiscount] = useState(0)
  const [expiryDate, setExpiryDate] = useState('')
  const [usageLimit, setUsageLimit] = useState(100)
  const [isActive, setIsActive] = useState(true)

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Owner specific prefix: C_OWNERID_
  const getOwnerPrefix = () => {
    if (!user?.id) return ''
    return `C_${user.id.substring(0, 5).toUpperCase()}_`
  }

  const fetchCouponsList = () => {
    if (!user?.id) return
    setLoading(true)
    const prefix = getOwnerPrefix()
    
    getCoupons()
      .then((data: any) => {
        let list = Array.isArray(data) ? data : []
        
        // Filter coupons that start with this owner's prefix
        const filtered = list.filter((c: any) => c.code && c.code.startsWith(prefix))
        setCoupons(filtered)
      })
      .catch((err) => {
        setError('Không thể tải danh sách mã giảm giá.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCouponsList()
  }, [user])

  // Open modal for add
  const handleAddClick = () => {
    setEditingCoupon(null)
    setCode('')
    setDiscountType('percentage')
    setDiscountAmount(10)
    setMinOrderValue(100000)
    setMaxDiscount(50000)
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setUsageLimit(100)
    setIsActive(true)
    setFormError('')
    setIsOpen(true)
  }

  // Open modal for edit
  const handleEditClick = (coupon: any) => {
    setEditingCoupon(coupon)
    const prefix = getOwnerPrefix()
    // Strip prefix for clean display in form edit
    const cleanCode = coupon.code.startsWith(prefix) 
      ? coupon.code.replace(prefix, '') 
      : coupon.code

    setCode(cleanCode)
    setDiscountType(coupon.discountType || 'percentage')
    setDiscountAmount(coupon.discountAmount || 0)
    setMinOrderValue(coupon.minOrderValue || 0)
    setMaxDiscount(coupon.maxDiscount || 0)
    const formattedDate = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
    setExpiryDate(formattedDate)
    setUsageLimit(coupon.usageLimit || 100)
    setIsActive(coupon.isActive !== undefined ? coupon.isActive : true)
    setFormError('')
    setIsOpen(true)
  }

  // Handle delete
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) return
    try {
      await deleteCoupon(id)
      fetchCouponsList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa mã giảm giá.')
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    if (discountAmount <= 0 || minOrderValue < 0 || usageLimit <= 0) {
      setFormError('Các giá trị nhập vào phải là số dương hợp lệ.')
      setFormLoading(false)
      return
    }

    if (discountType === 'percentage' && discountAmount > 100) {
      setFormError('Phần trăm giảm giá không được vượt quá 100%.')
      setFormLoading(false)
      return
    }

    const prefix = getOwnerPrefix()
    const rawCleanCode = code.trim().toUpperCase()
    
    // Prevent adding prefixes manually
    if (rawCleanCode.startsWith('C_') && rawCleanCode.includes('_')) {
      setFormError('Mã giảm giá không được chứa tiền tố hệ thống "C_***_".')
      setFormLoading(false)
      return
    }

    const fullCode = `${prefix}${rawCleanCode}`

    try {
      const couponData = {
        code: fullCode,
        discountType,
        discountAmount,
        minOrderValue,
        maxDiscount: discountType === 'percentage' ? maxDiscount : undefined,
        expiryDate: new Date(expiryDate),
        usageLimit,
        isActive
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id || editingCoupon.id, couponData)
      } else {
        await createCoupon(couponData)
      }

      setIsOpen(false)
      fetchCouponsList()
    } catch (err: any) {
      setFormError(err.message || 'Lỗi lưu thông tin mã giảm giá.')
    } finally {
      setFormLoading(false)
    }
  }

  const prefix = getOwnerPrefix()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Quản lý Mã giảm giá của Shop
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Tạo các chương trình khuyến mãi, giảm giá cho các sản phẩm của shop.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors"
        >
          <Plus className="h-4.5 w-4.5" />
          Tạo mã mới
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-550 text-sm">Shop chưa tạo mã giảm giá nào.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">Mã Code</th>
                <th className="py-3.5 px-6">Loại giảm</th>
                <th className="py-3.5 px-6">Mức giảm</th>
                <th className="py-3.5 px-6">Đơn tối thiểu</th>
                <th className="py-3.5 px-6">Hạn dùng</th>
                <th className="py-3.5 px-6">Lượt dùng</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date()
                const dateStr = new Date(coupon.expiryDate).toLocaleDateString('vi-VN')
                
                // Strip prefix for table display
                const cleanCode = coupon.code.startsWith(prefix)
                  ? coupon.code.replace(prefix, '')
                  : coupon.code

                return (
                  <tr key={coupon._id || coupon.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs font-extrabold text-amber-800 select-all">
                      <div className="flex items-center gap-1.5 mt-1">
                        <Ticket className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span title={`Mã đầy đủ: ${coupon.code}`}>{cleanCode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-stone-600">
                      {coupon.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-stone-900">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountAmount}%`
                        : `${coupon.discountAmount.toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-stone-850">
                      {coupon.minOrderValue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 px-6 text-xs">
                      <span className={`flex items-center gap-1 font-semibold ${isExpired ? 'text-red-650' : 'text-stone-600'}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {dateStr}
                        {isExpired && ' (Hết hạn)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs font-semibold text-stone-700">
                      {coupon.usedCount || 0} / {coupon.usageLimit}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        coupon.isActive && !isExpired
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {coupon.isActive && !isExpired ? 'Đang chạy' : 'Dừng'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(coupon)}
                          className="p-2 text-stone-400 hover:text-amber-800 transition-colors"
                          title="Sửa Coupon"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(coupon._id || coupon.id)}
                          className="p-2 text-stone-400 hover:text-red-655 transition-colors"
                          title="Xóa Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingCoupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-755 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Mã giảm giá (Code)</label>
                <div className="mt-1.5 flex rounded-lg border border-stone-300 focus-within:ring-1 focus-within:ring-amber-600 focus-within:border-amber-600 overflow-hidden">
                  <span className="bg-stone-100 text-stone-500 text-xs font-mono font-bold px-3 flex items-center border-r border-stone-200 select-none">
                    {prefix}
                  </span>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="KM10, FREESHIP..."
                    className="flex-1 px-3 py-2 text-sm uppercase placeholder:text-stone-400 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Mã đầy đủ trên hệ thống sẽ là: <code className="font-bold text-amber-800">{prefix}{code.trim().toUpperCase() || 'CODE'}</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Loại chiết khấu</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Mức giảm giá</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">
                    Giảm tối đa (đ) {discountType === 'fixed' && '(Không cần)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={discountType === 'fixed'}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Ngày hết hạn</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Tổng giới hạn lượt dùng</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-stone-300 text-amber-700 focus:ring-amber-600"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-stone-750 select-none">
                  Kích hoạt mã giảm giá hoạt động ngay lập tức
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-750 hover:bg-stone-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-4 py-2 text-xs font-bold disabled:bg-stone-400 shadow-sm"
                >
                  {formLoading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
