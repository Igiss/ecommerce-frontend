'use client'

import { useEffect, useState } from 'react'
import { getProductReviews, getProductRatingSummary, ReviewResponse, RatingSummary } from '@/lib/api/reviews.service'
import { Star, User } from 'lucide-react'

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [summary, setSummary] = useState<RatingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [reviewsData, summaryData] = await Promise.all([
          getProductReviews(productId),
          getProductRatingSummary(productId)
        ])
        setReviews(reviewsData)
        setSummary(summaryData)
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-800 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mt-12 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-stone-900 mb-6 uppercase tracking-wide">Đánh giá từ khách hàng</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Rating Summary */}
        <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-stone-50 rounded-2xl border border-stone-100">
          <div className="text-4xl font-black text-amber-800 mb-2">
            {summary?.averageRating?.toFixed(1) || '0.0'}
            <span className="text-xl text-stone-400">/5</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(summary?.averageRating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-stone-500">{summary?.totalReviews || 0} lượt đánh giá</p>
        </div>

        {/* Reviews List */}
        <div className="md:w-2/3 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-stone-500 italic text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id || (review as any)._id} className="border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden border border-stone-300">
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-stone-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {review.userId?.fullName || 'Người dùng ẩn danh'}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="Review image" className="h-16 w-16 object-cover rounded-lg border border-stone-200 cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
