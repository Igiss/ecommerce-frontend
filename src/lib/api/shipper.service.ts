import { apiClient } from './client'

export interface PickupOrderDto {
  shippingProvider: string
  trackingCode?: string
}

export function getShipperOrders() {
  return apiClient<any[]>('/shipper/orders')
}

export function getShipperOrderById(id: string) {
  return apiClient<any>(`/shipper/orders/${id}`)
}

export function pickupOrder(id: string, data: PickupOrderDto) {
  return apiClient<any>(`/shipper/orders/${id}/pickup`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function completeDelivery(id: string) {
  return apiClient<any>(`/shipper/orders/${id}/complete`, {
    method: 'PATCH',
  })
}
