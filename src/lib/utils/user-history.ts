import type { Product } from '@/types/product'

const USER_HISTORY_KEY = 'giadung24h_user_history'

export interface UserHistory {
  viewedProductIds: string[]
  viewedCategoryNames: Record<string, number> // categoryName -> count
  lastViewedAt: number
}

export function getUserHistory(): UserHistory {
  if (typeof window === 'undefined') {
    return { viewedProductIds: [], viewedCategoryNames: {}, lastViewedAt: Date.now() }
  }

  try {
    const raw = localStorage.getItem(USER_HISTORY_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }

  return { viewedProductIds: [], viewedCategoryNames: {}, lastViewedAt: Date.now() }
}

export function trackProductView(product: Product) {
  if (typeof window === 'undefined' || !product) return

  try {
    const history = getUserHistory()
    const pId = String(product.id || (product as any)._id)

    // Add to viewed IDs (keep latest 20)
    const updatedIds = [pId, ...history.viewedProductIds.filter((id) => id !== pId)].slice(0, 20)

    // Category count
    const catName = typeof product.category === 'object' ? product.category?.name : (product.category || (product as any).categoryId?.name)
    const categoryCounts = { ...history.viewedCategoryNames }

    if (catName) {
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
    }

    const updatedHistory: UserHistory = {
      viewedProductIds: updatedIds,
      viewedCategoryNames: categoryCounts,
      lastViewedAt: Date.now(),
    }

    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch {
    // silence
  }
}

/**
 * Recommendation algorithm logic
 */
export function getPersonalizedProducts(allProducts: Product[], limit = 4): { items: Product[]; reason: string } {
  if (!allProducts || allProducts.length === 0) {
    return { items: [], reason: 'Sản phẩm nổi bật' }
  }

  const history = getUserHistory()

  // Cold start fallback: User hasn't viewed anything yet
  if (history.viewedProductIds.length === 0 && Object.keys(history.viewedCategoryNames).length === 0) {
    // Sort by rating or discount or original order
    const topRated = [...allProducts].sort((a, b) => ((b as any).rating || 4.5) - ((a as any).rating || 4.5)).slice(0, limit)
    return { items: topRated, reason: 'Sản phẩm đang được quan tâm nhất' }
  }

  // Find top favorite categories
  const sortedCategories = Object.entries(history.viewedCategoryNames).sort((a, b) => b[1] - a[1])
  const topCategoryName = sortedCategories.length > 0 ? sortedCategories[0][0] : null

  // Score each product
  const scored = allProducts.map((prod) => {
    const pId = String(prod.id || (prod as any)._id)
    const catName = typeof prod.category === 'object' ? (prod.category as any)?.name : (prod.category || (prod as any).categoryId?.name)
    let score = 0

    // Bonus for matching top viewed category
    if (topCategoryName && catName && catName.toLowerCase() === topCategoryName.toLowerCase()) {
      score += 50
    } else if (catName && history.viewedCategoryNames[catName]) {
      score += 20 * history.viewedCategoryNames[catName]
    }

    // Rating bonus
    score += ((prod as any).rating || 4.5) * 5

    // Penalize products already viewed recently so user discovers fresh ones
    if (history.viewedProductIds.includes(pId)) {
      score -= 15
    }

    return { product: prod, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const recommended = scored.slice(0, limit).map((s) => s.product)

  let reason = 'Dựa trên danh mục bạn thường xem'
  if (topCategoryName) {
    reason = `Dành riêng cho bạn quan tâm ${topCategoryName}`
  }

  return { items: recommended, reason }
}

export function getRecentlyViewedProducts(allProducts: Product[], limit = 6): Product[] {
  const history = getUserHistory()
  if (history.viewedProductIds.length === 0) return []

  const map = new Map<string, Product>()
  allProducts.forEach((p) => {
    const pId = String(p.id || (p as any)._id)
    map.set(pId, p)
  })

  const list: Product[] = []
  for (const id of history.viewedProductIds) {
    const prod = map.get(id)
    if (prod) {
      list.push(prod)
      if (list.length >= limit) break
    }
  }

  return list
}
