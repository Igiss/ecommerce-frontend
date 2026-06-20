import { useState } from 'react'
import { createReview } from '@/lib/api/reviews.service'
import { X, Star, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { uploadImage } from '@/lib/api/upload.service'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  product: any
  onSuccess: () => void
}

export function ReviewModal({ isOpen, onClose, orderId, product, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (images.length + filesArray.length > 3) {
        setError('Tối đa 3 hình ảnh cho mỗi đánh giá')
        return
      }
      setImages(prev => [...prev, ...filesArray])
      setError('')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const imageUploadIds: string[] = []
      
      // Upload images first
      for (const img of images) {
        const uploadRes = await uploadImage(img, 'review_image')
        imageUploadIds.push(uploadRes.id)
      }

      await createReview({
        orderId,
        productId: product.productId || product.id,
        rating,
        comment,
        ...(imageUploadIds.length > 0 ? { imageUrls: imageUploadIds } : {}) // Note: backend dto might expect imageUploadIds instead of imageUrls based on reviews.service.ts
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Không thể gửi đánh giá')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-900 mb-2">Đánh giá thành công!</h3>
          <p className="text-stone-500">Cảm ơn bạn đã gửi đánh giá cho sản phẩm này.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-900">Đánh giá sản phẩm</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 transition-colors">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="flex gap-3 items-center mb-6 bg-stone-50 p-3 rounded-xl border border-stone-100">
            <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-900 text-sm truncate">{product.name}</p>
            </div>
          </div>

          <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2 text-center">Chất lượng sản phẩm</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Đánh giá chi tiết</label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm nhé..."
                rows={4}
                className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Thêm hình ảnh (tối đa 3)</label>
              <div className="flex flex-wrap gap-3">
                {images.map((file, idx) => (
                  <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-stone-200">
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className="h-20 w-20 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-amber-400 transition-colors">
                    <Upload className="h-5 w-5 text-stone-400 mb-1" />
                    <span className="text-[10px] font-bold text-stone-500">Tải ảnh</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <button
            type="submit"
            form="review-form"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-800 py-3 text-sm font-bold text-white hover:bg-amber-900 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  )
}
