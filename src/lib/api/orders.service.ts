import { apiClient } from './client'
import { toQueryString } from './utils'

export function createOrder(body: any) {
  return apiClient<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function getMyOrders(params: { page?: number; limit?: number } = {}) {
  const query = toQueryString(params)
  return apiClient<any>(`/orders/my-orders${query ? `?${query}` : ''}`, {
    method: 'GET'
  })
}

export function getOrderById(id: string) {
  return apiClient<any>(`/orders/${id}`, {
    method: 'GET'
  })
}

export function createVNPayUrl(orderId: string) {
  return apiClient<{ paymentUrl: string }>(`/orders/${orderId}/vnpay`, {
    method: 'POST'
  })
}
