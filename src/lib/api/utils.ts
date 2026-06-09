export function toQueryString(
  params: Record<string, string | number | boolean | undefined>
) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

export function normalizeApiListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[]
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.products)) return record.products as T[]
    if (Array.isArray(record.data)) return record.data as T[]
  }

  return []
}
