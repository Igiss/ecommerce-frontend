"use client"

import { useEffect } from "react"
import { getUserProfile } from "@/lib/api/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { useWishlistStore } from "@/store/wishlist.store"

export function AuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    async function initialize() {
      try {
        const user = await getUserProfile()
        setUser(user)
        if (user) {
          useWishlistStore.getState().syncWithServer()
        }
      } catch {
        setUser(null)
      } finally {
        setInitialized(true)
      }
    }

    void initialize()
  }, [setUser, setInitialized])

  return null
}
