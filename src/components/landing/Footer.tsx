import Link from 'next/link'
import { Coffee, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Gia Dụng <span className="text-amber-500">24h</span>
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Cung cấp các sản phẩm đồ gia dụng và thiết bị thông minh cao cấp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Mua sắm</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/products" className="hover:text-amber-500 transition-colors">Tất cả sản phẩm</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-500 transition-colors">Đồ gia dụng thông minh</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Hỗ trợ khách hàng</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-500 transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/vouchers" className="hover:text-amber-500 transition-colors">Mã giảm giá</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Liên hệ</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>support@giadung24h.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-stone-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} Gia Dụng 24h. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-amber-500 transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors">TikTok</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
