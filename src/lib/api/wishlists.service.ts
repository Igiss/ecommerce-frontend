import { apiClient } from './client'
import { Product } from '@/types/product'

export interface WishlistItem {
  _id: string
  productId: Product // Populated product
  addedAt: string
}

export function getMyWishlist() {
  return apiClient<WishlistItem[]>('/wishlists/my')
}

export function addToWishlist(productId: string) {
  return apiClient<{ message: string }>('/wishlists', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
}

export function removeFromWishlist(productId: string) {
  return apiClient<{ message: string }>(`/wishlists/${productId}`, {
    method: 'DELETE',
  })
}
