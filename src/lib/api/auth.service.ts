import { apiClient } from './client'

export function loginUser(body: any) {
  return apiClient<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function registerUser(body: any) {
  return apiClient<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function getUserProfile() {
  return apiClient<any>('/auth/profile', {
    method: 'GET'
  })
}

export function updateUserProfile(body: any) {
  return apiClient<any>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}
