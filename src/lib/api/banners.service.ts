import { apiClient } from "./client"

export interface Banner {
  _id: string
  id?: string
  imageUrl: string
  bgImageUrl?: string
  badge?: string
  title?: string
  description?: string
  linkUrl?: string
  tagline1?: string
  tagline2?: string
  position?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export function getActiveBanners() {
  return apiClient<Banner[]>('/banners')
}

export function getAllAdminBanners() {
  return apiClient<Banner[]>('/banners/admin')
}

export function createBanner(body: Partial<Banner>) {
  return apiClient<Banner>('/banners', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateBanner(id: string, body: Partial<Banner>) {
  return apiClient<Banner>(`/banners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function toggleBannerActive(id: string) {
  return apiClient<Banner>(`/banners/${id}/toggle`, {
    method: 'PATCH',
  })
}

export function deleteBanner(id: string) {
  return apiClient<{ message: string }>(`/banners/${id}`, {
    method: 'DELETE',
  })
}
