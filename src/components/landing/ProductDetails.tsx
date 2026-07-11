'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/api/products.service'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'
import { ArrowLeft, ShoppingCart, Sparkles, Plus, Minus, Heart, Share2, Truck, ShieldCheck, Undo2, ChevronDown, ChevronUp, Info, Flame, CreditCard } from 'lucide-react'
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([])
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    product.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
  )

  // Flash Sale Countdown Timer State & Logic
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
  
  // Accordion & Image Zoom States
  const [openSection, setOpenSection] = useState<string | null>('desc')
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

        // 1. Similar products (same category)
        const currentCat = (product as any).category || (product as any).categoryId?.name || '';
        const similar = normalizedList
          .filter((p: any) => {
            const pCat = p.category || p.categoryId?.name || '';
            return currentCat && pCat && currentCat.toLowerCase() === pCat.toLowerCase() && String(p.id) !== String(product.id);
          })
          .slice(0, 4)
        setRelatedProducts(similar)

        // 2. Best selling products (sorted by soldCount desc)
        const bestSelling = normalizedList
          .filter((p: any) => String(p.id) !== String(product.id))
          .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, 4)
        setBestSellingProducts(bestSelling)
      })
      .catch((err) => console.error('Failed to load related & best selling products:', err))
  }, [product])

  const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
  const stockQty = (product as any).stock ?? (product as any).countInStock ?? 0
  const isLowStock = stockQty < 5
  
  const activePrice = getActivePrice(product)
  const isSale = activePrice < product.price

  const catName = (typeof product.category === 'object' && product.category !== null
    ? (product.category as any).name
    : (product.category || (product as any).categoryId?.name || '')).toLowerCase();

  const isCustomizable = catName.includes('ly') || catName.includes('cốc') || catName.includes('coc') ||
    (catName === '' && (product.name.toLowerCase().includes('ly') || product.name.toLowerCase().includes('cốc') || product.name.toLowerCase().includes('coc')));

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
      const shareUrl = `${window.location.origin}/products?search=${encodeURIComponent(product.name)}`
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setStatus('Đã sao chép liên kết chia sẻ sản phẩm!')
            setTimeout(() => setStatus(''), 2000)
          })
          .catch(() => {
            setStatus('Không thể sao chép liên kết!')
            setTimeout(() => setStatus(''), 2000)
          })
      } else {
        setStatus('Đã sao chép liên kết chia sẻ sản phẩm!')
        setTimeout(() => setStatus(''), 2000)
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Navigation Bar inside the card */}
        <div className="col-span-1 md:col-span-12 border-b border-stone-100 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => {
              if (onBack) onBack()
              else if (typeof window !== 'undefined') window.history.back()
            }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/70 px-4 text-xs font-bold text-amber-800 transition-all hover:bg-amber-100/80 hover:text-amber-900 active:scale-95 shadow-xs hover:shadow-sm group focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lại cửa hàng
          </button>
          
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Sản phẩm</span>
            <span>/</span>
            <span className="text-amber-800/80">Chi tiết</span>
          </div>
        </div>
        {/* Product Image Panel (Left) */}
        <div className="md:col-span-5 flex flex-col shrink-0 w-full">
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleImageMouseMove}
            className="aspect-square w-full relative overflow-hidden rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-center cursor-zoom-in"
          >
            <img
              src={activeImageUrl}
              alt={product.name}
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}
              className="h-full w-full object-contain object-center transition-transform duration-200 ease-out pointer-events-none select-none"
            />
            {product.modelUrl && (
              <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-600/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="h-3 w-3 text-amber-250 animate-pulse" />
                3D Custom
              </span>
            )}
          </div>
          
          {/* Gallery Thumbnails (Shopee / Tiktok shop style) */}
          {(product as any).images && (product as any).images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              {(product as any).images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onMouseEnter={() => setActiveImageUrl(img)}
                  onClick={() => setActiveImageUrl(img)}
                  className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 bg-stone-50 flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer hover:shadow-sm ${
                    activeImageUrl === img
                      ? 'border-amber-800 scale-95 ring-2 ring-amber-800/10'
                      : 'border-stone-200/80 hover:border-amber-700/50'
                  }`}
                >
                  <img src={img} alt={`${product.name}-${idx}`} className="h-full w-full object-contain p-1 transition-transform duration-350 hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Panel (Right) */}
        <div className="md:col-span-7 flex flex-col h-full justify-between">
          <div>
            <h1 className="mt-0 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            {/* Price & Discount Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3 bg-stone-50 border border-stone-150 rounded-2xl p-4 sm:p-5">
              <span className="text-3xl font-black text-amber-900 tracking-tight">
                {activePrice.toLocaleString('vi-VN')}đ
              </span>
              {isSale && (
                <>
                  <span className="text-sm font-medium text-stone-400 line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="rounded-lg bg-red-50 border border-red-150 px-2.5 py-0.5 text-xs font-black text-red-700 animate-pulse">
                    Giảm {Math.round(((product.price - activePrice) / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Flash Sale Countdown Timer */}
            {timeLeft.status && timeLeft.status !== 'ended' && (
              <div className="mt-3 flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-3.5 shadow-3xs animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Flame className="h-4.5 w-4.5 text-red-600 animate-bounce" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-700">
                    {timeLeft.status === 'active' ? 'Flash Sale' : 'Sắp diễn ra'}
                  </span>
                </div>
                
                <div className="h-4 w-px bg-red-500/20 hidden sm:block" />

                <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold text-stone-600">
                  <span>{timeLeft.status === 'active' ? 'Kết thúc sau:' : 'Bắt đầu sau:'}</span>
                  
                  <div className="flex items-center gap-1 ml-1 text-white">
                    {timeLeft.days > 0 && (
                      <>
                        <span className="bg-red-600 px-2 py-0.5 rounded-md font-black min-w-[20px] text-center shadow-3xs">
                          {timeLeft.days}
                        </span>
                        <span className="text-red-700 font-extrabold text-[10px] mr-1">ngày</span>
                      </>
                    )}
                    
                    <span className="bg-red-600 px-2 py-0.5 rounded-md font-black min-w-[20px] text-center shadow-3xs">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-red-600 font-black">:</span>
                    
                    <span className="bg-red-600 px-2 py-0.5 rounded-md font-black min-w-[20px] text-center shadow-3xs">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-red-600 font-black">:</span>
                    
                    <span className="bg-red-600 px-2 py-0.5 rounded-md font-black min-w-[20px] text-center shadow-3xs">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Assurances Badges (Shopee/TikTok Shop style) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-b border-stone-100 pb-5">
              <div className="flex items-center gap-2.5 text-stone-600">
                <Truck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">Miễn phí vận chuyển từ 500k</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-600">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold">Cam kết chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-600">
                <Undo2 className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <span className="text-xs font-semibold">Hỗ trợ đổi trả trong 7 ngày</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-600">
                <Info className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                <span className="text-xs font-semibold">Đóng gói bọc xốp chống vỡ</span>
              </div>
            </div>

            {/* Collapsible Info Accordions */}
            <div className="mt-6 space-y-2.5">
              {/* Accordion: Description */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'desc' ? null : 'desc')}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-50/50 hover:bg-stone-50 transition-colors text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">Mô tả sản phẩm</span>
                  {openSection === 'desc' ? (
                    <ChevronUp className="h-4 w-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />
                  )}
                </button>
                {openSection === 'desc' && (
                  <div className="p-4 border-t border-stone-100 text-sm text-stone-600 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200">
                    {product.description || 'Chưa có thông tin mô tả chi tiết cho chiếc cốc này.'}
                  </div>
                )}
              </div>



              {/* Accordion: Shipping Policy */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-50/50 hover:bg-stone-50 transition-colors text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">Chính sách vận chuyển & đổi trả</span>
                  {openSection === 'shipping' ? (
                    <ChevronUp className="h-4 w-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />
                  )}
                </button>
                {openSection === 'shipping' && (
                  <div className="p-4 border-t border-stone-100 text-xs text-stone-600 space-y-2.5 animate-in fade-in duration-200 leading-relaxed">
                    <p className="flex gap-1.5"><strong className="text-stone-700 shrink-0">• Giao hàng toàn quốc:</strong> Hỗ trợ giao hàng tận nơi. Nhận hàng trong vòng 1-2 ngày (Hà Nội, TP.HCM) và 2-4 ngày (các tỉnh thành khác).</p>
                    <p className="flex gap-1.5"><strong className="text-stone-700 shrink-0">• Bọc xốp bảo vệ:</strong> Mỗi chiếc cốc được bọc khí xốp dày 3 lớp để tránh rạn nứt tuyệt đối trong quá trình chuyển phát.</p>
                    <p className="flex gap-1.5"><strong className="text-stone-700 shrink-0">• Hoàn tiền & Đổi trả:</strong> Hỗ trợ đổi mới 1-đổi-1 hoàn toàn miễn phí nếu sản phẩm nhận về bị sứt mẻ, vỡ do vận chuyển hoặc phát hiện lỗi sản xuất trong vòng 7 ngày kể từ khi nhận hàng.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock status & Sold Count */}
            <div className="mt-6 flex flex-wrap items-center gap-y-3 gap-x-6 border-t border-stone-100 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Kho hàng:</span>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                    stockQty === 0 
                      ? 'bg-red-650'
                      : isLowStock 
                        ? 'bg-amber-500'
                        : 'bg-emerald-650'
                  }`} />
                  <span className={`text-xs font-bold ${
                    stockQty === 0 
                      ? 'text-red-700'
                      : isLowStock 
                        ? 'text-amber-800'
                        : 'text-emerald-700'
                  }`}>
                    {stockQty === 0 
                      ? 'Hết hàng' 
                      : isLowStock 
                        ? `Còn lại ${stockQty} sản phẩm` 
                        : `Còn hàng (${stockQty} sản phẩm)`
                    }
                  </span>
                </div>
              </div>

              {/* Sold Count */}
              <div className="flex items-center gap-2 border-l border-stone-200 pl-6">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Đã bán:</span>
                <span className="text-xs font-black text-stone-850">
                  {product.soldCount || 0} sản phẩm
                </span>
              </div>
            </div>

            {/* Wishlist & Share Action Row */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tương tác:</span>
              <div className="flex gap-2">
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleFavorite(product, !!useAuthStore.getState().user)}
                  className="flex h-9 px-3.5 items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-xs font-bold text-stone-700 shadow-xs cursor-pointer focus:outline-none"
                >
                  <Heart className={`h-4 w-4 transition-transform active:scale-95 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-stone-400'}`} />
                  {isFavorite ? 'Đã thích' : 'Yêu thích'}
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex h-9 px-3.5 items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-xs font-bold text-stone-700 shadow-xs cursor-pointer focus:outline-none"
                >
                  <Share2 className="h-4 w-4 text-stone-400" />
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Shop Owner Info Card */}
            {product.createdBy && (
              <div className="mt-6 flex items-center justify-between border border-stone-200/60 bg-stone-50/40 rounded-2xl p-4 shadow-3xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100/85 flex items-center justify-center text-amber-900 font-black text-sm shadow-xs border border-amber-200/40">
                    {(product.createdBy?.fullName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Cửa hàng</p>
                    <p className="text-sm font-black text-stone-850">
                      {product.createdBy?.fullName || 'Chủ cửa hàng'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const shopName = product.createdBy?.fullName || 'store';
                    if (typeof window !== 'undefined') {
                      window.location.href = `/store/${encodeURIComponent(shopName.toLowerCase())}`
                    }
                  }}
                  className="px-4 py-2 border border-amber-800 text-amber-850 hover:bg-amber-850 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer focus:outline-none"
                >
                  Xem cửa hàng
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-8 border-t border-stone-100 pt-6 space-y-4">
            {stockQty > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-550 uppercase tracking-wider">Số lượng:</span>
                <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50/50 p-0.5 shadow-inner">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="p-2 text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40"
                    disabled={qty <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-extrabold text-stone-850">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => Math.min(stockQty, prev + 1))}
                    className="p-2 text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40"
                    disabled={qty >= stockQty}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {status && (
              <p className={`text-xs font-bold py-1 px-3 rounded-lg border inline-block ${
                status.includes('thành công') || status.includes('sao chép') 
                  ? 'text-green-700 bg-green-50/50 border-green-150' 
                  : 'text-red-700 bg-red-50/50 border-red-150'
              }`}>
                {status}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={stockQty === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-800 text-amber-800 hover:bg-amber-50/50 active:scale-98 transition-all py-3 px-6 text-sm font-bold disabled:border-stone-200 disabled:text-stone-400 cursor-pointer focus:outline-none bg-white shadow-sm"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Thêm vào giỏ hàng
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={stockQty === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-98 transition-all py-3 px-6 text-sm font-bold text-white shadow-md hover:shadow-lg disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer focus:outline-none"
              >
                <CreditCard className="h-4.5 w-4.5" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ProductReviews productId={product.id} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-stone-900 tracking-tight">Sản phẩm tương tự</h2>
            <button
              onClick={() => {
                const currentCat = (product as any).category || (product as any).categoryId?.name || '';
                if (typeof window !== 'undefined') {
                  window.location.href = `/products?category=${encodeURIComponent(currentCat)}`
                }
              }}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              Xem tất cả
              <span className="text-sm font-extrabold">&rarr;</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Best Selling Products Section */}
      {bestSellingProducts.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-stone-900 tracking-tight">Sản phẩm bán chạy</h2>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/products`
                }
              }}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              Xem tất cả
              <span className="text-sm font-extrabold">&rarr;</span>
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
  )
}
