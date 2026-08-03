import { apiClient } from './client'
import { CreatePriceSchedulePayload, ProductPriceSchedule } from '@/types/product'

export const priceScheduleService = {
  create: async (payload: CreatePriceSchedulePayload): Promise<ProductPriceSchedule> => {
    return apiClient<ProductPriceSchedule>('/price-schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getByProduct: async (productId: string): Promise<ProductPriceSchedule[]> => {
    return apiClient<ProductPriceSchedule[]>(`/price-schedules/product/${productId}`, {
      method: 'GET',
    })
  },

  cancel: async (id: string): Promise<ProductPriceSchedule> => {
    return apiClient<ProductPriceSchedule>(`/price-schedules/${id}`, {
      method: 'DELETE',
    })
  },
}
