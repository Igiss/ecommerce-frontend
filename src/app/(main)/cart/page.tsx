'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, getCartItemKey } from '@/store/cart.store'
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Paintbrush } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQty, getItemsPrice } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  const itemsPrice = getItemsPrice()
  const shippingPrice = itemsPrice > 500000 || itemsPrice === 0 ? 0 : 30000
  const totalPrice = itemsPrice + shippingPrice

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center mb-6 text-stone-300">
          <ShoppingBag className="h-20 w-20" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-2 text-stone-500 text-sm">Hãy chọn cho mình chiếc cốc ưng ý nhất và bắt đầu trang trí nhé!</p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors px-6 py-3 text-sm font-bold text-white shadow-md inline-block"
          >
            Quay lại Cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemKey = getCartItemKey(item)
            const imageUrl = (item.product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
            
            return (
              <div
                key={itemKey}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs"
              >
                {/* Product Image */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-contain object-center"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1">
                      {item.product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 capitalize">
                    Phân loại: {(item.product as any).category || 'Ly cốc'}
                  </p>

                  {/* Customization Details */}
                  {item.customization && (
                    <div className="mt-2 flex flex-wrap gap-2.5 items-center bg-amber-50/50 rounded-lg p-2 border border-amber-100/40 text-[10px] text-amber-900/80 font-medium">
                      <div className="flex items-center gap-1 shrink-0">
                        <Paintbrush className="h-3 w-3 text-amber-600" />
                        <span>Màu sắc:</span>
                        <span
                          className="h-3 w-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: item.customization.baseColor }}
                        />
                      </div>
                      {item.customization.designName && (
                        <div className="shrink-0">
                          <span>Artwork: </span>
                          <span className="font-semibold text-stone-700">{item.customization.designName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Qty selectors */}
                  <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                    <button
                      onClick={() => updateQty(item.product.id, item.qty - 1, itemKey)}
                      className="p-1 text-stone-500 hover:text-stone-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.qty + 1, itemKey)}
                      className="p-1 text-stone-500 hover:text-stone-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Total price */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-extrabold text-stone-900">
                      {(item.product.price * item.qty).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.product.id, itemKey)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-3.5 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Tạm tính ({items.reduce((s, i) => s + i.qty, 0)} cốc)</span>
              <span className="font-semibold text-stone-900">{itemsPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>
                {shippingPrice === 0 ? (
                  <span className="text-green-600 font-bold">Miễn phí</span>
                ) : (
                  `${shippingPrice.toLocaleString('vi-VN')}đ`
                )}
              </span>
            </div>

            {shippingPrice > 0 && (
              <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 leading-normal">
                Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong>! Mua thêm <strong>{(500000 - itemsPrice).toLocaleString('vi-VN')}đ</strong> để được miễn phí giao hàng.
              </div>
            )}
            
            <hr className="border-stone-100" />
            
            <div className="flex justify-between text-base font-extrabold text-stone-900">
              <span>Tổng cộng</span>
              <span className="text-amber-900">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-3 text-sm font-bold text-white shadow-md focus:outline-none"
          >
            Tiến hành thanh toán
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
