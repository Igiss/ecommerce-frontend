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
  return apiClient<any>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function changePassword(body: any) {
  return apiClient<any>('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function registerOwner(body: any) {
  return apiClient<any>('/auth/register-owner', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function logoutUser() {
  return apiClient<{ message: string }>('/auth/logout', {
    method: 'POST'
  })
}
