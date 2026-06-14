'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { updateUserProfile, changePassword } from '@/lib/api/auth.service'
import { getMyOrders } from '@/lib/api/orders.service'
import { getAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress, type UserAddress } from '@/lib/api/address.service'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, type UserNotification } from '@/lib/api/notification.service'
import { apiClient } from '@/lib/api/client'
import { User, ShoppingBag, Eye, Lock, Mail, AlertCircle, CheckCircle, MapPin, Bell, Trash2, Edit2, Plus, Calendar, X } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, initialized } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile Form States
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Orders State
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  // Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [addrError, setAddrError] = useState('')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  
  // Address Form States
  const [addrLabel, setAddrLabel] = useState('Nhà riêng')
  const [addrFullName, setAddrFullName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrAddressLine, setAddrAddressLine] = useState('')
  const [addrWard, setAddrWard] = useState('')
  const [addrProvince, setAddrProvince] = useState('')
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addrFormError, setAddrFormError] = useState('')
  const [addrFormLoading, setAddrFormLoading] = useState(false)

  // Notifications State
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [notisLoading, setNotisLoading] = useState(false)
  const [notisError, setNotisError] = useState('')

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted || !user) return

    setName(user.fullName || user.name || '')
    setPhone(user.phone || '')
    setAvatarUrl(user.avatar || '')

    // Load active tab data
    if (activeTab === 'orders') {
      fetchOrdersList()
    } else if (activeTab === 'addresses') {
      fetchAddressesList()
    } else if (activeTab === 'notifications') {
      fetchNotificationsList()
    }
  }, [mounted, user, activeTab])

  const mapBackendStatusToFrontend = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'processing'
      case 'shipping': return 'shipped'
      case 'completed': return 'delivered'
      default: return status
    }
  }

  // Fetch functions
  const fetchOrdersList = () => {
    setOrdersLoading(true)
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
  }

  const fetchAddressesList = () => {
    if (!user) return
    setAddrLoading(true)
    getAddresses()
      .then((data) => {
        setAddresses(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setAddrError(err.message || 'Không thể tải danh sách địa chỉ.')
      })
      .finally(() => setAddrLoading(false))
  }

  const fetchNotificationsList = () => {
    if (!user) return
    setNotisLoading(true)
    getMyNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setNotisError(err.message || 'Không thể tải danh sách thông báo.')
      })
      .finally(() => setNotisLoading(false))
  }

  // Profile Handlers
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
      const updatedUser = await updateUserProfile({
        fullName: name,
        phone: phone || undefined,
        avatar: avatarUrl || undefined
      })

      if (password) {
        await changePassword({
          oldPassword,
          newPassword: password
        })
      }

      setUser(updatedUser)
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

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setAddrLabel('Nhà riêng')
    setAddrFullName(user?.fullName || user?.name || '')
    setAddrPhone(user?.phone || '')
    setAddrAddressLine('')
    setAddrWard('')
    setAddrProvince('')
    setAddrIsDefault(false)
    setAddrFormError('')
    setAddressModalOpen(true)
  }

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr)
    setAddrLabel(addr.label)
    setAddrFullName(addr.fullName)
    setAddrPhone(addr.phone)
    setAddrAddressLine(addr.addressLine)
    setAddrWard(addr.ward)
    setAddrProvince(addr.province)
    setAddrIsDefault(addr.isDefault)
    setAddrFormError('')
    setAddressModalOpen(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddrFormError('')
    setAddrFormLoading(true)

    const payload = {
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      addressLine: addrAddressLine,
      ward: addrWard,
      province: addrProvince,
      isDefault: addrIsDefault
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.addressId, payload)
      } else {
        await createAddress(payload)
      }
      setAddressModalOpen(false)
      fetchAddressesList()
    } catch (err: any) {
      setAddrFormError(err.message || 'Lỗi lưu thông tin địa chỉ.')
    } finally {
      setAddrFormLoading(false)
    }
  }

  const handleDeleteAddress = async (addrId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return
    try {
      await deleteAddress(addrId)
      fetchAddressesList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa địa chỉ.')
    }
  }

  const handleSetDefaultAddress = async (addrId: number) => {
    try {
      await setDefaultAddress(addrId)
      fetchAddressesList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đặt địa chỉ mặc định.')
    }
  }

  // Notification Handlers
  const handleMarkRead = async (notiId: string) => {
    try {
      await markNotificationRead(notiId)
      fetchNotificationsList()
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      fetchNotificationsList()
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleNotiClick = async (noti: UserNotification) => {
    if (!noti.isRead) {
      await handleMarkRead(noti._id)
    }
    if (noti.metadata?.orderId) {
      router.push(`/orders/${noti.metadata.orderId}`)
    }
  }

  if (!mounted || !initialized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login?redirect=/profile')
    return null
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border border-green-200/50'
      case 'shipped': return 'bg-blue-50 text-blue-700 border border-blue-200/50'
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200/50'
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200/50'
      default: return 'bg-stone-50 text-stone-700 border border-stone-200/50'
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

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'orders', label: 'Lịch sử mua hàng', icon: ShoppingBag },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
    { id: 'notifications', label: 'Thông báo', icon: Bell }
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-stone-900 tracking-tight mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left vertical sidebar tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  router.push(`/profile?tab=${tab.id}`, { scroll: false })
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                  isActive
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/40'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right Tab Content Panel */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs min-h-[400px]">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <User className="h-5 w-5 text-amber-700" />
                Hồ sơ cá nhân
              </h2>

              {profileError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-150">
                  <AlertCircle className="h-4.5 w-4.5 text-red-650" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3.5 text-xs text-green-700 border border-green-150">
                  <CheckCircle className="h-4.5 w-4.5 text-green-650" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-6 pb-6 border-b border-stone-100">
                <div className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-600/30 bg-stone-50 flex items-center justify-center cursor-pointer shadow-inner shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-amber-850">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đổi ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">{name || 'Thành viên'}</h3>
                  <p className="text-xs text-stone-500 mt-1">{user.email}</p>
                  <span className="mt-2.5 inline-block text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Vai trò: {user.role === 'admin' ? 'Quản trị viên' : user.role === 'owner' ? 'Chủ cửa hàng' : 'Thành viên'}
                  </span>
                  {uploadingAvatar && (
                    <p className="text-[10px] text-amber-850 mt-1.5 animate-pulse font-medium">Đang tải ảnh lên...</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-stone-550 uppercase">Địa chỉ Email</label>
                  <div className="mt-1.5 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="block w-full rounded-lg border border-stone-200 bg-stone-100/50 pl-10 pr-3 py-2 text-sm text-stone-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-bold text-stone-850 uppercase mb-4">Thay đổi mật khẩu</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-555 uppercase">Mật khẩu cũ (Để đổi mật khẩu)</label>
                      <div className="mt-1.5 relative rounded-lg">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-555 uppercase">Mật khẩu mới</label>
                      <div className="mt-1.5 relative rounded-lg">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {password && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-555 uppercase">Xác nhận mật khẩu mới</label>
                        <div className="mt-1.5 relative rounded-lg">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-2.5 text-xs font-bold text-white shadow-sm disabled:bg-stone-300 cursor-pointer mt-4"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-700" />
                Lịch sử mua hàng
              </h2>

              {ordersLoading ? (
                <div className="flex py-12 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
                  <p className="text-stone-550 text-sm">Bạn chưa thực hiện bất kỳ đơn hàng nào.</p>
                  <Link href="/products" className="mt-4 inline-block text-xs font-bold text-amber-800 hover:underline">
                    Bắt đầu mua sắm ngay &rarr;
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-left text-sm text-stone-600 border-collapse">
                    <thead>
                      <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                        <th className="py-3 px-5">Mã đơn hàng</th>
                        <th className="py-3 px-5">Ngày đặt</th>
                        <th className="py-3 px-5">Thanh toán</th>
                        <th className="py-3 px-5">Vận chuyển</th>
                        <th className="py-3 px-5">Tổng tiền</th>
                        <th className="py-3 px-5 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {orders.map((order) => {
                        const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN')
                        return (
                          <tr key={order._id || order.id} className="hover:bg-stone-50/45 transition-colors">
                            <td className="py-3.5 px-5 font-mono text-xs text-stone-850 select-all font-bold">
                              {(order._id || order.id).slice(-8).toUpperCase()}
                            </td>
                            <td className="py-3.5 px-5 text-stone-500 text-xs">{dateStr}</td>
                            <td className="py-3.5 px-5">
                              {order.isPaid ? (
                                <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-150">
                                  Đã thanh toán
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-150">
                                  Chưa thanh toán
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 font-extrabold text-stone-900">
                              {order.totalPrice.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="py-3.5 px-5 text-center">
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
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-700" />
                  Sổ địa chỉ giao hàng
                </h2>
                <button
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Thêm địa chỉ mới
                </button>
              </div>

              {addrLoading ? (
                <div className="flex py-12 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
                </div>
              ) : addrError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
                  <span>{addrError}</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
                  <p className="text-stone-550 text-sm">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
                  <button
                    onClick={handleOpenAddAddress}
                    className="mt-3.5 inline-block text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    Tạo địa chỉ đầu tiên của bạn &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.addressId}
                      className={`relative rounded-2xl border p-5 shadow-xs bg-white transition-all flex flex-col justify-between hover:shadow-md ${
                        addr.isDefault 
                          ? 'border-amber-800/60 bg-amber-500/2.5' 
                          : 'border-stone-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase bg-amber-800 text-white px-2 py-0.5 rounded-md">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{addr.fullName}</h4>
                        <p className="text-xs text-stone-550 font-medium">SĐT: {addr.phone}</p>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {addr.addressLine}, {addr.ward}, {addr.province}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-stone-100/60 flex items-center justify-between gap-4">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.addressId)}
                            className="text-[11px] font-bold text-amber-800 hover:text-amber-955 transition-colors cursor-pointer"
                          >
                            Đặt làm mặc định
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-400 select-none">Địa chỉ mặc định</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-2 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                            title="Sửa địa chỉ"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.addressId)}
                            className="p-2 text-stone-400 hover:text-red-650 transition-colors cursor-pointer"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-700" />
                  Thông báo của tôi
                </h2>
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="rounded-xl border border-stone-300 hover:bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              {notisLoading ? (
                <div className="flex py-12 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
                </div>
              ) : notisError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-655" />
                  <span>{notisError}</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
                  <p className="text-stone-550 text-sm">Hộp thư thông báo của bạn trống.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {notifications.map((noti) => (
                    <div
                      key={noti._id}
                      onClick={() => handleNotiClick(noti)}
                      className={`p-4 flex gap-4 items-start transition-colors cursor-pointer ${
                        !noti.isRead 
                          ? 'bg-amber-500/5 hover:bg-amber-500/10' 
                          : 'hover:bg-stone-50/70'
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border ${
                        !noti.isRead 
                          ? 'bg-amber-100/50 border-amber-200 text-amber-800' 
                          : 'bg-stone-50 border-stone-100 text-stone-400'
                      }`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className={`text-xs sm:text-sm ${!noti.isRead ? 'font-extrabold text-stone-900' : 'font-bold text-stone-700'}`}>
                            {noti.title}
                          </h4>
                          {!noti.isRead && (
                            <span className="inline-block h-2 w-2 rounded-full bg-amber-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-550 mt-1 leading-relaxed">{noti.message}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-[10px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(noti.createdAt).toLocaleDateString('vi-VN')} {new Date(noti.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {noti.metadata?.orderId && (
                            <span className="font-extrabold text-amber-800 hover:underline">
                              Chi tiết đơn hàng &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DIALOG: ADD/EDIT ADDRESS */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingAddress ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ giao nhận mới'}
              </h3>
              <button 
                onClick={() => setAddressModalOpen(false)} 
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveAddress} className="flex-1 overflow-y-auto p-6 space-y-4">
              {addrFormError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-650" />
                  <span>{addrFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Nhãn địa chỉ</label>
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  >
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Văn phòng">Văn phòng (Công ty)</option>
                    <option value="Cửa hàng">Cửa hàng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Họ tên người nhận</label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    required
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Quận / Huyện / Xã / Phường</label>
                  <input
                    type="text"
                    required
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    placeholder="Ví dụ: Phường Sài Gòn"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Số nhà, tên đường (Địa chỉ chi tiết)</label>
                <input
                  type="text"
                  required
                  value={addrAddressLine}
                  onChange={(e) => setAddrAddressLine(e.target.value)}
                  placeholder="Ví dụ: 12 Nguyễn Huệ"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addrDefault"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-stone-300 text-amber-700 focus:ring-amber-600"
                />
                <label htmlFor="addrDefault" className="text-xs font-semibold text-stone-750 select-none">
                  Đặt địa chỉ này làm mặc định khi mua hàng
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-750 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={addrFormLoading}
                  className="rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-4 py-2 text-xs font-bold disabled:bg-stone-400 shadow-sm cursor-pointer"
                >
                  {addrFormLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
