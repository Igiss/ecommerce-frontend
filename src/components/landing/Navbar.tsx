'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Search, Heart } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const items = useCartStore((state) => state.items)
  const wishlistItems = useWishlistStore((state) => state.items)
  const wishlistCount = wishlistItems.length
  
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    router.push('/')
  }

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
              Cup<span className="text-amber-600">Shop</span>
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
          </nav>
        </div>

        {/* Search, Cart & User Action */}
        <div className="flex items-center gap-4">
          {/* Search bar desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:relative lg:block">
            <input
              type="text"
              placeholder="Tìm kiếm ly sứ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-full border border-stone-200 bg-stone-100/50 py-1.5 pl-4 pr-10 text-xs transition-all placeholder:text-stone-400 focus:w-64 focus:border-amber-600 focus:bg-white focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-800">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-stone-600 hover:text-amber-800 transition-colors">
            <ShoppingCart className="h-5.5 w-5.5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Section (Hydration safe) */}
          <div className="relative">
            {mounted && user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 p-1 pr-3 bg-white/50 hover:bg-white transition-all focus:outline-none"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800 text-sm">
                    {(user.name || user.email || 'User').charAt(0).toUpperCase()}
                  </div>
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-stone-400" />
                        Quản lý (Admin)
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
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-stone-400" />
                        Danh sách yêu thích
                      </span>
                      {wishlistCount > 0 && (
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
                  {wishlistCount > 0 && (
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
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm ly sứ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-amber-600 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

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
              Yêu thích {wishlistCount > 0 && `(${wishlistCount})`}
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
