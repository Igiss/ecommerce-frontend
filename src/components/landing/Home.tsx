import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Sparkles, ArrowDown, Award, ShieldCheck, Truck } from 'lucide-react'

interface HomeProps {
  onCustomize: (product: Product) => void
}

const CATEGORIES = ['Tất cả', 'Ly sứ', 'Ly giữ nhiệt', 'Ly thủy tinh', 'Ly nhựa']

export function Home({ onCustomize }: HomeProps) {
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
        } else if (data && typeof data === 'object' && 'products' in data && Array.isArray(data.products)) {
          list = data.products
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
      {/* 1. Premium Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/40 via-amber-100/10 to-stone-100 py-16 sm:py-24 border-b border-stone-200/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="flex flex-col items-start gap-6 text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Thiết kế 3D Độc Bản
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Cá nhân hóa <br />
                <span className="bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">
                  chiếc cốc của riêng bạn
                </span>
              </h1>
              <p className="text-base text-stone-600 leading-relaxed">
                Khám phá thế giới cốc giữ nhiệt và ly sứ cao cấp. Tự tay phối màu, tải hình ảnh và điều chỉnh vị trí in ấn trực quan ngay trên mô hình 3D thực tế ảo.
              </p>
              <div className="flex gap-4 pt-2">
                <a
                  href="#products-section"
                  className="rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors px-6 py-3 text-sm font-bold text-white shadow-md flex items-center gap-2"
                >
                  Mua sắm ngay
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>
              </div>
            </div>

            {/* Hero Right Banner Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative aspect-square w-72 sm:w-96 overflow-hidden rounded-2xl bg-gradient-to-tr from-amber-100 to-stone-200/50 p-6 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80"
                  alt="3D Cup banner"
                  className="h-full w-full object-contain object-center drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Badges */}
      <section className="bg-white border-b border-stone-100 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-stone-900">Chất lượng cao</h4>
                <p className="text-xs text-stone-500">Chất liệu gốm sứ & inox 304 tiêu chuẩn</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center border-y sm:border-y-0 sm:border-x border-stone-100 py-4 sm:py-0 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-stone-900">An toàn tuyệt đối</h4>
                <p className="text-xs text-stone-500">Không BPA, an toàn cho đồ uống nóng/lạnh</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-stone-900">Giao hàng nhanh</h4>
                <p className="text-xs text-stone-500">Vận chuyển và in ấn nhanh chóng trong 48h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Section */}
      <section id="products-section" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Danh mục sản phẩm</h2>
          <p className="text-sm text-stone-500 max-w-md">Khám phá các sản phẩm cốc đa dạng và bắt đầu sáng tạo thiết kế riêng của bạn</p>
          
          {/* Categories Tab Bar */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 rounded-xl bg-stone-100/80 p-1 backdrop-blur-xs border border-stone-200/20">
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-stone-50 border border-stone-200 border-dashed">
            <p className="text-stone-500 text-sm">Chưa có sản phẩm nào thuộc danh mục này.</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCustomize={onCustomize}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
