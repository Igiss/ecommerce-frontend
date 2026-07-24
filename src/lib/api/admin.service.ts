import { apiClient, ApiError } from './client'
import { normalizeApiListResponse, toQueryString } from './utils'

function getOrderStatus(order: any) {
  return (order?.orderStatus || order?.status || 'pending').toString().toLowerCase()
}

function getOrderRevenue(order: any) {
  return Number(order?.totalAmount ?? order?.totalPrice ?? 0) || 0
}

function mapStatusToBackend(status: string): string {
  switch (status) {
    case 'processing': return 'confirmed'
    case 'shipped': return 'shipping'
    case 'delivered': return 'completed'
    default: return status
  }
}

async function getNormalizedList<T>(path: string, init?: RequestInit) {
  const data = await apiClient<unknown>(path, init)
  return normalizeApiListResponse<T>(data)
}

// SePay Bank Settings API
export function getSepaySettings() {
  return apiClient<{
    bankName: string
    accountNumber: string
    accountHolder: string
    apiKey?: string
  }>('/settings/sepay', {
    method: 'GET'
  })
}

export function updateSepaySettings(data: {
  bankName: string
  accountNumber: string
  accountHolder: string
  apiKey?: string
}) {
  return apiClient<any>('/settings/sepay', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Dashboard stats
export async function getDashboardStats() {
  try {
    return await apiClient<any>('/reports/dashboard', {
      method: 'GET'
    })
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      const [products, orders] = await Promise.all([
        getNormalizedList<any>('/products', { method: 'GET' }),
        getNormalizedList<any>('/orders', { method: 'GET' })
      ])

      const pendingOrders = orders.filter((order: any) => ['pending', 'processing'].includes(getOrderStatus(order))).length
      const deliveredOrders = orders.filter((order: any) => ['delivered', 'completed'].includes(getOrderStatus(order))).length
      const lowStockProducts = products.filter((product: any) => Number(product?.stock ?? product?.countInStock ?? 0) < 5).length

      return {
        revenue: orders.reduce((sum: number, order: any) => sum + getOrderRevenue(order), 0),
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        totalProducts: products.length,
        totalUsers: 0,
        lowStockProducts
      }
    }

    throw error
  }
}

export async function getRevenueChart(params: { period?: string } = {}) {
  const query = toQueryString(params)

  try {
    return await apiClient<any[]>(`/reports/revenue-chart${query ? `?${query}` : ''}`, {
      method: 'GET'
    })
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      return []
    }
    throw error
  }
}

export async function getTopProducts() {
  try {
    return await apiClient<any[]>('/reports/top-products', {
      method: 'GET'
    })
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      return []
    }
    throw error
  }
}

export async function getAiTrendReport(): Promise<{ report: string }> {
  return await apiClient<{ report: string }>('/reports/ai-trends', {
    method: 'GET'
  })
}

// Admin Orders
export async function getAdminOrders(params: { page?: number; limit?: number; status?: string } = {}) {
  const query = toQueryString(params)
  const route = `/admin/orders${query ? `?${query}` : ''}`

  try {
    const data = await apiClient<any>(route, {
      method: 'GET'
    })
    const orders = normalizeApiListResponse<any>(data)
    return params.status ? { orders: orders.filter((order: any) => getOrderStatus(order) === params.status) } : { orders }
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      const fallbackOrders = await getNormalizedList<any>(`/orders${query ? `?${query}` : ''}`, { method: 'GET' })
      const filteredOrders = params.status ? fallbackOrders.filter((order: any) => getOrderStatus(order) === params.status) : fallbackOrders
      return { orders: filteredOrders }
    }
    throw error
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const backendStatus = mapStatusToBackend(status)

  try {
    return await apiClient<any>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus: backendStatus })
    })
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      return apiClient<any>(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: backendStatus })
      })
    }
    throw error
  }
}

export async function deliverOrder(orderId: string) {
  try {
    return await apiClient<any>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus: 'completed' })
    })
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      return apiClient<any>(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'completed' })
      })
    }
    throw error
  }
}

// Admin Coupons
export function getCoupons() {
  return apiClient<any[]>('/coupons', {
    method: 'GET'
  })
}

export function createCoupon(body: any) {
  return apiClient<any>('/coupons', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function updateCoupon(id: string, body: any) {
  return apiClient<any>(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

export function deleteCoupon(id: string) {
  return apiClient<any>(`/coupons/${id}`, {
    method: 'DELETE'
  })
}

// Admin Products
export function createProduct(body: any) {
  return apiClient<any>('/products', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function updateProduct(id: string | number, body: any) {
  return apiClient<any>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function deleteProduct(id: string) {
  return apiClient<any>(`/products/${id}`, {
    method: 'DELETE'
  })
}

// Admin Users Management
export function getAdminUsers() {
  return apiClient<any[]>('/users', {
    method: 'GET'
  })
}

export function updateUserStatus(userId: string, status: 'pending' | 'active' | 'blocked') {
  return apiClient<any>(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export function updateUserRole(userId: string, role: 'user' | 'owner' | 'admin') {
  return apiClient<any>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  })
}

// Admin Notifications
export function broadcastNotification(body: { title: string; message: string; type: string }) {
  return apiClient<any>('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}
