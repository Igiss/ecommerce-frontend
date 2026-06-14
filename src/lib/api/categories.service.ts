import { apiClient } from "./client"

export interface Category {
  id?: string
  _id?: string
  name: string
  slug: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export function getCategories(status?: string) {
  const query = status ? `?status=${status}` : ''
  return apiClient<Category[]>(`/categories${query}`)
}

export function getCategoryById(id: string) {
  return apiClient<Category>(`/categories/${id}`)
}

export function createCategory(body: { name: string; slug?: string; description?: string; status?: 'active' | 'inactive' }) {
  return apiClient<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateCategory(id: string, body: { name?: string; slug?: string; description?: string; status?: 'active' | 'inactive' }) {
  return apiClient<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteCategory(id: string) {
  return apiClient<Category>(`/categories/${id}`, {
    method: 'DELETE',
  })
}
