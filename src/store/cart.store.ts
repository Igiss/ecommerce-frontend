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
  userId: string | null
  userRole: string | null
  setUserContext: (userId: string | null, userRole: string | null) => void
  addItem: (product: Product, qty: number, customization?: CartItem['customization']) => void
  removeItem: (productId: string, customizationId?: string) => void
  updateQty: (productId: string, qty: number, customizationId?: string) => void
  clearCart: () => void
  getItemsPrice: () => number
}

// Generate unique key for items with same product but different customization
export const getCartItemKey = (item: CartItem) => {
  if (!item.customization) return item.product.id
  const c = item.customization
  return `${item.product.id}-${c.baseColor}-${c.accentColor}-${c.designName}`
}

const getStorageKey = (userId: string | null, userRole: string | null) => {
  if (!userId || !userRole) {
    return 'giadung24h_cart_guest'
  }
  return `giadung24h_cart_${userRole}_${userId}`
}

export const useCartStore = create<CartState>((set, get) => {
  // Load initial guest cart from localStorage
  let initialItems: CartItem[] = []
  if (typeof window !== 'undefined') {
    try {
      let storedItems = localStorage.getItem('giadung24h_cart_guest') || localStorage.getItem('giadung24h_cart') || localStorage.getItem('cozyhome_cart_guest') || localStorage.getItem('cozyhome_cart')
      if (storedItems) initialItems = JSON.parse(storedItems)
    } catch {
      // Ignore
    }
  }

  return {
    items: initialItems,
    userId: null,
    userRole: null,

    setUserContext: (userId, userRole) => {
      let loadedItems: CartItem[] = []
      if (typeof window !== 'undefined') {
        try {
          const key = getStorageKey(userId, userRole)
          let storedItems = localStorage.getItem(key)
          if (!userId && !storedItems) {
            storedItems = localStorage.getItem('giadung24h_cart') || localStorage.getItem('cozyhome_cart')
          }
          if (storedItems) loadedItems = JSON.parse(storedItems)
        } catch {
          // Ignore
        }
      }
      set({ userId, userRole, items: loadedItems })
    },

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
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.setItem(key, JSON.stringify(updatedItems))
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
        return item.product.id !== productId
      })

      if (typeof window !== 'undefined') {
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.setItem(key, JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    updateQty: (productId, qty, customizationId) => {
      const currentItems = get().items
      const updatedItems = currentItems.map(item => {
        const matchesProduct = item.product.id === productId
        const matchesCustom = customizationId ? getCartItemKey(item) === customizationId : !item.customization

        if (matchesProduct && matchesCustom) {
          return { ...item, qty: Math.max(1, qty) }
        }
        return item
      })

      if (typeof window !== 'undefined') {
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.setItem(key, JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    clearCart: () => {
      if (typeof window !== 'undefined') {
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.removeItem(key)
      }
      set({ items: [] })
    },

    getItemsPrice: () => {
      return get().items.reduce((total, item) => total + (item.product.price * item.qty), 0)
    }
  }
})
