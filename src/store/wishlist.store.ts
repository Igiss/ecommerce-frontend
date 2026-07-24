import { create } from 'zustand'
import type { Product } from '@/types/product'
import { getMyWishlist, addToWishlist, removeFromWishlist } from '@/lib/api/wishlists.service'

interface WishlistState {
  items: Product[]
  userId: string | null
  userRole: string | null
  setUserContext: (userId: string | null, userRole: string | null) => void
  syncWithServer: () => Promise<void>
  toggleFavorite: (product: Product, isLoggedIn?: boolean) => Promise<void>
  removeItem: (productId: string, isLoggedIn?: boolean) => Promise<void>
  hasItem: (productId: string) => boolean
  clearWishlist: () => void
}

const getStorageKey = (userId: string | null, userRole: string | null) => {
  if (!userId || !userRole) {
    return 'giadung24h_wishlist_guest'
  }
  return `giadung24h_wishlist_${userRole}_${userId}`
}

export const useWishlistStore = create<WishlistState>((set, get) => {
  // Load initial guest wishlist
  let initialItems: Product[] = []
  if (typeof window !== 'undefined') {
    try {
      const storedItems = localStorage.getItem('giadung24h_wishlist_guest') || localStorage.getItem('giadung24h_wishlist') || localStorage.getItem('cozyhome_wishlist_guest') || localStorage.getItem('cozyhome_wishlist')
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
      let loadedItems: Product[] = []
      if (typeof window !== 'undefined') {
        try {
          const key = getStorageKey(userId, userRole)
          let storedItems = localStorage.getItem(key)
          if (!userId && !storedItems) {
            storedItems = localStorage.getItem('giadung24h_wishlist') || localStorage.getItem('cozyhome_wishlist')
          }
          if (storedItems) loadedItems = JSON.parse(storedItems)
        } catch {
          // Ignore
        }
      }
      set({ userId, userRole, items: loadedItems })
    },

    syncWithServer: async () => {
      if (get().userRole !== 'user') {
        return
      }
      try {
        const data = await getMyWishlist()
        const serverItems = data.map(item => {
          const p = item.productId as any
          return {
            id: p.productId || p._id,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
            ...p
          } as Product
        })
        
        set({ items: serverItems })
        
        if (typeof window !== 'undefined') {
          const key = getStorageKey(get().userId, get().userRole)
          localStorage.setItem(key, JSON.stringify(serverItems))
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
        updatedItems = currentItems.filter(item => String(item.id) !== String(product.id))
      } else {
        updatedItems = [...currentItems, product]
      }

      if (typeof window !== 'undefined') {
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.setItem(key, JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })

      if (isLoggedIn && get().userRole === 'user') {
        try {
          if (exists) {
            await removeFromWishlist(String(product.id))
          } else {
            await addToWishlist(String(product.id))
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
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.setItem(key, JSON.stringify(updatedItems))
      }
      set({ items: updatedItems })

      if (isLoggedIn && get().userRole === 'user') {
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
        const key = getStorageKey(get().userId, get().userRole)
        localStorage.removeItem(key)
      }
      set({ items: [] })
    }
  }
})
