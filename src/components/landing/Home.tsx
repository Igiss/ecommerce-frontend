import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Sparkles, ArrowDown, Award, ShieldCheck, Truck } from 'lucide-react'

interface HomeProps {}

const CATEGORIES = ['Tất cả', 'Ly sứ', 'Ly giữ nhiệt', 'Ly thủy tinh', 'Ly nhựa']

export function Home(props: HomeProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((data: any) => {
        let list: Product[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            list = data.items
          } else if ('products' in data && Array.isArray(data.products)) {
            list = data.products
          }
        }
        
        // Normalize product ids
        const normalized = list.map((item: any) => ({
          ...item,
          id: item.id || item._id
        }))

        setAllProducts(normalized)
        setFilteredProducts(normalized)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter products based on selected category
  useEffect(() => {
    if (selectedCategory === 'Tất cả') {
      setFilteredProducts(allProducts)
    } else {
      setFilteredProducts(allProducts.filter((p: any) => p.category === selectedCategory))
    }
  }, [selectedCategory, allProducts])

  return (
    <div className="flex flex-col">
      {/* HERO SECTION ĐÃ ĐƯỢC FIX LAYOUT */}
      <section className="relative overflow-hidden border-b border-stone-200/40 bg-gradient-to-br from-amber-50 via-amber-100/30 to-stone-100 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Đã thêm grid-cols-1 để định hình rõ 1 cột ở mobile */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            
            {/* CỘT 1: TEXT - Thêm min-w-0 để chống tràn */}
            <div className="flex w-full min-w-0 flex-col items-start gap-6 text-left max-w-xl lg:max-w-none">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Thiết kế 3D độc bản
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                Cá nhân hóa chiếc cốc của riêng bạn
              </h1>
              <p className="text-base leading-relaxed text-stone-600">
                Tạo nên một sản phẩm thật sự riêng biệt với phong cách 3D, màu sắc và logo phù hợp với bạn.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#products-section"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-900"
                >
                  Mua sắm ngay
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>
                <a
                  href="/about"
                  className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition-colors hover:border-amber-600 hover:text-amber-800"
                >
                  Tìm hiểu thêm
                </a>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 text-sm text-stone-600">
                <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1">✔ An toàn cho đồ uống nóng</span>
                <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1">✔ In ấn theo yêu cầu</span>
              </div>
            </div>

            {/* CỘT 2: IMAGE - Đảm bảo w-full và min-w-0 */}
            <div className="relative flex w-full min-w-0 justify-center lg:justify-end">
              <div className="relative w-full min-w-0 max-w-[420px] rounded-[2rem] border border-stone-200/70 bg-white/70 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
                <div className="absolute inset-x-6 top-4 h-20 rounded-full bg-amber-200/40 blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&auto=format&fit=crop&q=80"
                  alt="3D Cup banner"
                  className="h-full w-full rounded-[1.4rem] object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CÁC SECTION CÒN LẠI GIỮ NGUYÊN */}
      <section className="border-b border-stone-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Chất lượng cao</h4>
                <p className="text-xs text-stone-500">Chất liệu gốm sứ và inox tiêu chuẩn</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">An toàn tuyệt đối</h4>
                <p className="text-xs text-stone-500">Không BPA, phù hợp uống nóng và lạnh</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Giao hàng nhanh</h4>
                <p className="text-xs text-stone-500">Vận chuyển và in ấn trong 48 giờ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products-section" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Danh mục sản phẩm</h2>
          <p className="max-w-lg text-sm text-stone-500">
            Khám phá các sản phẩm cốc đa dạng và bắt đầu sáng tạo thiết kế riêng của bạn.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 rounded-xl border border-stone-200/60 bg-stone-100/80 p-1 backdrop-blur-sm">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all focus:outline-none ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-amber-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
            <p className="text-sm text-stone-500">Chưa có sản phẩm nào thuộc danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}