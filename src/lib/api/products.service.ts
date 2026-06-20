import type { Product } from '@/types/product'
import { apiClient } from './client'
import { normalizeApiListResponse } from './utils'

export async function getProducts() {
  const data = await apiClient<unknown>('/products')
  return normalizeApiListResponse<Product>(data)
}

export function getProductById(id: string | number) {
  return apiClient<Product>(`/products/${id}`, { cache: 'no-store' })
}

export function getSuggestedProducts(query: string) {
  return apiClient<Product[]>(`/products/suggestions?q=${encodeURIComponent(query)}`)
}
