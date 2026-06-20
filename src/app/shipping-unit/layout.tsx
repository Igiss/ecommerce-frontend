'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { logoutUser } from '@/lib/api/auth.service'
import Link from 'next/link'
import { LayoutDashboard, Truck, ArrowLeft, Loader2, LogOut, Shield, Package, Users } from 'lucide-react'

interface ShippingUnitLayoutProps {
  children: ReactNode
}

export default function ShippingUnitLayout({ children }: ShippingUnitLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, initialized, clearAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // role is 'shipping_unit'
    if (mounted && initialized && (!user || user.role !== 'shipping_unit')) {
      router.push('/')
    }
  }, [user, initialized, mounted, router])

  if (!mounted || !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800 mx-auto" />
          <p className="mt-2 text-xs text-stone-500">Đang khởi tạo...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'shipping_unit') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-lg font-black text-stone-900">Từ chối truy cập</h1>
          <p className="text-xs text-stone-500 mt-2">Bạn không có quyền truy cập vào cổng thông tin đơn vị vận chuyển.</p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-amber-800 hover:bg-amber-900 text-white px-5 py-2 text-xs font-bold shadow-md">
            Quay lại Trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const sidebarLinks = [
    { href: '/shipping-unit/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/shipping-unit/orders', label: 'Quản lý Đơn hàng', icon: Package },
    { href: '/shipping-unit/shippers', label: 'Quản lý Tài xế', icon: Users },
    { href: '/shipping-unit/profile', label: 'Hồ sơ đơn vị', icon: Truck },
  ]

  return (
    <div className="flex min-h-screen bg-stone-100/60">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-stone-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white">
              Cup<span className="text-amber-500">Shop</span> <span className="text-[10px] bg-amber-500/25 text-amber-500 px-1.5 py-0.5 rounded-full font-bold ml-1 uppercase">Unit</span>
            </span>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-stone-850 space-y-2">
          <div className="px-3 py-3 rounded-lg bg-stone-800/50 mb-2">
            <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
          </div>
          
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
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
