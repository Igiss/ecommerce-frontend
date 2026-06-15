'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { createOrder, createVNPayUrl } from '@/lib/api/orders.service'
import { validateCoupon } from '@/lib/api/coupons.service'
import { getAddresses } from '@/lib/api/address.service'
import { AlertCircle, Ticket, CreditCard, MapPin, ShieldCheck } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
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
  const [selectedAddrId, setSelectedAddrId] = useState<string>('manual')

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push('/login?redirect=/checkout')
    } else {
      setFullName(user.name || '')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      getAddresses()
        .then((data: any) => {
          if (Array.isArray(data)) {
            setSavedAddresses(data)
            const defAddr = data.find((a: any) => a.isDefault)
            if (defAddr) {
              setSelectedAddrId(String(defAddr.addressId))
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
    }
  }, [user])

  const handleAddressChange = (addrId: string) => {
    setSelectedAddrId(addrId)
    if (addrId === 'manual') {
      setFullName(user?.name || '')
      setPhone('')
      setAddress('')
      setWard('')
      setProvince('')
      setPostalCode('70000')
    } else {
      const selected = savedAddresses.find((a: any) => String(a.addressId) === addrId)
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
        <p className="text-sm text-stone-500 mt-2">Cảm ơn bạn đã mua sắm tại CupShop. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
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
            onClick={() => router.push('/profile')}
            className="w-full rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-2.5 text-sm font-bold transition-colors"
          >
            Xem lịch sử mua hàng
          </button>
        </div>
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

  // Handle coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    setAppliedCoupon(null)
    setDiscountAmount(0)

    const rawCode = couponCode.trim().toUpperCase()
    if (!rawCode) return

    setCouponLoading(true)

    try {
      const result = await validateCoupon(rawCode, itemsPrice)
      setAppliedCoupon({
        ...(result.coupon || result),
        code: rawCode
      })
      setCouponCode(rawCode)
      setDiscountAmount(result.actualDiscount || result.discountAmount || 0)
    } catch (err: any) {
      setCouponError(err?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.')
    }
    setCouponLoading(false)
  }

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!fullName.trim() || !phone.trim() || !address.trim() || !ward.trim() || !province.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin giao nhận hàng (Họ tên, SĐT, Địa chỉ, Xã/Phường, Tỉnh/Thành phố).')
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

      // Clear Shopping Cart store state
      clearCart()

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
        setNewOrderId(orderId)
        setIsSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình đặt hàng.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-8">Thanh toán</h1>

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

            {savedAddresses.length > 0 && (
              <div className="mb-6 rounded-xl bg-amber-50/25 border border-amber-200/50 p-4">
                <label className="block text-xs font-bold text-amber-900 uppercase mb-2">Chọn địa chỉ đã lưu</label>
                <select
                  value={selectedAddrId}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="block w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-850"
                >
                  <option value="manual">Nhập địa chỉ mới (Thủ công)</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.addressId} value={addr.addressId}>
                      [{addr.label}] {addr.fullName} - {addr.phone} ({addr.addressLine}, {addr.ward}, {addr.province}) {addr.isDefault ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase">Họ và tên người nhận</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Mã bưu điện (Zip)</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="70000"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 12 Đường Nguyễn Huệ, Phường Bến Nghé"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Quận / Huyện / Xã / Phường</label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Quận 1, Phường Bến Nghé"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-3.5 text-sm font-bold text-white shadow-md focus:outline-none disabled:bg-stone-400"
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

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="C_12345_SALE10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponLoading || appliedCoupon}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm uppercase placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-lg bg-stone-900 hover:bg-stone-800 transition-colors text-white px-4 py-1.5 text-xs font-bold disabled:bg-stone-200 disabled:text-stone-400"
              >
                {couponLoading ? 'Đang xét...' : appliedCoupon ? 'Áp dụng' : 'Áp dụng'}
              </button>
            </form>

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
                  }}
                  className="text-green-700 hover:text-green-900 underline font-semibold"
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
                    <img src={imageUrl} alt={item.product.name} className="h-10 w-10 rounded-lg object-cover bg-stone-50 shrink-0" />
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
              <span>Giao dịch của bạn được bảo mật. Bằng cách nhấn đặt hàng, bạn đồng ý với các điều khoản dịch vụ của CupShop.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
