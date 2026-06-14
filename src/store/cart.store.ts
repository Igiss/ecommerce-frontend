import { create } from 'zustand'
import type { Product } from '@/types/product'

export interface CartItem {
  product: Product
  qty: number
  customization?: {
    baseColor: string
    accentColor: string
    designImage: string
    designName: string
    printX: number
    printY: number
    printSize: number
  }
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, qty: number, customization?: CartItem['customization']) => void
  removeItem: (productId: string, customizationId?: string) => void
  updateQty: (productId: string, qty: number, customizationId?: string) => void
  clearCart: () => void
  getItemsPrice: () => number
}

// Generate unique key for items with same product but different customization
export const getCartItemKey = (item: CartItem) => {
  if (!item.customization) return String(item.product.id)
  const c = item.customization
  return `${String(item.product.id)}-${c.baseColor}-${c.accentColor}-${c.designName}`
}

export const useCartStore = create<CartState>((set, get) => {
  // Load initial cart from localStorage
  let initialItems: CartItem[] = []
  if (typeof window !== 'undefined') {
    try {
      const storedItems = localStorage.getItem('cupshop_cart')
      if (storedItems) initialItems = JSON.parse(storedItems)
    } catch {
      // Ignore parse errors
    }
  }

  return {
    items: initialItems,

    addItem: (product, qty, customization) => {
      const currentItems = get().items
      const newItem: CartItem = { product, qty, customization }
      const newKey = getCartItemKey(newItem)

      const existingIndex = currentItems.findIndex(item => getCartItemKey(item) === newKey)

      let updatedItems
      if (existingIndex > -1) {
        updatedItems = [...currentItems]
        updatedItems[existingIndex].qty += qty
      } else {
        updatedItems = [...currentItems, newItem]
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_cart', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    removeItem: (productId, customizationId) => {
      const currentItems = get().items
      const updatedItems = currentItems.filter(item => {
        if (customizationId) {
          const itemKey = getCartItemKey(item)
          return itemKey !== customizationId
        }
        return String(item.product.id) !== String(productId)
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_cart', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    updateQty: (productId, qty, customizationId) => {
      const currentItems = get().items
      const updatedItems = currentItems.map(item => {
        const matchesProduct = String(item.product.id) === String(productId)
        const matchesCustom = customizationId ? getCartItemKey(item) === customizationId : !item.customization

        if (matchesProduct && matchesCustom) {
          return { ...item, qty: Math.max(1, qty) }
        }
        return item
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_cart', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    clearCart: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cupshop_cart')
      }
      set({ items: [] })
    },

    getItemsPrice: () => {
      return get().items.reduce((total, item) => total + (item.product.price * item.qty), 0)
    }
  }
})
