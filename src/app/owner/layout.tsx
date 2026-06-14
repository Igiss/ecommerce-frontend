'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { logoutUser } from '@/lib/api/auth.service'
import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Calendar, Ticket, ArrowLeft, Loader2, LogOut, Shield, Store } from 'lucide-react'

interface OwnerLayoutProps {
  children: ReactNode
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, initialized, clearAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && initialized && (!user || !user.isOwner)) {
      router.push('/')
    }
  }, [user, initialized, mounted, router])

  if (!mounted || !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800 mx-auto" />
          <p className="mt-2 text-xs text-stone-500">Đang tải Kênh người bán...</p>
        </div>
      </div>
    )
  }

  // Double check owner role & active status
  if (!user || !user.isOwner || (user as any).status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-lg font-black text-stone-900">Từ chối truy cập</h1>
          <p className="text-xs text-stone-500 mt-2">
            {(user as any)?.status === 'pending' 
              ? 'Tài khoản bán hàng của bạn đang chờ Admin duyệt.' 
              : 'Bạn không có quyền truy cập vào Kênh người bán này.'}
          </p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-amber-800 hover:bg-amber-900 text-white px-5 py-2 text-xs font-bold shadow-md">
            Quay lại Trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const sidebarLinks = [
    { href: '/owner/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/owner/products', label: 'Sản phẩm của tôi', icon: ShoppingCart },
    { href: '/owner/orders', label: 'Đơn hàng của tôi', icon: Calendar },
    { href: '/owner/coupons', label: 'Mã giảm giá', icon: Ticket }
  ]

  return (
    <div className="flex min-h-screen bg-stone-100/60">
      {/* Sidebar */}
      <aside className="w-64 bg-amber-950 text-amber-100 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-amber-900">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
              Cup<span className="text-amber-400">Shop</span> 
              <span className="text-[10px] bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded-full font-bold uppercase">Seller</span>
            </span>
          </Link>
        </div>

        {/* User Info Card */}
        <div className="p-4 border-b border-amber-900 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-900/50 flex items-center justify-center shrink-0 font-bold text-white text-sm border border-amber-800">
            {(user.name || '').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name || ''}</p>
            <p className="text-[10px] text-amber-300 truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-800 text-white shadow-sm font-bold'
                    : 'hover:bg-amber-900/40 hover:text-white text-amber-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-amber-900 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-900/40 text-amber-250 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Về Cửa hàng
          </Link>
          <button
            onClick={async () => {
              try {
                await logoutUser()
              } catch {
                // Ignore
              } finally {
                clearAuth()
                router.replace('/')
                router.refresh()
              }
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
