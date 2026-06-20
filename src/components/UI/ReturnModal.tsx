'use client'

import { useState } from 'react'
import { requestReturn } from '@/lib/api/orders.service'
import { X, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ReturnModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  product: any
  onSuccess: () => void
}

export function ReturnModal({ isOpen, onClose, orderId, product, onSuccess }: ReturnModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do đổi trả.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await requestReturn(orderId, product._id || product.id || product.productId, reason, [])
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu đổi trả.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="text-lg font-black text-stone-900">Yêu cầu Đổi/Trả hàng</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Gửi yêu cầu thành công</h3>
              <p className="text-sm text-stone-500 mt-2">Shop sẽ xem xét yêu cầu của bạn và phản hồi sớm nhất.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <img src={product?.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd'} alt="" className="h-16 w-16 rounded-lg object-cover bg-white shadow-sm border border-stone-200" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900 line-clamp-2">{product?.name || product?.productName}</h4>
                  <p className="text-xs text-stone-500 mt-1">SL: {product?.qty} • {product?.price?.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Lý do đổi trả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
                    rows={4}
                    placeholder="Sản phẩm bị lỗi, sai màu, bể vỡ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Hình ảnh minh chứng (Tùy chọn)
                  </label>
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer group">
                    <UploadCloud className="h-8 w-8 text-stone-400 mx-auto mb-2 group-hover:text-amber-500 transition-colors" />
                    <p className="text-xs text-stone-500">Kéo thả ảnh vào đây hoặc click để tải lên.</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:text-stone-500 shadow-md transition-colors">
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
