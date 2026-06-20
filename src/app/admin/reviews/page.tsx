'use client'

import { useEffect, useState } from 'react'
import { getAllReviewsForAdmin, moderateReview, ReviewResponse } from '@/lib/api/reviews.service'
import { Star, ShieldAlert, CheckCircle, Search, RefreshCw, MessageSquare } from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllReviewsForAdmin()
      setReviews(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đánh giá.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleModerate = async (id: string, isHidden: boolean) => {
    try {
      const newStatus = isHidden ? 'hidden' : 'visible';
      await moderateReview(id, { status: newStatus })
      // Update local state
      setReviews(prev => prev.map(r => 
        (r.id || (r as any)._id) === id ? { ...r, status: newStatus } : r
      ))
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái đánh giá.')
    }
  }

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r as any).productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r as any).userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-700" />
            Duyệt đánh giá
          </h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý và kiểm duyệt các đánh giá từ khách hàng.</p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung, sản phẩm, người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/80 border-b border-stone-200">
              <tr>
                <th className="py-4 px-6 font-bold text-stone-900">Người dùng</th>
                <th className="py-4 px-6 font-bold text-stone-900">Sản phẩm</th>
                <th className="py-4 px-6 font-bold text-stone-900">Đánh giá</th>
                <th className="py-4 px-6 font-bold text-stone-900">Nội dung</th>
                <th className="py-4 px-6 font-bold text-stone-900">Trạng thái</th>
                <th className="py-4 px-6 font-bold text-stone-900 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-800 border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    Không tìm thấy đánh giá nào.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review: any) => (
                  <tr key={review.id || review._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-900">{review.userId?.fullName || 'Ẩn danh'}</div>
                      <div className="text-xs text-stone-500">{review.userId?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {review.productId?.name || `ID: ${review.productId}`}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2" title={review.comment}>{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {review.images.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="Review" className="h-8 w-8 object-cover rounded border border-stone-200 cursor-pointer" />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {review.status === 'hidden' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Đã ẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Hiển thị
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleModerate(review.id || review._id, review.status !== 'hidden')}
                        className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          review.status === 'hidden' 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {review.status === 'hidden' ? 'Cho phép hiện' : 'Ẩn đánh giá'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
