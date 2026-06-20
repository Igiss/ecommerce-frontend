'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, type UserNotification } from '@/lib/api/notification.service'
import { Bell, Calendar, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export default function ProfileNotificationsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [notisLoading, setNotisLoading] = useState(true)
  const [notisError, setNotisError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      fetchNotificationsList()
    }
  }, [mounted, user])

  const fetchNotificationsList = () => {
    setNotisLoading(true)
    getMyNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setNotisError(err.message || 'Không thể tải danh sách thông báo.')
      })
      .finally(() => setNotisLoading(false))
  }

  const handleMarkRead = async (notiId: string) => {
    try {
      await markNotificationRead(notiId)
      fetchNotificationsList()
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      fetchNotificationsList()
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleNotiClick = async (noti: UserNotification) => {
    if (!noti.isRead) {
      await handleMarkRead(noti._id)
    }
    if (noti.metadata?.orderId) {
      router.push(`/orders/${noti.metadata.orderId}`)
    }
  }

  if (!mounted || !user) return null

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs min-h-[400px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-700" />
            Thông báo của tôi
          </h2>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-xl border border-stone-300 hover:bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 transition-colors cursor-pointer"
            >
              Đọc tất cả
            </button>
          )}
        </div>

        {notisLoading ? (
          <div className="flex py-12 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
          </div>
        ) : notisError ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-655" />
            <span>{notisError}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
            <p className="text-stone-550 text-sm">Hộp thư thông báo của bạn trống.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {notifications.map((noti) => (
              <div
                key={noti._id}
                onClick={() => handleNotiClick(noti)}
                className={`p-4 flex gap-4 items-start transition-colors cursor-pointer ${
                  !noti.isRead 
                    ? 'bg-amber-500/5 hover:bg-amber-500/10' 
                    : 'hover:bg-stone-50/70'
                }`}
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border ${
                  !noti.isRead 
                    ? 'bg-amber-100/50 border-amber-200 text-amber-800' 
                    : 'bg-stone-50 border-stone-100 text-stone-400'
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-xs sm:text-sm ${!noti.isRead ? 'font-extrabold text-stone-900' : 'font-bold text-stone-700'}`}>
                      {noti.title}
                    </h4>
                    {!noti.isRead && (
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-550 mt-1 leading-relaxed">{noti.message}</p>
                  <div className="mt-2.5 flex items-center gap-3 text-[10px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(noti.createdAt).toLocaleDateString('vi-VN')} {new Date(noti.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {noti.metadata?.orderId && (
                      <span className="font-extrabold text-amber-800 hover:underline">
                        Chi tiết đơn hàng &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
