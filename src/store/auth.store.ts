import { create } from 'zustand'
import type { User } from '@/types/user'
import { useWishlistStore } from './wishlist.store'
import { useCartStore } from './cart.store'

interface AuthState {
  user: User | null
  initialized: boolean
  setUser: (user: User | null) => void
  setInitialized: (initialized: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => {
    if (!user) {
      useWishlistStore.getState().setUserContext(null, null)
      useCartStore.getState().setUserContext(null, null)
      set({ user: null })
      return
    }

    // Isolate user context in wishlist store
    useWishlistStore.getState().setUserContext(
      String(user.id || (user as any)._id),
      user.role || 'user'
    )

    // Isolate user context in cart store
    useCartStore.getState().setUserContext(
      String(user.id || (user as any)._id),
      user.role || 'user'
    )

    set({
      user: {
        ...user,
        name: user.fullName || user.name || '',
        isAdmin: user.role === 'admin',
        isOwner: user.role === 'owner',
        isShipper: user.role === 'shipper',
        isShippingUnit: user.role === 'shipping_unit',
      },
    })
  },
  setInitialized: (initialized) => set({ initialized }),
  clearAuth: () => {
    useWishlistStore.getState().setUserContext(null, null)
    useCartStore.getState().setUserContext(null, null)
    set({ user: null })
  },
}))
