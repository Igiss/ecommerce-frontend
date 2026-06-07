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
