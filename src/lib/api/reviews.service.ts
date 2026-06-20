import { apiClient } from './client'

export interface CreateReviewDto {
  orderId: string
  productId: string
  rating: number
  comment?: string
  imageUrls?: string[]
}

export interface UpdateReviewDto {
  rating?: number
  comment?: string
  imageUrls?: string[]
}

export interface ModerateReviewDto {
  status: 'visible' | 'hidden'
  moderationReason?: string
}

export interface ReviewResponse {
  id: string
  userId: any
  orderId: any
  productId: any
  rating: number
  comment?: string
  images?: string[]
  status: 'visible' | 'hidden' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface RatingSummary {
  productId: string
  averageRating: number
  totalReviews: number
  distribution: { [key: number]: number }
}

export function createReview(data: CreateReviewDto) {
  return apiClient<ReviewResponse>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getProductReviews(productId: string) {
  return apiClient<ReviewResponse[]>(`/reviews/product/${productId}`)
}

export function getAllReviewsForAdmin() {
  return apiClient<ReviewResponse[]>('/reviews/admin/all')
}

export function getProductRatingSummary(productId: string) {
  return apiClient<RatingSummary>(`/reviews/product/${productId}/summary`)
}

export function moderateReview(id: string, data: ModerateReviewDto) {
  return apiClient<ReviewResponse>(`/reviews/${id}/moderation`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function updateReview(id: string, data: UpdateReviewDto) {
  return apiClient<ReviewResponse>(`/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteReview(id: string) {
  return apiClient<{ message: string }>(`/reviews/${id}`, {
    method: 'DELETE',
  })
}
