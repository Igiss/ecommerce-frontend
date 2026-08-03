'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/api/products.service'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Plus,
  Minus,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Undo2,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  CreditCard,
  Star,
  Zap,
  Tag,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { ProductReviews } from '@/components/UI/ProductReviews'
import { getActivePrice } from '@/utils/price'

interface ProductDetailsProps {
  product: Product
  onBack?: () => void
  onCustomize?: () => void
}

export function ProductDetails({ product, onBack, onCustomize }: ProductDetailsProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite)
  const isFavorite = useWishlistStore((state) => state.hasItem(product.id))
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState('')
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc')
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([])
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    product.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
  )

  // Flash Sale Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    status: 'active' | 'upcoming' | 'ended' | null
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, status: null })

  useEffect(() => {
    if (!product.salePrice || (!product.saleStartDate && !product.saleEndDate)) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, status: null })
      return
    }

    const calculateTime = () => {
      const now = new Date().getTime()
      const start = product.saleStartDate ? new Date(product.saleStartDate).getTime() : 0
      const end = product.saleEndDate ? new Date(product.saleEndDate).getTime() : 0

      if (end && now > end) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, status: 'ended' })
        return
      }

      if (start && now < start) {
        const diff = start - now
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds, status: 'upcoming' })
        return
      }

      if (end) {
        const diff = end - now
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds, status: 'active' })
        return
      }

      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, status: null })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [product])

  // Image Zoom State
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  useEffect(() => {
    const images = (product as any).images || []
    if (images.length > 0) {
      setActiveImageUrl(images[0])
    } else {
      setActiveImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600')
    }
  }, [product])

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

        const normalizedList = list.map((item: any) => ({
          ...item,
          id: String(item.id || item._id)
        }))

        // Similar products (same category)
        const currentCat = (product as any).category || (product as any).categoryId?.name || ''
        const similar = normalizedList
          .filter((p: any) => {
            const pCat = p.category || p.categoryId?.name || ''
            return currentCat && pCat && currentCat.toLowerCase() === pCat.toLowerCase() && String(p.id) !== String(product.id)
          })
          .slice(0, 4)
        setRelatedProducts(similar)

        // Best selling products
        const bestSelling = normalizedList
          .filter((p: any) => String(p.id) !== String(product.id))
          .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, 4)
        setBestSellingProducts(bestSelling)
      })
      .catch((err) => console.error('Failed to load related products:', err))
  }, [product])

  const stockQty = (product as any).stock ?? (product as any).countInStock ?? 0
  const isLowStock = stockQty > 0 && stockQty < 5

  const activePrice = getActivePrice(product)
  const basePrice = product.price || activePrice
  const isSale = activePrice < basePrice
  const origPrice = basePrice
  const discountPercent = isSale ? Math.round(((basePrice - activePrice) / basePrice) * 100) : 0


  const catName = typeof product.category === 'object' && product.category !== null
    ? (product.category as any).name
    : (product.category || (product as any).categoryId?.name || 'Gia dụng')

  const brandName = (product as any).brand || 'GIA DỤNG 24H'

  const handleAddToCart = () => {
    if (qty > stockQty) {
      setStatus('Số lượng vượt quá tồn kho hiện tại!')
      setTimeout(() => setStatus(''), 2000)
      return
    }
    addItem(product, qty)
    setStatus('Đã thêm vào giỏ hàng thành công!')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleBuyNow = () => {
    if (qty > stockQty) {
      setStatus('Số lượng vượt quá tồn kho hiện tại!')
      setTimeout(() => setStatus(''), 2000)
      return
    }
    addItem(product, qty)
    router.push('/checkout')
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/products/${product.slug || product.id}`
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setStatus('Đã sao chép liên kết sản phẩm!')
            setTimeout(() => setStatus(''), 2000)
          })
          .catch(() => {
            setStatus('Đã sao chép liên kết sản phẩm!')
            setTimeout(() => setStatus(''), 2000)
          })
      }
    }
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-8 text-stone-800 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HERO SECTION CARD (LIGHT MODE) */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Breadcrumb Header */}
          <div className="border-b border-stone-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={() => {
                if (onBack) onBack()
                else if (typeof window !== 'undefined') window.history.back()
              }}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-xs font-bold text-stone-700 hover:border-amber-800 hover:text-amber-800 transition-all active:scale-95 shadow-xs cursor-pointer focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại cửa hàng
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <span>Trang chủ</span>
              <span>/</span>
              <span>Sản phẩm</span>
              <span>/</span>
              <span className="text-amber-800 font-extrabold">{catName}</span>
            </div>
          </div>

          {/* 2-Column Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Gallery & Spec Badges */}
            <div className="lg:col-span-5 flex flex-col w-full">
              {/* Main Image Container */}
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleImageMouseMove}
                className="aspect-square w-full relative overflow-hidden rounded-2xl bg-[#F8FAFC] border border-stone-200/70 flex items-center justify-center cursor-zoom-in"
              >
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  style={{
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                  }}
                  className="h-full w-full object-contain object-center transition-transform duration-200 ease-out pointer-events-none select-none p-4"
                />

                {/* Left/Right Next/Prev Arrows for 2+ Images */}
                {((product as any).images?.length || 0) > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const imagesList = (product as any).images as string[]
                        const currIdx = Math.max(0, imagesList.indexOf(activeImageUrl))
                        const prevIdx = (currIdx - 1 + imagesList.length) % imagesList.length
                        setActiveImageUrl(imagesList[prevIdx])
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md hover:bg-amber-800 hover:text-white transition-all cursor-pointer z-10 focus:outline-none"
                      title="Xem ảnh trước"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const imagesList = (product as any).images as string[]
                        const currIdx = Math.max(0, imagesList.indexOf(activeImageUrl))
                        const nextIdx = (currIdx + 1) % imagesList.length
                        setActiveImageUrl(imagesList[nextIdx])
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md hover:bg-amber-800 hover:text-white transition-all cursor-pointer z-10 focus:outline-none"
                      title="Xem ảnh kế tiếp"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Feature Spec Badges on Image */}
                <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="bg-white/90 backdrop-blur-xs border border-stone-200 text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    ⚡ Chính hãng {brandName}
                  </span>
                  {product.modelUrl && (
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      3D Custom
                    </span>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails Selector */}
              {(product as any).images && (product as any).images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-300">
                  {(product as any).images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setActiveImageUrl(img)}
                      onClick={() => setActiveImageUrl(img)}
                      className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 bg-stone-50 flex items-center justify-center transition-all cursor-pointer ${
                        activeImageUrl === img
                          ? 'border-amber-800 ring-2 ring-amber-800/10 scale-95'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img src={img} alt={`${product.name}-${idx}`} className="h-full w-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Details, Price Card & Conversion CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-5">
              <div>
                {/* Brand & Category Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-100/70 border border-amber-300/80 px-3 py-1 rounded-full">
                    {brandName} • {catName}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Sẵn hàng giao ngay
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="mt-2.5 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Sales Proof */}
                <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-stone-500">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-stone-800 font-extrabold">{product.rating || 4.9}</span>
                    <span className="text-stone-400">(128 Đánh giá)</span>
                  </div>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-700 font-bold">
                    Đã bán: <span className="text-stone-900 font-black">{product.soldCount || 83}</span> sản phẩm
                  </span>
                </div>

                {/* Highlighted Price Card (Light Warm Amber Card) */}
                <div className="mt-4 bg-amber-50/70 border border-amber-200/80 p-4 sm:p-5 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-amber-900 tracking-tight">
                      {activePrice.toLocaleString('vi-VN')}đ
                    </span>
                    {isSale && (
                      <>
                        <span className="text-sm sm:text-base font-bold text-stone-400 line-through">
                          {origPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          Tiết kiệm {discountPercent}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Voucher Pill */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/60 border border-amber-300 px-2.5 py-0.5 rounded-lg">
                      <Tag className="h-3 w-3 text-amber-800" /> VOUCHER GIẢM 50K
                    </span>
                    <span className="text-[11px] text-stone-600">Áp dụng thêm mã giảm giá khi thanh toán</span>
                  </div>
                </div>

                {/* Flash Sale Countdown (If Active) */}
                {timeLeft.status && timeLeft.status !== 'ended' && (
                  <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 p-3 rounded-2xl">
                    <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                      <Flame className="h-4 w-4 fill-red-600 animate-bounce" />
                      <span>FLASH SALE KẾT THÚC SAU:</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs text-white">
                      <span className="bg-red-600 px-2 py-0.5 rounded-md font-black">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-red-600 font-black">:</span>
                      <span className="bg-red-600 px-2 py-0.5 rounded-md font-black">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-red-600 font-black">:</span>
                      <span className="bg-red-600 px-2 py-0.5 rounded-md font-black">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4 Trust Badges Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-700">
                    <ShieldCheck className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold">Bảo hành 12 tháng chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-700">
                    <Truck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold">Miễn phí vận chuyển từ 500k</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-700">
                    <Undo2 className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold">1 đổi 1 trong 30 ngày lỗi NSX</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-700">
                    <Clock className="h-4.5 w-4.5 text-orange-600 shrink-0" />
                    <span className="text-xs font-bold">Giao hỏa tốc 24h TP.HCM/Hà Nội</span>
                  </div>
                </div>

                {/* Short Description */}
                <div className="mt-4 text-xs text-stone-600 leading-relaxed bg-stone-50/50 p-3.5 rounded-xl border border-stone-200/50">
                  <p className="line-clamp-2">
                    {product.description || 'Sản phẩm thiết bị gia dụng cao cấp chính hãng Gia Dụng 24h, bảo hành uy tín.'}
                  </p>
                </div>
              </div>

              {/* QUANTITY & PRIMARY ACTION CONVERSION ROW */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                {status && (
                  <div className={`text-xs font-bold py-1.5 px-3 rounded-xl border ${
                    status.includes('thành công') || status.includes('sao chép')
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {status}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 rounded-xl border border-stone-300 bg-white p-1 shadow-xs">
                    <span className="text-xs font-bold text-stone-500 px-2 uppercase sm:hidden">Số lượng:</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-600 transition-colors disabled:opacity-30 cursor-pointer"
                        disabled={qty <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-stone-900">{qty}</span>
                      <button
                        onClick={() => setQty((prev) => Math.min(stockQty || 99, prev + 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-600 transition-colors disabled:opacity-30 cursor-pointer"
                        disabled={stockQty > 0 && qty >= stockQty}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button (Secondary Outlined CTA) */}
                  <button
                    onClick={handleAddToCart}
                    disabled={stockQty === 0}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-amber-800 bg-white text-amber-800 hover:bg-amber-50 active:scale-98 transition-all py-3 px-5 text-xs sm:text-sm font-bold shadow-xs cursor-pointer focus:outline-none disabled:border-stone-300 disabled:text-stone-400"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    Thêm vào giỏ hàng
                  </button>

                  {/* Buy Now Button (Primary Solid Warm Amber CTA) */}
                  <button
                    onClick={handleBuyNow}
                    disabled={stockQty === 0}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white active:scale-98 transition-all py-3 px-5 text-xs sm:text-sm font-black shadow-md hover:shadow-lg cursor-pointer focus:outline-none disabled:bg-stone-300"
                  >
                    <CreditCard className="h-4.5 w-4.5" />
                    MUA NGAY
                  </button>

                  {/* Wishlist & Share Icons */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-center">
                    <button
                      onClick={() => toggleFavorite(product, !!useAuthStore.getState().user)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                        isFavorite
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-stone-300 bg-white text-stone-500 hover:border-red-400 hover:text-red-500'
                      }`}
                      title={isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-red-600' : ''}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-500 hover:border-amber-800 hover:text-amber-800 transition-all cursor-pointer"
                      title="Chia sẻ sản phẩm"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STRUCTURED INFORMATION TABS SECTION */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex border-b border-stone-200 gap-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'desc'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Mô tả chi tiết sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'shipping'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Chính sách vận chuyển & đổi trả
            </button>
          </div>

          <div className="pt-6 text-sm text-stone-700 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4 whitespace-pre-wrap">
                <p>{product.description || 'Sản phẩm gia dụng nhà bếp cao cấp chính hãng từ thương hiệu Gia Dụng 24h.'}</p>
                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-stone-900 uppercase">Ưu điểm nổi bật:</h4>
                  <p>• Thiết kế hiện đại, tinh tế phù hợp với mọi không gian nhà bếp.</p>
                  <p>• Vật liệu đạt chuẩn an toàn sức khỏe người tiêu dùng.</p>
                  <p>• Tiết kiệm điện năng, công suất hoạt động mạnh mẽ và ổn định.</p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl overflow-hidden rounded-2xl border border-stone-200">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y divide-stone-150">
                    <tr className="bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-600 w-1/3">Thương hiệu</td>
                      <td className="py-3 px-4 text-stone-900 font-extrabold">{brandName}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-600">Danh mục</td>
                      <td className="py-3 px-4 text-stone-900 font-extrabold">{catName}</td>
                    </tr>
                    <tr className="bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-600">Tình trạng kho</td>
                      <td className="py-3 px-4 text-emerald-700 font-extrabold">Còn hàng ({stockQty} sản phẩm)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-600">Bảo hành</td>
                      <td className="py-3 px-4 text-stone-900 font-extrabold">12 tháng chính hãng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <p>• <strong>Giao hàng toàn quốc:</strong> Miễn phí vận chuyển cho đơn hàng từ 500.000đ.</p>
                <p>• <strong>Thời gian giao hàng:</strong> 1-2 ngày đối với TP.HCM & Hà Nội, 2-4 ngày đối với các tỉnh thành khác.</p>
                <p>• <strong>Chính sách đổi trả:</strong> Hỗ trợ đổi trả 1-đổi-1 hoàn toàn miễn phí trong 30 ngày nếu phát hiện lỗi từ nhà sản xuất hoặc hỏng hóc trong vận chuyển.</p>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <ProductReviews productId={product.id} />

        {/* SIMILAR PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="pt-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Sản phẩm tương tự</h2>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `/products?category=${encodeURIComponent(catName)}`
                  }
                }}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
              >
                Xem tất cả &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* BEST SELLING PRODUCTS SECTION */}
        {bestSellingProducts.length > 0 && (
          <div className="pt-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Sản phẩm bán chạy</h2>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `/products`
                  }
                }}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
              >
                Xem tất cả &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
