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
                Cup<span className="text-amber-500">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Cung cấp các sản phẩm ly sứ và cốc giữ nhiệt cao cấp. Thiết kế độc bản theo phong cách 3D cá nhân hóa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Mua sắm</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/products?category=Ly sứ" className="hover:text-amber-500 transition-colors">Ly sứ</Link>
              </li>
              <li>
                <Link href="/products?category=Ly giữ nhiệt" className="hover:text-amber-500 transition-colors">Ly giữ nhiệt</Link>
              </li>
              <li>
                <Link href="/products?category=Ly thủy tinh" className="hover:text-amber-500 transition-colors">Ly thủy tinh</Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Hỗ trợ</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-500 transition-colors">Giới thiệu</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500 transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500 transition-colors">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-4">Liên hệ</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span>123 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>support@cupshop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-stone-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} CupShop. Tất cả các quyền được bảo lưu.</p>
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
