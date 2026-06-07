export async function apiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${path}`, init)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
