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
  return apiClient<any>(`/orders/me${query ? `?${query}` : ''}`, {
    method: 'GET'
  })
}

export function getOrderById(id: string) {
  return apiClient<any>(`/orders/${id}`, {
    method: 'GET'
  })
}

export function requestReturn(id: string, itemId: string, returnReason: string, returnImages?: string[]) {
  return apiClient<any>(`/orders/${id}/items/${itemId}/return`, {
    method: 'POST',
    body: JSON.stringify({ returnReason, returnImages })
  })
}

export function cancelOrder(id: string, cancelReason?: string) {
  return apiClient<any>(`/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelReason })
  })
}

export function createVNPayUrl(orderId: string) {
  return apiClient<{ paymentUrl: string }>(`/payments/vnpay/${orderId}/url`, {
    method: 'POST'
  })
}

export function createSepayQr(orderId: string) {
  return apiClient<{
    orderId: string
    totalAmount: number
    paymentCode: string
    qrUrl: string
    bankName: string
    accountNumber: string
    accountHolder: string
  }>(`/payments/sepay/${orderId}/qr`, {
    method: 'POST'
  })
}

export function getSepayStatus(orderId: string) {
  return apiClient<{
    orderId: string
    paymentStatus: string
    orderStatus: string
    paidAt?: string
    isPaid: boolean
  }>(`/payments/sepay/status/${orderId}`, {
    method: 'GET'
  })
}

export function createSepayCheckout(orderId: string) {
  return apiClient<{
    orderId: string
    checkoutURL: string
    checkoutFormfields: Record<string, any>
  }>(`/payments/sepay/${orderId}/checkout`, {
    method: 'POST'
  })
}

