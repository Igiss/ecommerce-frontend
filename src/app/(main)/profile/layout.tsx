'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, MapPin, Bell } from 'lucide-react'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { id: 'profile', label: 'Hồ sơ của tôi', icon: User, href: '/profile' },
    { id: 'orders', label: 'Đơn mua', icon: ShoppingBag, href: '/profile/orders' },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin, href: '/profile/addresses' },
    { id: 'notifications', label: 'Thông báo', icon: Bell, href: '/profile/notifications' }
  ]

  return (
    <div className="bg-stone-50 py-12 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sticky top-24">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        isActive 
                          ? 'bg-amber-50 text-amber-900' 
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
