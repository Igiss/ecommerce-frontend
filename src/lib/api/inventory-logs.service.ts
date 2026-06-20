import { apiClient } from './client'
import type { InventoryLog } from '@/types/inventory'

export function getInventoryLogs(params?: { productId?: string; type?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.productId) query.append('productId', params.productId)
  if (params?.type) query.append('type', params.type)
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))
  
  const queryString = query.toString() ? `?${query.toString()}` : ''
  // Assumes backend has /products/inventory-logs endpoint for owner
  return apiClient<InventoryLog[]>(`/products/inventory-logs${queryString}`)
}
