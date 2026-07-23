'use client'

import { useEffect, useState } from 'react'
import {
  getOwnerCoupons,
  createOwnerCoupon,
  updateOwnerCoupon,
  deleteOwnerCoupon,
  getOwnerProducts
} from '@/lib/api/owner.service'
import { useAuthStore } from '@/store/auth.store'
import { Plus, Edit2, Trash2, X, AlertCircle, Calendar, Ticket, ShoppingBag, Layers } from 'lucide-react'

export default function OwnerCouponsPage() {
  const { user } = useAuthStore()
  const [coupons, setCoupons] = useState<any[]>([])
  const [ownerProducts, setOwnerProducts] = useState<any[]>([])
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

  // Scope Fields (Tất cả sản phẩm của Shop VS 1 sản phẩm cụ thể)
  const [applyScope, setApplyScope] = useState<'all' | 'specific'>('all')
  const [selectedProductId, setSelectedProductId] = useState('')

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchCouponsList = () => {
    setLoading(true)
    getOwnerCoupons()
      .then((data: any) => {
        setCoupons(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setError('Không thể tải danh sách mã giảm giá.')
      })
      .finally(() => setLoading(false))
  }

  const fetchOwnerProductsList = () => {
    getOwnerProducts()
      .then((data: any) => {
        let list: any[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.items)) list = data.items
          else if (Array.isArray(data.products)) list = data.products
        }
        setOwnerProducts(list)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (user?.id) {
      fetchCouponsList()
      fetchOwnerProductsList()
    }
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
    setApplyScope('all')
    setSelectedProductId('')
    setFormError('')
    setIsOpen(true)
  }

  // Open modal for edit
  const handleEditClick = (coupon: any) => {
    setEditingCoupon(coupon)
    setCode(coupon.code)
    setDiscountType(coupon.discountType || 'percentage')
    setDiscountAmount(coupon.discountAmount || 0)
    setMinOrderValue(coupon.minOrderValue || 0)
    setMaxDiscount(coupon.maxDiscount || 0)
    const formattedDate = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
    setExpiryDate(formattedDate)
    setUsageLimit(coupon.usageLimit || 100)
    setIsActive(coupon.isActive !== undefined ? coupon.isActive : true)

    if (Array.isArray(coupon.applicableProductIds) && coupon.applicableProductIds.length > 0) {
      setApplyScope('specific')
      const firstProd = coupon.applicableProductIds[0]
      setSelectedProductId(typeof firstProd === 'object' ? firstProd._id || firstProd.id : String(firstProd))
    } else {
      setApplyScope('all')
      setSelectedProductId('')
    }

    setFormError('')
    setIsOpen(true)
  }

  // Handle delete
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) return
    try {
      await deleteOwnerCoupon(id)
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

    const rawCleanCode = code.trim().toUpperCase()
    if (!rawCleanCode) {
      setFormError('Vui lòng nhập mã giảm giá.')
      setFormLoading(false)
      return
    }

    if (applyScope === 'specific' && !selectedProductId) {
      setFormError('Vui lòng chọn 1 sản phẩm cụ thể thuộc shop của bạn.')
      setFormLoading(false)
      return
    }

    try {
      const couponData: any = {
        code: rawCleanCode,
        discountType,
        discountAmount,
        minOrderValue,
        maxDiscount: discountType === 'percentage' ? maxDiscount : undefined,
        expiryDate: new Date(expiryDate),
        usageLimit,
        isActive,
        applicableProductIds: applyScope === 'specific' && selectedProductId ? [selectedProductId] : []
      }

      if (editingCoupon) {
        await updateOwnerCoupon(editingCoupon._id || editingCoupon.id, couponData)
      } else {
        await createOwnerCoupon(couponData)
      }

      setIsOpen(false)
      fetchCouponsList()
    } catch (err: any) {
      setFormError(err.message || 'Lỗi lưu thông tin mã giảm giá.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-amber-800" />
            Quản lý Mã giảm giá của Shop
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Tạo các chương trình khuyến mãi giảm giá cho tất cả hoặc từng sản phẩm cụ thể của Shop.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors cursor-pointer"
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
                <th className="py-3.5 px-6">Phạm vi áp dụng</th>
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

                // Determine scope text
                const hasProducts = Array.isArray(coupon.applicableProductIds) && coupon.applicableProductIds.length > 0
                let matchedProductTitle = ''
                if (hasProducts) {
                  const targetId = typeof coupon.applicableProductIds[0] === 'object'
                    ? coupon.applicableProductIds[0]._id || coupon.applicableProductIds[0].id
                    : coupon.applicableProductIds[0]
                  const found = ownerProducts.find(p => (p._id || p.id) === targetId)
                  matchedProductTitle = found ? found.name : '1 sản phẩm cụ thể'
                }

                return (
                  <tr key={coupon._id || coupon.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs font-extrabold text-amber-800 select-all">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>{coupon.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs">
                      {hasProducts ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium max-w-[200px] truncate" title={matchedProductTitle}>
                          <ShoppingBag className="h-3 w-3 text-amber-700 shrink-0" />
                          <span className="truncate">{matchedProductTitle}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                          <Layers className="h-3 w-3 text-stone-500 shrink-0" />
                          Tất cả sản phẩm của Shop
                        </span>
                      )}
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
                          className="p-2 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                          title="Sửa Coupon"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(coupon._id || coupon.id)}
                          className="p-2 text-stone-400 hover:text-red-655 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingCoupon ? 'Cập nhật mã giảm giá Shop' : 'Tạo mã giảm giá Shop mới'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-755 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SCOPE SELECTION (Tất cả sản phẩm của Shop VS 1 sản phẩm cụ thể) */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 space-y-3">
                <label className="block text-xs font-bold uppercase text-amber-900 tracking-wider">
                  Phạm vi áp dụng Voucher
                </label>
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'all'}
                      onChange={() => setApplyScope('all')}
                      className="h-4 w-4 text-amber-800 focus:ring-amber-600 cursor-pointer"
                    />
                    <span>Áp dụng cho TẤT CẢ sản phẩm của Shop tôi</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'specific'}
                      onChange={() => setApplyScope('specific')}
                      className="h-4 w-4 text-amber-800 focus:ring-amber-600 cursor-pointer"
                    />
                    <span>Chỉ áp dụng cho 1 SẢN PHẨM CỤ THỂ của Shop</span>
                  </label>
                </div>

                {applyScope === 'specific' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Chọn sản phẩm thuộc Shop <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
                    >
                      <option value="">-- Chọn sản phẩm từ danh sách --</option>
                      {ownerProducts.map((p) => {
                        const pId = p._id || p.id
                        return (
                          <option key={pId} value={pId}>
                            {p.name} ({p.price?.toLocaleString('vi-VN')}đ)
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Mã giảm giá (Code)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SHOPKHM10, FREESHIP..."
                  className="block w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Loại chiết khấu</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Mức giảm giá</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                    Giảm tối đa (đ) {discountType === 'fixed' && '(Không cần)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={discountType === 'fixed'}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Tổng giới hạn lượt dùng</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-stone-750 select-none cursor-pointer">
                  Kích hoạt mã giảm giá hoạt động ngay lập tức
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-750 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors text-white px-5 py-2.5 text-xs font-bold disabled:bg-stone-400 shadow-sm cursor-pointer"
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
