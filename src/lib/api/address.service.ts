import { apiClient } from "./client"

export interface UserAddress {
  _id: string
  addressId: number
  userId: string
  label: string
  fullName: string
  phone: string
  addressLine: string
  ward: string
  province: string
  postalCode?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export function getAddresses() {
  return apiClient<UserAddress[]>("/addresses")
}

export function createAddress(body: Omit<Partial<UserAddress>, "_id" | "addressId" | "userId" | "createdAt" | "updatedAt">) {
  return apiClient<UserAddress>("/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function updateAddress(addressId: number, body: Omit<Partial<UserAddress>, "_id" | "addressId" | "userId" | "createdAt" | "updatedAt">) {
  return apiClient<UserAddress>(`/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function setDefaultAddress(addressId: number) {
  return apiClient<UserAddress>(`/addresses/${addressId}/default`, {
    method: "PATCH",
  })
}

export function deleteAddress(addressId: number) {
  return apiClient<{ message: string }>(`/addresses/${addressId}`, {
    method: "DELETE",
  })
}
