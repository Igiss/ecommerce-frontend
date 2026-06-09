import { useAuthStore } from '@/store/auth.store'

export async function apiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = useAuthStore.getState().token

  const headers = new Headers(init?.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers
  })

  if (!response.ok) {
    let errMsg = `API request failed with status ${response.status}`
    try {
      const errorData = await response.json() as { message?: string }
      if (errorData && errorData.message) {
        errMsg = errorData.message
      }
    } catch {
      // Ignore
    }
    throw new Error(errMsg)
  }

  return response.json() as Promise<T>
}
