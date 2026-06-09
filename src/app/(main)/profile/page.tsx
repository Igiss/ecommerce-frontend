'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { updateUserProfile, changePassword } from '@/lib/api/auth.service'
import { getMyOrders } from '@/lib/api/orders.service'
import { apiClient } from '@/lib/api/client'
import { User, ShoppingBag, Eye, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setAuth } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  // Profile Edit fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push('/login?redirect=/profile')
      return
    }

    setName(user.fullName || user.name || '')
    setPhone(user.phone || '')
    setAvatarUrl(user.avatar || '')

    const mapBackendStatusToFrontend = (status: string): string => {
      switch (status) {
        case 'confirmed': return 'processing'
        case 'shipping': return 'shipped'
        case 'completed': return 'delivered'
        default: return status
      }
    }

    // Fetch order history
    getMyOrders()
      .then((data: any) => {
        let list: any[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object' && 'orders' in data && Array.isArray(data.orders)) {
          list = data.orders
        }

        const normalized = list.map((order: any) => ({
          ...order,
          status: mapBackendStatusToFrontend(order.orderStatus || order.status),
          totalPrice: order.totalAmount || order.totalPrice || 0,
          orderItems: order.items || order.orderItems || [],
          isPaid: order.paymentStatus === 'paid' || order.isPaid || false
        }))
        setOrders(normalized)
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [user, router])

  if (!mounted || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setProfileError('')
    setProfileSuccess('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiClient<any>('/upload/avatar', {
        method: 'POST',
        body: formData
      })
      if (res && res.url) {
        setAvatarUrl(res.url)
        setProfileSuccess('Tải ảnh đại diện lên thành công! Nhấn "Lưu thay đổi" để cập nhật.')
      }
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi tải ảnh đại diện lên.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle profile form submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (password) {
      if (!oldPassword) {
        setProfileError('Vui lòng nhập mật khẩu cũ để đổi mật khẩu.')
        return
      }
      if (password !== confirmPassword) {
        setProfileError('Mật khẩu mới nhập lại không khớp.')
        return
      }
    }

    setLoading(true)
    try {
      // 1. Update profile info
      const updatedUser = await updateUserProfile({
        fullName: name,
        phone: phone || undefined,
        avatar: avatarUrl || undefined
      })

      // 2. If changing password
      if (password) {
        await changePassword({
          oldPassword,
          newPassword: password
        })
      }

      // Update store user state
      setAuth(updatedUser, useAuthStore.getState().token)
      setProfileSuccess('Cập nhật thông tin cá nhân thành công!')
      setOldPassword('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi cập nhật hồ sơ.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-amber-100 text-amber-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-stone-100 text-stone-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Đã giao hàng'
      case 'shipped': return 'Đang vận chuyển'
      case 'processing': return 'Đang xử lý'
      case 'cancelled': return 'Đã hủy'
      default: return 'Chờ xác nhận'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile update form */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-amber-700" />
            Thông tin cá nhân
          </h2>

          {profileError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-150">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-amber-600/30 bg-stone-55 flex items-center justify-center cursor-pointer shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-amber-800">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
              {/* Overlay edit banner */}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đổi ảnh</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            {uploadingAvatar && (
              <span className="text-[10px] text-amber-850 mt-1.5 animate-pulse font-medium">Đang tải ảnh...</span>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-600 uppercase">Địa chỉ Email</label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username"
                  disabled
                  value={user.email}
                  className="block w-full rounded-lg border border-stone-200 bg-stone-100/50 pl-10 pr-3 py-2 text-sm text-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-stone-600 uppercase">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-stone-600 uppercase">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                id="phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label htmlFor="oldPassword" className="block text-xs font-semibold text-stone-600 uppercase">Mật khẩu cũ (Để đổi mật khẩu)</label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="oldPassword"
                  id="oldPassword"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-600 uppercase">Mật khẩu mới</label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {password && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-stone-600 uppercase">Xác nhận mật khẩu mới</label>
                <div className="mt-1 relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 transition-colors py-2.5 text-xs font-bold text-white shadow-sm disabled:bg-stone-300"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-700" />
            Lịch sử mua hàng
          </h2>

          {ordersLoading ? (
            <div className="flex py-12 justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-800 border-t-transparent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border border-stone-200 border-dashed rounded-xl bg-stone-50/30">
              <p className="text-stone-550 text-sm">Bạn chưa thực hiện bất kỳ đơn hàng nào.</p>
              <Link href="/" className="mt-4 inline-block text-xs font-bold text-amber-800 hover:underline">
                Bắt đầu mua sắm ngay &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-655 border-collapse">
                <thead>
                  <tr className="border-b border-stone-150 text-xs font-bold text-stone-500 uppercase tracking-wider bg-stone-50/50">
                    <th className="py-3 px-4">Mã đơn hàng</th>
                    <th className="py-3 px-4">Ngày đặt</th>
                    <th className="py-3 px-4">Thanh toán</th>
                    <th className="py-3 px-4">Vận chuyển</th>
                    <th className="py-3 px-4">Tổng tiền</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => {
                    const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN')
                    return (
                      <tr key={order._id || order.id} className="hover:bg-stone-50/45 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-stone-700 select-all font-semibold">
                          {(order._id || order.id).slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 text-xs">{dateStr}</td>
                        <td className="py-3.5 px-4">
                          {order.isPaid ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                              Đã trả
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                              Chưa trả
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          {order.totalPrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/orders/${order._id || order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-700 transition-colors shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
