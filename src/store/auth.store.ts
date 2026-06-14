import { create } from 'zustand'
import type { User } from '@/types/user'

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
      set({ user: null })
      return
    }

    set({
      user: {
        ...user,
        name: user.fullName || user.name || '',
        isAdmin: user.role === 'admin',
        isOwner: user.role === 'owner',
      },
    })
  },
  setInitialized: (initialized) => set({ initialized }),
  clearAuth: () => set({ user: null }),
}))
