import { create } from 'zustand'
import type { Product } from '@/types/product'

interface WishlistState {
  items: Product[]
  toggleFavorite: (product: Product) => void
  removeItem: (productId: string) => void
  hasItem: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => {
  // Load initial wishlist from localStorage
  let initialItems: Product[] = []
  if (typeof window !== 'undefined') {
    try {
      const storedItems = localStorage.getItem('cupshop_wishlist')
      if (storedItems) initialItems = JSON.parse(storedItems)
    } catch {
      // Ignore parse errors
    }
  }

  return {
    items: initialItems,

    toggleFavorite: (product) => {
      const currentItems = get().items
      const exists = currentItems.some(item => String(item.id) === String(product.id))
      let updatedItems

      if (exists) {
        // Remove it
        updatedItems = currentItems.filter(item => String(item.id) !== String(product.id))
      } else {
        // Add it
        updatedItems = [...currentItems, product]
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_wishlist', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    removeItem: (productId) => {
      const currentItems = get().items
      const updatedItems = currentItems.filter(item => String(item.id) !== String(productId))

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_wishlist', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })
    },

    hasItem: (productId) => {
      return get().items.some(item => String(item.id) === String(productId))
    },

    clearWishlist: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cupshop_wishlist')
      }
      set({ items: [] })
    }
  }
})
