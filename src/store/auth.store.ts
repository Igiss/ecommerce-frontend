import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
  fullName?: string
  role?: string
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User | null, token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage if client-side
  let initialUser = null
  let initialToken = null
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('cupshop_user')
      const storedToken = localStorage.getItem('cupshop_token')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed) {
          parsed.name = parsed.fullName || parsed.name || ''
          parsed.isAdmin = parsed.role === 'admin'
          initialUser = parsed
        }
      }
      if (storedToken) initialToken = storedToken
    } catch {
      // Ignore parse errors
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    setAuth: (user, token) => {
      let normalizedUser = null
      if (user) {
        normalizedUser = {
          ...user,
          name: user.fullName || user.name || '',
          isAdmin: user.role === 'admin'
        }
      }

      if (typeof window !== 'undefined') {
        if (normalizedUser) localStorage.setItem('cupshop_user', JSON.stringify(normalizedUser))
        else localStorage.removeItem('cupshop_user')

        if (token) localStorage.setItem('cupshop_token', token)
        else localStorage.removeItem('cupshop_token')
      }
      set({ user: normalizedUser, token })
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cupshop_user')
        localStorage.removeItem('cupshop_token')
      }
      set({ user: null, token: null })
    }
  }
})
