'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { logoutUser } from '@/lib/api/auth.service'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/notification.service'
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Search, Heart, Store, Bell, Truck, Package, Ticket, ShoppingBag, MapPin } from 'lucide-react'
import { SmartSearch } from './SmartSearch'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()
  const items = useCartStore((state) => state.items)
  const wishlistItems = useWishlistStore((state) => state.items)
  const wishlistCount = wishlistItems.length
  
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  
  const avatarDropdownRef = useRef<HTMLDivElement>(null)
  const notiDropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = () => {
    if (!user) return
    getMyNotifications()
      .then((data: any) => {
        setNotifications(Array.isArray(data) ? data : [])
      })
      .catch((err) => console.error('Failed to load notifications:', err))
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notiDropdownRef.current && !notiDropdownRef.current.contains(event.target as Node)) {
        setNotiDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore
    } finally {
      clearAuth()
      setDropdownOpen(false)
      setNotiDropdownOpen(false)
      router.replace('/')
      router.refresh()
    }
  }

  const handleNotificationClick = async (noti: any) => {
    setNotiDropdownOpen(false)
    if (!noti.isRead) {
      try {
        await markNotificationRead(noti._id)
        fetchNotifications()
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
    if (noti.metadata?.orderId) {
      router.push(`/orders/${noti.metadata.orderId}`)
    } else {
      router.push('/profile/notifications')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Count total quantity of items in cart
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-amber-800">
              Gia Dụng <span className="text-amber-600">24h</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                pathname === '/' ? 'text-amber-800 font-semibold' : 'text-stone-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                pathname.startsWith('/products') ? 'text-amber-800 font-semibold' : 'text-stone-600'
              }`}
            >
              Sản phẩm
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                pathname === '/about' ? 'text-amber-800 font-semibold' : 'text-stone-600'
              }`}
            >
              Giới thiệu
            </Link>
            <Link
              href="/vouchers"
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                pathname.startsWith('/vouchers') ? 'text-amber-800 font-semibold' : 'text-stone-600'
              }`}
            >
              Kho voucher
            </Link>
          </nav>
        </div>

        {/* Search, Cart & User Action */}
        <div className="flex items-center gap-4">
          {/* Search bar desktop */}
          <SmartSearch isMobile={false} />

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-stone-600 hover:text-amber-800 transition-colors">
            <ShoppingCart className="h-5.5 w-5.5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          {mounted && user && (
            <div className="relative" ref={notiDropdownRef}>
              <button
                onClick={() => {
                  setNotiDropdownOpen(!notiDropdownOpen)
                  setDropdownOpen(false)
                  if (!notiDropdownOpen) fetchNotifications()
                }}
                className="relative p-2 text-stone-600 hover:text-amber-800 transition-colors focus:outline-none cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notiDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100 max-h-[420px] flex flex-col z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 shrink-0">
                    <span className="text-xs font-bold text-stone-850">Thông báo của bạn ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-stone-100 max-h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-stone-400">Không có thông báo nào</div>
                    ) : (
                      notifications.slice(0, 5).map((noti) => (
                        <div
                          key={noti._id}
                          onClick={() => handleNotificationClick(noti)}
                          className={`p-3 text-left hover:bg-stone-50/70 transition-colors cursor-pointer flex flex-col gap-0.5 ${
                            !noti.isRead ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[11px] font-bold ${!noti.isRead ? 'text-stone-900 font-extrabold' : 'text-stone-700'}`}>
                              {noti.title}
                            </span>
                            {!noti.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">{noti.message}</p>
                          <span className="text-[8px] text-stone-400 mt-1.5">
                            {new Date(noti.createdAt).toLocaleDateString('vi-VN')} {new Date(noti.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-stone-100 pt-2 pb-1 text-center shrink-0">
                    <Link
                      href="/profile/notifications"
                      onClick={() => setNotiDropdownOpen(false)}
                      className="inline-block text-[11px] font-bold text-amber-800 hover:text-amber-900 transition-colors"
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Section (Hydration safe) */}
          <div className="relative" ref={avatarDropdownRef}>
            {mounted && user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 p-1 pr-3 bg-white/50 hover:bg-white transition-all focus:outline-none cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-7 w-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-850 text-sm shrink-0">
                      {(user.name || user.email || 'User').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-medium text-stone-700">
                    {user.name || user.email || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-stone-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100">
                    {user.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <LayoutDashboard className="h-4 w-4 text-stone-400" />
                        Quản lý (Admin)
                      </Link>
                    )}
                    {user.isOwner && (
                      <Link
                        href="/owner/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <Store className="h-4 w-4 text-stone-400" />
                        Kênh người bán
                      </Link>
                    )}
                    {user.isShippingUnit && (
                      <Link
                        href="/shipping-unit/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <Package className="h-4 w-4 text-stone-400" />
                        Kênh Đơn vị VC
                      </Link>
                    )}
                    {user.isShipper && (
                      <Link
                        href="/shipper/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <Truck className="h-4 w-4 text-stone-400" />
                        Kênh Tài xế
                      </Link>
                    )}
                    {!user.isAdmin && !user.isOwner && !user.isShipper && !user.isShippingUnit && (
                      <Link
                        href="/register-owner"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors font-medium"
                      >
                        <Store className="h-4 w-4 text-stone-400" />
                        Đăng ký bán hàng
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <User className="h-4 w-4 text-stone-400" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/profile/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 text-stone-400" />
                      Đơn mua
                    </Link>
                    <Link
                      href="/profile/addresses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-stone-400" />
                      Sổ địa chỉ
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-stone-400" />
                        Danh sách yêu thích
                      </span>
                      {mounted && wishlistCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <hr className="my-1 border-stone-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/wishlist"
                  className="relative p-2 text-stone-600 hover:text-amber-800 transition-colors mr-1"
                  title="Danh sách yêu thích"
                >
                  <Heart className="h-5.5 w-5.5" />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-amber-800 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-amber-800 hover:bg-amber-900 transition-colors px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-amber-800 md:hidden focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 px-4 py-4 sm:px-6">
          <SmartSearch isMobile={true} />

          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                pathname === '/' ? 'bg-amber-50 text-amber-800' : 'text-stone-700'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                pathname.startsWith('/products') ? 'bg-amber-50 text-amber-800' : 'text-stone-700'
              }`}
            >
              Sản phẩm
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                pathname === '/wishlist' ? 'bg-amber-50 text-amber-800' : 'text-stone-700'
              }`}
            >
              Yêu thích {mounted && wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                pathname === '/about' ? 'bg-amber-50 text-amber-800' : 'text-stone-700'
              }`}
            >
              Giới thiệu
            </Link>
            <Link
              href="/vouchers"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                pathname.startsWith('/vouchers') ? 'bg-amber-50 text-amber-800' : 'text-stone-700'
              }`}
            >
              Kho voucher
            </Link>
            {user && (
              <>
                <Link
                  href="/profile/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2"
                >
                  <ShoppingBag className="h-4.5 w-4.5 text-stone-400" />
                  Đơn mua
                </Link>
                <Link
                  href="/profile/addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2"
                >
                  <MapPin className="h-4.5 w-4.5 text-stone-400" />
                  Sổ địa chỉ
                </Link>
              </>
            )}
            {user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-800 hover:bg-stone-100"
              >
                Quản lý (Admin)
              </Link>
            )}
            {user?.isOwner && (
              <Link
                href="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-800 hover:bg-stone-100"
              >
                Kênh người bán (Owner)
              </Link>
            )}
            {user?.isShippingUnit && (
              <Link
                href="/shipping-unit/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-800 hover:bg-stone-100"
              >
                Kênh Đơn vị VC
              </Link>
            )}
            {user?.isShipper && (
              <Link
                href="/shipper/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-800 hover:bg-stone-100"
              >
                Kênh Tài xế (Shipper)
              </Link>
            )}
            {user && !user.isAdmin && !user.isOwner && !user.isShippingUnit && !user.isShipper && (
              <Link
                href="/register-owner"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-800 hover:bg-stone-100"
              >
                Đăng ký bán hàng
              </Link>
            )}
            {!user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-stone-200">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-stone-300 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-amber-800 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
