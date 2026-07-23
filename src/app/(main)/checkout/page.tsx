'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { createOrder, createVNPayUrl, getMyOrders } from '@/lib/api/orders.service'
import { validateCoupon, getActiveCoupons } from '@/lib/api/coupons.service'
import { getAddresses } from '@/lib/api/address.service'
import { AlertCircle, Ticket, CreditCard, MapPin, ShieldCheck } from 'lucide-react'

interface Province {
  code: number
  name: string
  wards: Ward[]
}

interface Ward {
  code: number
  name: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, initialized } = useAuthStore()
  const { items, getItemsPrice, clearCart } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [ward, setWard] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('70000')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPay'>('COD')
  const [isSuccess, setIsSuccess] = useState(false)
  const [newOrderId, setNewOrderId] = useState('')

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string>('')

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [activeCoupons, setActiveCoupons] = useState<any[]>([])
  const [selectedCouponCode, setSelectedCouponCode] = useState('')
  const [usedCouponCodes, setUsedCouponCodes] = useState<string[]>([])

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    setMounted(true)
    if (initialized) {
      if (!user) {
        router.push('/login?redirect=/checkout')
      } else {
        setFullName(fullName || user.name || '')
        setPhone(phone || user.phone || '')
        setAddress(address || user.address || '')
      }
    }
  }, [user, initialized, router])

  useEffect(() => {
    if (user) {
      getAddresses()
        .then((data: any) => {
          if (Array.isArray(data)) {
            setSavedAddresses(data)
            const defAddr = data.find((a: any) => a.isDefault) || data[0]
            if (defAddr) {
              setSelectedAddrId(String(defAddr.id || defAddr.addressId))
              setFullName(defAddr.fullName)
              setPhone(defAddr.phone)
              setAddress(defAddr.addressLine)
              setWard(defAddr.ward)
              setProvince(defAddr.province)
              if (defAddr.postalCode) setPostalCode(defAddr.postalCode)
            }
          }
        })
        .catch((err) => console.error('Failed to load saved addresses:', err))

      getActiveCoupons()
        .then((data: any) => {
          setActiveCoupons(Array.isArray(data) ? data : [])
        })
        .catch((err) => console.error('Failed to load active coupons:', err))

      getMyOrders({ limit: 100 })
        .then((res: any) => {
          const orders = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          const used = orders
            .filter((o: any) => o.orderStatus !== 'cancelled')
            .map((o: any) => o.couponCode)
            .filter(Boolean)
          setUsedCouponCodes(used)
        })
        .catch((err) => console.error('Failed to load user orders:', err))
    }
  }, [user])

  const handleAddressChange = (addrId: string) => {
    setSelectedAddrId(addrId)
    const selected = savedAddresses.find((a: any) => String(a.id || a.addressId) === addrId)
    if (selected) {
      setFullName(selected.fullName)
      setPhone(selected.phone)
      setAddress(selected.addressLine)
      setWard(selected.ward)
      setProvince(selected.province)
      if (selected.postalCode) {
        setPostalCode(selected.postalCode)
      }
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Đặt hàng thành công!</h2>
        <p className="text-sm text-stone-500 mt-2">Cảm ơn bạn đã mua sắm tại Gia Dụng 24h. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
        {newOrderId && (
          <div className="mt-4 rounded-xl bg-stone-50 border border-stone-150 p-3.5 text-xs text-stone-600">
            Mã đơn hàng: <strong className="text-stone-900 select-all">{newOrderId}</strong>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-6 py-2.5 text-sm font-bold shadow-md transition-colors"
          >
            Quay lại Trang chủ
          </button>
          <button
            onClick={() => router.push('/profile/orders')}
            className="w-full rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-2.5 text-sm font-bold transition-colors"
          >
            Xem lịch sử mua hàng
          </button>
        </div>
      </div>
    )
  }

  if (!mounted || !initialized || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-stone-500 mt-2">Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-6 py-2.5 text-sm font-bold shadow-md transition-colors"
        >
          Quay lại Cửa hàng
        </button>
      </div>
    )
  }

  const itemsPrice = getItemsPrice()
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000
  const totalPrice = itemsPrice + shippingPrice - discountAmount
  const hasProfileInfo = savedAddresses.length > 0
  const eligibleCoupons = activeCoupons.filter((c) => {
    if (itemsPrice < c.minOrderValue) return false;
    const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
    if (isExpired) return false;
    if (c.isActive === false) return false;
    return true;
  })

  // Handle coupon validation by code string
  const applyCouponByCode = async (codeToApply: string) => {
    setCouponError('')
    setAppliedCoupon(null)
    setDiscountAmount(0)

    const rawCode = codeToApply.trim().toUpperCase()
    if (!rawCode) return

    setCouponLoading(true)
    try {
      const result = await validateCoupon(rawCode, itemsPrice)
      setAppliedCoupon({
        ...(result.coupon || result),
        code: rawCode
      })
      setCouponCode(rawCode)
      setSelectedCouponCode(rawCode)
      setDiscountAmount(result.actualDiscount || result.discountAmount || 0)
    } catch (err: any) {
      let errMsg = err?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'
      if (errMsg.includes('Coupon per-user usage limit reached')) {
        errMsg = 'Bạn đã đạt giới hạn sử dụng mã này.'
      } else if (errMsg.includes('Coupon has expired')) {
        errMsg = 'Mã giảm giá đã hết hạn sử dụng.'
      } else if (errMsg.includes('Coupon is inactive')) {
        errMsg = 'Mã giảm giá đã ngừng hoạt động.'
      } else if (errMsg.includes('Coupon is not active yet')) {
        errMsg = 'Mã giảm giá chưa đến thời gian áp dụng.'
      } else if (errMsg.includes('Coupon usage limit reached')) {
        errMsg = 'Mã giảm giá đã hết lượt sử dụng.'
      } else if (errMsg.includes('Minimum order value is')) {
        errMsg = errMsg.replace('Minimum order value is', 'Giá trị đơn hàng tối thiểu để áp dụng mã là')
      } else if (errMsg.includes('Coupon not found')) {
        errMsg = 'Không tìm thấy mã giảm giá.'
      }
      setCouponError(errMsg)
    } finally {
      setCouponLoading(false)
    }
  }

  // Handle coupon validation from form submit
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    applyCouponByCode(couponCode)
  }

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!fullName.trim() || !phone.trim() || !address.trim() || !ward.trim() || !province.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin giao nhận hàng (Họ tên, SĐT, Tỉnh/Thành phố, Phường/Xã, Địa chỉ).')
      setLoading(false)
      return
    }

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.qty
        })),
        shippingAddress: { 
          fullName, 
          phone, 
          address, 
          ward,
          province 
        },
        paymentMethod: paymentMethod === 'VNPay' ? 'VNPAY' : 'COD',
        couponCode: appliedCoupon?.code
      }

      const createdOrder = await createOrder(orderData)
      const orderId = createdOrder._id || createdOrder.id

      if (paymentMethod === 'VNPay') {
        // Retrieve VNPay sandbox redirect link
        const vnpayRes = await createVNPayUrl(orderId)
        if (vnpayRes && vnpayRes.paymentUrl) {
          window.location.href = vnpayRes.paymentUrl
        } else {
          setError('Không thể tạo liên kết thanh toán VNPay. Hãy kiểm tra lại sau.')
        }
      } else {
        // Cash on delivery
        clearCart()
        setNewOrderId(orderId)
        setIsSuccess(true)
      }
    } catch (err: any) {
      let errMsg = err.message || 'Có lỗi xảy ra trong quá trình đặt hàng.'
      if (errMsg.includes('Coupon per-user usage limit reached')) {
        errMsg = 'Bạn đã đạt giới hạn sử dụng mã này.'
      } else if (errMsg.includes('Coupon has expired')) {
        errMsg = 'Mã giảm giá đã hết hạn sử dụng.'
      } else if (errMsg.includes('Coupon is inactive')) {
        errMsg = 'Mã giảm giá đã ngừng hoạt động.'
      } else if (errMsg.includes('Coupon is not active yet')) {
        errMsg = 'Mã giảm giá chưa đến thời gian áp dụng.'
      } else if (errMsg.includes('Coupon usage limit reached')) {
        errMsg = 'Mã giảm giá đã hết lượt sử dụng.'
      } else if (errMsg.includes('Minimum order value is')) {
        errMsg = errMsg.replace('Minimum order value is', 'Giá trị đơn hàng tối thiểu để áp dụng mã là')
      } else if (errMsg.includes('Coupon not found')) {
        errMsg = 'Không tìm thấy mã giảm giá.'
      }
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-8">Thanh toán</h1>

      {!hasProfileInfo && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-3xs animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wide">Yêu cầu thêm địa chỉ nhận hàng</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Tài khoản của bạn chưa có địa chỉ nhận hàng nào được thiết lập. Vui lòng thêm địa chỉ nhận hàng mới trong Sổ địa chỉ của bạn trước khi tiến hành thanh toán.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/profile/addresses')}
              className="inline-flex items-center justify-center rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors text-white px-5 py-2.5 text-xs font-bold shrink-0 shadow-xs cursor-pointer focus:outline-none"
            >
              Thêm địa chỉ nhận hàng
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping address & payment forms */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
          {/* Shipping form */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-700" />
              Thông tin nhận hàng
            </h2>

            <div className="mb-6 rounded-xl bg-amber-50/25 border border-amber-200/50 p-4">
              <label className="block text-xs font-bold text-amber-900 uppercase mb-2">Chọn địa chỉ nhận hàng</label>
              {savedAddresses.length > 0 ? (
                <select
                  value={selectedAddrId}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="block w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-850"
                >
                  {savedAddresses.map((addr) => (
                    <option key={addr.id || addr.addressId} value={addr.id || addr.addressId}>
                      [{addr.label}] {addr.fullName} - {addr.phone} ({addr.addressLine}, {addr.ward}, {addr.province}) {addr.isDefault ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-red-600 font-bold p-1">
                  Chưa có địa chỉ nào được thiết lập. Vui lòng nhấn nút "Thêm địa chỉ nhận hàng" ở biểu ngữ phía trên để tiếp tục.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase">Họ và tên người nhận</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={fullName}
                  placeholder="Nguyễn Văn A"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  readOnly
                  value={phone}
                  placeholder="0912345678"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Mã bưu điện (Zip)</label>
                <input
                  type="text"
                  readOnly
                  value={postalCode}
                  placeholder="70000"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  disabled
                  value={province}
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Phường / Xã</label>
                <input
                  type="text"
                  disabled
                  value={ward}
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={address}
                  placeholder="Số 12 Đường Nguyễn Huệ"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-700" />
              Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-amber-600 bg-amber-50/35 ring-1 ring-amber-600'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="h-4 w-4 text-amber-700 focus:ring-amber-600 border-stone-300"
                  />
                  <div>
                    <p className="text-sm font-bold text-stone-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-stone-500 mt-0.5">Trả tiền mặt trực tiếp cho bưu tá</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === 'VNPay'
                    ? 'border-amber-600 bg-amber-50/35 ring-1 ring-amber-600'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPay"
                    checked={paymentMethod === 'VNPay'}
                    onChange={() => setPaymentMethod('VNPay')}
                    className="h-4 w-4 text-amber-700 focus:ring-amber-600 border-stone-300"
                  />
                  <div>
                    <p className="text-sm font-bold text-stone-900">Thanh toán qua ví VNPay</p>
                    <p className="text-xs text-stone-500 mt-0.5">ATM, Internet Banking, QR Code</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Place Order CTA for mobile */}
          <button
            type="submit"
            disabled={loading || !hasProfileInfo}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-3.5 text-sm font-bold text-white shadow-md focus:outline-none disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý đặt hàng...' : `Đặt hàng & Thanh toán (${totalPrice.toLocaleString('vi-VN')}đ)`}
          </button>
        </form>

        {/* Sidebar Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon input card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-amber-700" />
              Mã giảm giá (Coupon)
            </h3>

            {activeCoupons.length > 0 && (
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Chọn từ kho voucher</label>
                {eligibleCoupons.length > 0 ? (
                  <select
                    value={selectedCouponCode}
                    onChange={(e) => {
                      const code = e.target.value
                      setSelectedCouponCode(code)
                      setCouponCode(code)
                      if (code) {
                        applyCouponByCode(code)
                      } else {
                        setAppliedCoupon(null)
                        setDiscountAmount(0)
                        setCouponCode('')
                      }
                    }}
                    disabled={couponLoading || appliedCoupon}
                    className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold focus:border-amber-600 focus:outline-none text-stone-850 cursor-pointer"
                  >
                    <option value="">-- Chọn voucher của bạn --</option>
                    {eligibleCoupons.map((c) => {
                      const isUsed = usedCouponCodes.includes(c.code)
                      const discText = c.discountType === 'percentage' 
                        ? `${c.discountAmount}%` 
                        : `${(c.discountAmount / 1000)}k`
                      return (
                        <option 
                          key={c._id || c.id || c.code} 
                          value={c.code} 
                          disabled={isUsed}
                        >
                          {c.code} (Giảm {discText} - Đơn từ {c.minOrderValue.toLocaleString('vi-VN')}đ){isUsed ? ' - Đã sử dụng' : ''}
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <div className="text-[11px] text-stone-400 bg-stone-50 border border-stone-150 p-2.5 rounded-lg font-medium leading-relaxed">
                    Không có voucher nào đủ điều kiện cho đơn hàng này.
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {activeCoupons.length > 0 && (
                <label className="block text-[10px] font-bold text-stone-500 uppercase">Hoặc nhập thủ công</label>
              )}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponLoading || appliedCoupon}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm uppercase placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim() || appliedCoupon}
                  className="rounded-lg bg-stone-900 hover:bg-stone-800 transition-colors text-white px-4 py-1.5 text-xs font-bold disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer"
                >
                  {couponLoading ? 'Đang xét...' : 'Áp dụng'}
                </button>
              </form>
            </div>

            {couponError && <p className="text-xs text-red-600 mt-2 font-medium">{couponError}</p>}

            {appliedCoupon && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 p-2.5 text-xs text-green-800 border border-green-200">
                <span className="font-semibold">Đã áp dụng mã: {appliedCoupon.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null)
                    setDiscountAmount(0)
                    setCouponCode('')
                    setSelectedCouponCode('')
                  }}
                  className="text-green-700 hover:text-green-900 underline font-semibold cursor-pointer"
                >
                  Gỡ bỏ
                </button>
              </div>
            )}
          </div>

          {/* Checkout items list & prices card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Danh sách sản phẩm</h3>

            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto mb-6 pr-1">
              {items.map((item, idx) => {
                const imageUrl = (item.product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
                return (
                  <div key={idx} className="flex items-center gap-3 py-3">
                    <img src={imageUrl} alt={item.product.name} className="h-10 w-10 rounded-lg object-contain bg-stone-50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Số lượng: {item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      {(item.product.price * item.qty).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )
              })}
            </div>

            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 border-t border-stone-100 pt-4">Thành tiền</h3>
            <div className="space-y-3.5 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-stone-950">{itemsPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span>{shippingPrice === 0 ? 'Miễn phí' : `${shippingPrice.toLocaleString('vi-VN')}đ`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Khấu trừ giảm giá</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <hr className="border-stone-100" />
              <div className="flex justify-between text-base font-extrabold text-stone-950">
                <span>Tổng phải trả</span>
                <span className="text-amber-900">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-100 p-3 text-[10px] text-stone-500 leading-normal">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Giao dịch của bạn được bảo mật. Bằng cách nhấn đặt hàng, bạn đồng ý với các điều khoản dịch vụ của Gia Dụng 24h.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
