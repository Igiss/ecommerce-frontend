import { apiClient } from './client'

export interface CoverageArea {
  province: string
  ward: string
}

export interface UpdateCoverageDto {
  coverageAreas: CoverageArea[]
}

export interface UpdateShippingUnitDto {
  companyName?: string
  contactPhone?: string
  address?: string
  ward?: string
  province?: string
}

export interface ShippingUnitResponse {
  _id: string
  userId: any // Populated user info
  companyName?: string
  contactPhone?: string
  address?: string
  ward?: string
  province?: string
  coverageAreas: CoverageArea[]
  createdAt: string
  updatedAt: string
}

// Admin
export function getAllShippingUnits() {
  return apiClient<ShippingUnitResponse[]>('/shipping-units')
}

export function updateCoverage(userId: string, data: UpdateCoverageDto) {
  return apiClient<ShippingUnitResponse>(`/shipping-units/${userId}/coverage`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ShippingUnit Role
export function getMyShippingProfile() {
  return apiClient<ShippingUnitResponse>('/shipping-units/me')
}

export function updateMyShippingProfile(data: UpdateShippingUnitDto) {
  return apiClient<ShippingUnitResponse>('/shipping-units/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// Shipper Assignment (Orders)
export function getShippingUnitOrders() {
  return apiClient<any[]>('/shipping-unit/orders')
}

export function getShippingUnitOrder(id: string) {
  return apiClient<any>(`/shipping-unit/orders/${id}`)
}

export function assignShipperToOrder(id: string, shipperId: string) {
  return apiClient<any>(`/shipping-unit/orders/${id}/assign-shipper`, {
    method: 'PATCH',
    body: JSON.stringify({ shipperId }),
  })
}

// Shipper Management
export function getShippers() {
  return apiClient<any[]>('/shipping-unit/shippers')
}

export function createShipper(data: any) {
  return apiClient<any>('/shipping-unit/shippers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getShipper(id: string) {
  return apiClient<any>(`/shipping-unit/shippers/${id}`)
}

export function updateShipper(id: string, data: any) {
  return apiClient<any>(`/shipping-unit/shippers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function updateShipperAvailability(id: string, isAvailable: boolean) {
  return apiClient<any>(`/shipping-unit/shippers/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable }),
  })
}
