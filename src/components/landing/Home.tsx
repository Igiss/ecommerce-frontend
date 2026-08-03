import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products.service'
import { getActiveBanners, type Banner } from '@/lib/api/banners.service'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { FlashSaleSection } from './FlashSaleSection'
import { PersonalizedRecommendations } from './PersonalizedRecommendations'
import { FeaturedProducts } from './FeaturedProducts'
import { RecentlyViewedSection } from './RecentlyViewedSection'
import Link from 'next/link'
import { Sparkles, ArrowDown, ArrowRight, Award, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react'

interface HomeProps {}

const CATEGORIES = ['Tất cả', 'Thiết bị nhà bếp', 'Đồ dùng gia đình', 'Đồ gia dụng thông minh', 'Ly cốc & Bình giữ nhiệt']

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
  const [dynamicBanners, setDynamicBanners] = useState<Banner[]>([])
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

  // Fetch active banners for homepage slider
  useEffect(() => {
    getActiveBanners()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicBanners(data)
        }
      })
      .catch(() => {})
  }, [])

  const currentSlides = dynamicBanners.length > 0
    ? dynamicBanners.map((b) => ({
        badge: b.badge || 'Khuyến mãi đặc biệt',
        title: b.title || '',
        description: b.description || '',
        image: b.imageUrl || b.bgImageUrl || '',
        bgImage: b.bgImageUrl || b.imageUrl || '',
        linkUrl: b.linkUrl || '',
        tagline1: b.tagline1 || '',
        tagline2: b.tagline2 || ''
      }))
    : SLIDES

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xPercent = (x / rect.width) - 0.5
    const yPercent = (y / rect.height) - 0.5
    
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
  }, [activeSlide, currentSlides.length])

  const handleNextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % currentSlides.length)
      setIsTransitioning(false)
    }, 300)
  }

  const handlePrevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)
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
        className="relative overflow-hidden border-b border-stone-250 min-h-[560px] bg-stone-950 flex items-center"
      >
        {/* Slides Container */}
        <div className="relative w-full">
          {currentSlides.map((slide, idx) => (
            <div 
              key={idx} 
              className={`w-full flex items-center transition-all duration-1000 ease-in-out py-16 sm:py-20 lg:py-24 ${
                idx === activeSlide 
                  ? 'relative z-10 opacity-100 pointer-events-auto visible' 
                  : 'absolute inset-0 w-full h-full opacity-0 z-0 pointer-events-none invisible'
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
              
              {/* Content Row Container */}
              <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
                  
                  {/* COLUMN 1: TEXT & CALL TO ACTION */}
                  <div className="flex flex-col space-y-5 text-left">
                    
                    {/* Badge Pill */}
                    <div>
                      <span className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-200 shadow-sm backdrop-blur-md transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                      }`}>
                        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                        {slide.badge}
                      </span>
                    </div>

                    {/* Headline */}
                    {slide.title && (
                      <h1 
                        className={`text-3xl font-black text-white sm:text-4xl lg:text-5xl lg:leading-[1.15] tracking-tight transition-all duration-700 ease-out ${
                          idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                        }`}
                        style={{ 
                          transitionDelay: idx === activeSlide ? '150ms' : '0ms'
                        }}
                      >
                        {slide.title}
                      </h1>
                    )}

                    {/* Description */}
                    {slide.description && (
                      <p 
                        className={`text-sm sm:text-base font-normal text-stone-250/90 leading-relaxed max-w-xl transition-all duration-700 ease-out ${
                          idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                        }`}
                        style={{ 
                          transitionDelay: idx === activeSlide ? '300ms' : '0ms'
                        }}
                      >
                        {slide.description}
                      </p>
                    )}

                    {/* Action Button & Link */}
                    <div 
                      className={`flex flex-wrap items-center gap-4 pt-2 transition-all duration-700 ease-out ${
                        idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: idx === activeSlide ? '450ms' : '0ms'
                      }}
                    >
                      <a
                        href={(slide as any).linkUrl || '#products-grid'}
                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:from-amber-500 hover:to-amber-600 transition-all cursor-pointer active:scale-95"
                      >
                        Khám phá ngay
                      </a>
                    </div>

                    {/* Taglines / Features */}
                    {(slide.tagline1 || slide.tagline2) && (
                      <div 
                        className={`flex flex-wrap gap-3 pt-2 text-xs font-bold text-stone-255 transition-all duration-700 ease-out ${
                          idx === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                        }`}
                        style={{ 
                          transitionDelay: idx === activeSlide ? '700ms' : '0ms'
                        }}
                      >
                        {slide.tagline1 && <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 shadow-2xs backdrop-blur-md text-stone-200">{slide.tagline1}</span>}
                        {slide.tagline2 && <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 shadow-2xs backdrop-blur-md text-stone-200">{slide.tagline2}</span>}
                      </div>
                    )}
                  </div>

                  {/* COLUMN 2: ANIMATED 3D IMAGE SHOWCASE */}
                  <div className="relative flex w-full min-w-0 justify-center lg:justify-end">
                    {/* Outer Entry Wrapper */}
                    <div 
                      className={`relative w-full min-w-0 max-w-[280px] sm:max-w-[400px] lg:max-w-[480px] xl:max-w-[500px] transition-all duration-700 ease-out ${
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
                        }}
                      >
                        {/* Dynamic Glass Shine Overlay */}
                        <div 
                          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle at ${parallax.shineX}% ${parallax.shineY}%, rgba(255, 255, 255, 0.35) 0%, transparent 60%)`,
                          }}
                        />

                        <img
                          src={slide.image}
                          alt={slide.title || 'Banner'}
                          className="relative h-full w-full object-cover object-center animate-gentle-float"
                          style={{ aspectRatio: '16/9' }}
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
            {currentSlides.map((_, idx) => (
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

      {/* FLASH SALE SECTION */}
      <FlashSaleSection products={allProducts} />

      {/* PERSONALIZED RECOMMENDATIONS SECTION */}
      <PersonalizedRecommendations products={allProducts} />

      {/* FEATURED & BESTSELLERS SECTION */}
      <FeaturedProducts products={allProducts} />

      {/* PRODUCTS CATALOG SECTION */}
      <section id="products-section" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Danh mục sản phẩm</h2>
          <p className="max-w-lg text-sm text-stone-500">
            Khám phá các thiết bị gia dụng nhà bếp & đồ dùng gia đình thông minh chính hãng tại Gia Dụng 24h.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col h-[340px] rounded-2xl border border-stone-200/60 bg-white p-3 shadow-sm animate-pulse">
                <div className="aspect-square w-full rounded-xl bg-stone-200"></div>
                <div className="mt-3 h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="mt-2 h-3 bg-stone-150 rounded w-1/2"></div>
                <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
                  <div className="h-5 bg-stone-200 rounded w-1/3"></div>
                  <div className="h-8 w-8 bg-stone-200 rounded-lg"></div>
                </div>
              </div>
            ))}
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

            {/* View All Products Redirect Button */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-2xl bg-amber-800 hover:bg-amber-950 px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <span>Xem tất cả sản phẩm</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* RECENTLY VIEWED SECTION */}
      <RecentlyViewedSection products={allProducts} />
    </div>
  )
}