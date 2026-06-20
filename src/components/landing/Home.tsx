import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products.service'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Sparkles, ArrowDown, Award, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react'

interface HomeProps {}

const CATEGORIES = ['Tất cả', 'Ly sứ', 'Ly giữ nhiệt', 'Ly thủy tinh', 'Ly nhựa']

const SLIDES = [
  {
    badge: 'Thiết kế 3D độc bản',
    title: 'Cá nhân hóa chiếc cốc của riêng bạn',
    description: 'Tạo nên một sản phẩm thật sự riêng biệt với phong cách 3D, màu sắc và logo phù hợp với phong cách của bạn.',
    image: '/images/ceramic_cup_hero.png',
    bgImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop&q=80',
    tagline1: '✔ An toàn cho đồ uống nóng',
    tagline2: '✔ In ấn theo yêu cầu'
  },
  {
    badge: 'Bán chạy nhất',
    title: 'Giữ trọn hương vị, đậm đà phong cách',
    description: 'Dòng ly giữ nhiệt inox cao cấp đồng hành cùng bạn trên mọi nẻo đường, giữ nóng đến 12h và giữ lạnh lên đến 24h.',
    image: '/images/travel_tumbler_hero.png',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80',
    tagline1: '✔ Chất liệu Inox 316 an toàn',
    tagline2: '✔ Giữ nhiệt vượt trội'
  },
  {
    badge: 'Sưu tập mới',
    title: 'Trong suốt tinh khôi, nâng tầm trải nghiệm',
    description: 'Thủy tinh borosilicate chịu nhiệt cao cấp, siêu nhẹ và trong suốt, giúp bạn ngắm nhìn trọn vẹn sắc màu của trà và cà phê.',
    image: '/images/glass_mug_hero.png',
    bgImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    tagline1: '✔ Thủy tinh Borosilicate cao cấp',
    tagline2: '✔ Thiết kế 2 lớp chống nóng'
  }
]

export function Home(props: HomeProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [parallax, setParallax] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [pageInput, setPageInput] = useState('')

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xPercent = (x / rect.width) - 0.5
    const yPercent = (y / rect.height) - 0.5
    
    // Very subtle 3D tilt limited to max 5 degrees
    setParallax({
      rotateX: -yPercent * 5,
      rotateY: xPercent * 5,
      shineX: (x / rect.width) * 100,
      shineY: (y / rect.height) * 100
    })
  }

  const handleMouseLeave = () => {
    setParallax({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 })
  }

  // Fetch products
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
          id: String(item.id || item._id)
        }))

        setAllProducts(normalized)
        setFilteredProducts(normalized)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto transition slides
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [activeSlide])

  const handleNextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length)
      setIsTransitioning(false)
    }, 300)
  }

  const handlePrevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
      setIsTransitioning(false)
    }, 300)
  }

  const handleSelectSlide = (index: number) => {
    if (index === activeSlide) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSlide(index)
      setIsTransitioning(false)
    }, 300)
  }

  // Filter products based on selected category
  useEffect(() => {
    if (selectedCategory === 'Tất cả') {
      setFilteredProducts(allProducts)
    } else {
      setFilteredProducts(allProducts.filter((p: any) => {
        const catName = typeof p.category === 'object' ? p.category?.name : (p.category || p.categoryId?.name);
        if (!catName) return false;
        return catName.toLowerCase() === selectedCategory.toLowerCase();
      }))
    }
    setCurrentPage(1)
  }, [selectedCategory, allProducts])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col">
      {/* Dynamic Keyframe Styles */}
      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-gentle-float {
          animation: gentleFloat 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>

      {/* HERO SECTION - ANIMATED CROSS-FADE CAROUSEL */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden border-b border-stone-250 min-h-[560px] bg-stone-950"
      >
        {/* Slides Container */}
        <div className="relative w-full h-full min-h-[560px]">
          {SLIDES.map((slide, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1000 ease-in-out ${
                idx === activeSlide 
                  ? 'opacity-100 z-10 pointer-events-auto visible' 
                  : 'opacity-0 z-0 pointer-events-none invisible'
              }`}
            >
              {/* Full-bleed Rich Background Image with Ken Burns Zoom Effect */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] ease-out pointer-events-none z-0 ${
                  idx === activeSlide ? 'scale-100' : 'scale-105'
                }`} 
                style={{ backgroundImage: `url(${slide.bgImage})` }} 
              />
              
              {/* Dark overlay for rich contrast & readability */}
              <div className="absolute inset-0 bg-stone-950/45 backdrop-blur-[1.5px] pointer-events-none z-0" />

              {/* Decorative Glowing Lights */}
              <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
              <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-orange-400/5 blur-3xl animate-pulse" style={{ animationDuration: '15s' }} />
              
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-24 sm:py-32">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
                  
                  {/* COLUMN 1: TEXT CONTENT WITH STAGGERED FADE-IN */}
                  <div className="flex w-full min-w-0 flex-col items-start gap-6 text-left max-w-xl lg:max-w-none">
                    <span 
                      className={`inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 border border-amber-500/30 transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '100ms' : '0ms'
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                      {slide.badge}
                    </span>
                    
                    <h1 
                      className={`text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-5xl xl:text-6xl max-w-lg lg:max-w-none bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-amber-200 transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '250ms' : '0ms'
                      }}
                    >
                      {slide.title}
                    </h1>
                    
                    <p 
                      className={`text-sm sm:text-base leading-relaxed text-stone-200 max-w-md transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '400ms' : '0ms'
                      }}
                    >
                      {slide.description}
                    </p>
                    
                    <div 
                      className={`flex flex-wrap gap-3.5 pt-2 transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '550ms' : '0ms'
                      }}
                    >
                      <a
                        href="#products-section"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all hover:scale-102 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        Mua sắm ngay
                        <ArrowDown className="h-4 w-4 animate-bounce" />
                      </a>
                      <a
                        href="/about"
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xs hover:shadow-md transition-all hover:bg-white/20 hover:border-white/45 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        Tìm hiểu thêm
                      </a>
                    </div>
                    
                    <div 
                      className={`flex flex-wrap gap-3 pt-2 text-xs font-bold text-stone-255 transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '700ms' : '0ms'
                      }}
                    >
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 shadow-2xs backdrop-blur-md text-stone-200">{slide.tagline1}</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 shadow-2xs backdrop-blur-md text-stone-200">{slide.tagline2}</span>
                    </div>
                  </div>

                  {/* COLUMN 2: ANIMATED 3D IMAGE SHOWCASE */}
                  <div className="relative flex w-full min-w-0 justify-center lg:justify-end">
                    {/* Outer Entry Wrapper */}
                    <div 
                      className={`relative w-full min-w-0 max-w-[500px] transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '200ms' : '0ms'
                      }}
                    >
                      {/* Inner 3D Mouse Parallax & Shadow Wrapper */}
                      <div 
                        className="relative w-full rounded-[1.5rem] overflow-hidden bg-white/20 shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-300 hover:shadow-3xl"
                        style={{
                          transform: idx === activeSlide 
                            ? `perspective(1000px) rotateX(${parallax.rotateX}deg) rotateY(${parallax.rotateY}deg)`
                            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out'
                        }}
                      >
                        {/* Shine reflection overlay moving with mouse */}
                        <div 
                          className="absolute inset-0 pointer-events-none z-10 opacity-20 mix-blend-overlay transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle 140px at ${parallax.shineX}% ${parallax.shineY}%, rgba(255, 255, 255, 0.8), transparent 70%)`
                          }}
                        />

                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="relative h-full w-full object-cover object-center animate-gentle-float"
                          style={{ aspectRatio: '4/3' }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Navigation controls (Fixed absolute overlay) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center gap-4">
          {/* Left/Right arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/30 backdrop-blur-xs text-white hover:bg-black/55 hover:border-white/40 transition-all shadow-xs cursor-pointer active:scale-95 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/30 backdrop-blur-xs text-white hover:bg-black/55 hover:border-white/40 transition-all shadow-xs cursor-pointer active:scale-95 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeSlide
                    ? 'w-7 bg-white shadow-xs'
                    : 'w-2.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* THREE-COLUMN ADVANTAGE SECTION */}
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

      {/* PRODUCTS CATALOG SECTION */}
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
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
                {/* First Page Button */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  title="Trang đầu tiên"
                >
                  Đầu
                </button>

                {/* Previous Page Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                >
                  Trước
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Page Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                >
                  Sau
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer"
                  title="Trang cuối cùng"
                >
                  Cuối
                </button>

                {/* Jump to Page Input */}
                <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-4">
                  <span className="text-xs text-stone-500">Đến trang:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(pageInput, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                        } else {
                          setPageInput(String(currentPage));
                        }
                      }
                    }}
                    className="w-12 h-9 rounded-xl border border-stone-200 bg-white text-center text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(pageInput, 10);
                      if (!isNaN(val) && val >= 1 && val <= totalPages) {
                        setCurrentPage(val);
                      } else {
                        setPageInput(String(currentPage));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer active:scale-95 transition-all"
                  >
                    Đi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}