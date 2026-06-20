import { apiClient } from "./client"

// Dashboard
export function getOwnerDashboard() {
  return apiClient<any>("/owner/dashboard")
}

export function getOwnerAiTrendReport() {
  return apiClient<string>("/owner/ai-trends")
}

// Orders
export function getOwnerOrders() {
  return apiClient<any[]>("/owner/orders")
}

export function getOwnerOrder(id: string) {
  return apiClient<any>(`/owner/orders/${id}`)
}

export function updateOwnerReturnStatus(id: string, itemId: string, returnStatus: string, returnReason?: string) {
  return apiClient<any>(`/owner/orders/${id}/items/${itemId}/return-status`, {
    method: "PATCH",
    body: JSON.stringify({ returnStatus, returnReason }),
  })
}

export function handOverToShipping(id: string) {
  return apiClient<any>(`/owner/orders/${id}/hand-over`, {
    method: "PATCH",
  })
}

export function updateOwnerOrderStatus(id: string, orderStatus: string) {
  return apiClient<any>(`/owner/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus }),
  })
}

// Products
export function getOwnerProducts(query = "") {
  return apiClient<any>(`/owner/products${query}`)
}

export function createOwnerProduct(body: any) {
  return apiClient<any>("/owner/products", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function updateOwnerProduct(id: string | number, body: any) {
  return apiClient<any>(`/owner/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function deleteOwnerProduct(id: string | number) {
  return apiClient<any>(`/owner/products/${id}`, {
    method: "DELETE",
  })
}

// Coupons
export function getOwnerCoupons() {
  return apiClient<any[]>("/owner/coupons")
}

export function createOwnerCoupon(body: any) {
  return apiClient<any>("/owner/coupons", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function updateOwnerCoupon(id: string | number, body: any) {
  return apiClient<any>(`/owner/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function deleteOwnerCoupon(id: string | number) {
  return apiClient<any>(`/owner/coupons/${id}`, {
    method: "DELETE",
  })
}
