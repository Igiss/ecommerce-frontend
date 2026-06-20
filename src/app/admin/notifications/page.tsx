'use client'

import { useState } from 'react'
import { broadcastNotification } from '@/lib/api/admin.service'
import { Bell, Send, AlertCircle, Loader2, CheckCircle, Megaphone, Info } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('system')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    
    if (!confirm('Bạn có chắc muốn gửi thông báo này tới tất cả người dùng không?')) return
    
    setLoading(true)
    try {
      await broadcastNotification({ title, message, type })
      setSuccess('Gửi thông báo thành công tới tất cả người dùng!')
      setTitle('')
      setMessage('')
      setType('system')
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi thông báo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-amber-800" />
          Phát hành Thông báo
        </h1>
        <p className="text-sm text-stone-500 mt-1">Gửi thông báo đẩy, tin tức, khuyến mãi trực tiếp tới Hộp thư của tất cả người dùng.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
        <Info className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">Lưu ý: Thông báo sẽ được gửi đồng loạt (Broadcast) tới toàn bộ thành viên đang hoạt động trên hệ thống.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Tiêu đề thông báo</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Siêu SALE cuối tuần giảm giá 50%!"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Loại thông báo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Bell className="h-4 w-4" />
                </div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 appearance-none bg-white"
                >
                  <option value="system">Hệ thống</option>
                  <option value="promotion">Khuyến mãi</option>
                  <option value="order">Đơn hàng</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Nội dung chi tiết</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || !title || !message}
              className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-sm font-bold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              Gửi thông báo toàn hệ thống
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
