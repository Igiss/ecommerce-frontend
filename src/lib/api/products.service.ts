import type { Product } from '@/types/product'
import { apiClient } from './client'

export function getProducts() {
  return apiClient<Product[]>('/products')
}
