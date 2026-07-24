import { apiClient } from "./client"

export type OwnerAnalyticsPeriod = "7days" | "30days" | "12months"

export interface OwnerDashboardSummary {
  orderCount: number
  revenue: number
  itemCount: number
  productCount: number
  couponCount: number
}

export interface OwnerRevenuePoint {
  _id: {
    year: number
    month: number
    day?: number
  }
  revenue: number
  orders: number
}

export interface OwnerTopProduct {
  _id: string
  name: string
  image?: string
  totalSold: number
  revenue: number
}

export interface OwnerStatusBreakdown {
  _id: "pending" | "confirmed" | "assigned" | "shipping" | "completed" | "cancelled"
  orders: number
  items: number
}

export interface OwnerAnalytics {
  period: OwnerAnalyticsPeriod
  periodStart: string
  periodEnd: string
  lifetime: OwnerDashboardSummary
  dashboard: {
    totalProducts: number
    lowStockProducts: number
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    bestSellingProducts: OwnerTopProduct[]
    pendingOrders: number
    completedOrders: number
  }
  revenueChart: OwnerRevenuePoint[]
  topProducts: OwnerTopProduct[]
  statusBreakdown: OwnerStatusBreakdown[]
  periodOrderCount: number
  periodItemCount: number
}

// Dashboard
export function getOwnerDashboard() {
  return apiClient<OwnerDashboardSummary>("/owner/dashboard")
}

export function getOwnerAnalytics(period: OwnerAnalyticsPeriod = "30days") {
  return apiClient<OwnerAnalytics>(`/owner/analytics?period=${period}`)
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
