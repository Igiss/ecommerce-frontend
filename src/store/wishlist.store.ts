import { create } from 'zustand'
import type { Product } from '@/types/product'

interface WishlistState {
  items: Product[]
  syncWithServer: () => Promise<void>
  toggleFavorite: (product: Product, isLoggedIn?: boolean) => Promise<void>
  removeItem: (productId: string, isLoggedIn?: boolean) => Promise<void>
  hasItem: (productId: string) => boolean
  clearWishlist: () => void
}

import { getMyWishlist, addToWishlist, removeFromWishlist } from '@/lib/api/wishlists.service'

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

    syncWithServer: async () => {
      try {
        const data = await getMyWishlist()
        // Map backend format to local Product format
        const serverItems = data.map(item => {
          const p = item.productId as any
          return {
            id: p.productId || p._id, // Keep the numeric or string ID depending on your frontend Product type
            name: p.name,
            price: p.price,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
            ...p
          } as Product
        })
        
        // Merge with local items (optional) or just overwrite with server items
        set({ items: serverItems })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('cupshop_wishlist', JSON.stringify(serverItems))
        }
      } catch (err: any) {
        if (err?.status !== 403) {
          console.error('Failed to sync wishlist with server:', err)
        }
      }
    },

    toggleFavorite: async (product, isLoggedIn = false) => {
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

      // Call API if logged in
      if (isLoggedIn) {
        try {
          if (exists) {
            await removeFromWishlist(String(product.id))
          } else {
            await addToWishlist(String(product.id)) // Ensure numeric if backend expects number
          }
        } catch (err: any) {
          if (err?.status !== 403) {
            console.error('Failed to update wishlist on server:', err)
          }
        }
      }
    },

    removeItem: async (productId, isLoggedIn = false) => {
      const currentItems = get().items
      const updatedItems = currentItems.filter(item => String(item.id) !== String(productId))

      if (typeof window !== 'undefined') {
        localStorage.setItem('cupshop_wishlist', JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })

      if (isLoggedIn) {
        try {
          await removeFromWishlist(String(productId))
        } catch (err: any) {
          if (err?.status !== 403) {
            console.error('Failed to update wishlist on server:', err)
          }
        }
      }
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
