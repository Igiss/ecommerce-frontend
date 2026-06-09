import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
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
      if (storedUser) initialUser = JSON.parse(storedUser)
      if (storedToken) initialToken = storedToken
    } catch {
      // Ignore parse errors
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    setAuth: (user, token) => {
      if (typeof window !== 'undefined') {
        if (user) localStorage.setItem('cupshop_user', JSON.stringify(user))
        else localStorage.removeItem('cupshop_user')

        if (token) localStorage.setItem('cupshop_token', token)
        else localStorage.removeItem('cupshop_token')
      }
      set({ user, token })
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
