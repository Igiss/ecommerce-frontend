import { apiClient } from "./client"

// Dashboard
export function getOwnerDashboard() {
  return apiClient<any>("/owner/dashboard")
}

// Orders
export function getOwnerOrders() {
  return apiClient<any[]>("/owner/orders")
}

export function getOwnerOrder(id: string) {
  return apiClient<any>(`/owner/orders/${id}`)
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

export function uploadOwnerProductImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient<any>("/upload", {
    method: "POST",
    body: formData,
    // Headers must NOT be set to JSON for multipart/form-data.
    // apiClient will bypass setting content-type since body is FormData.
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
