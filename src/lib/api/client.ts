export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers)

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
    credentials: "include",
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
    throw new ApiError(errMsg, response.status)
  }

  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
