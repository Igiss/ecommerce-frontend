'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (!token || !userStr) {
      setError('Thông tin đăng nhập không hợp lệ hoặc thiếu dữ liệu từ Google.')
      return
    }

    try {
      const user = JSON.parse(userStr)
      setAuth(user, token)
      
      // Successfully authenticated, redirect to homepage
      router.push('/')
    } catch (err) {
      setError('Lỗi phân tích dữ liệu người dùng Google.')
    }
  }, [searchParams, setAuth, router])

  if (error) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl">
        <div className="flex justify-center mb-4 text-red-600">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Đăng nhập thất bại</h2>
        <p className="text-sm text-stone-600 mb-6">{error}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors px-6 py-2 text-sm font-bold text-white shadow-md"
        >
          Quay lại trang Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl">
      <div className="flex justify-center mb-4 text-amber-800">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-stone-900 mb-2">Đang đăng nhập bằng Google</h2>
      <p className="text-sm text-stone-500">Vui lòng chờ trong giây lát khi chúng tôi xác nhận tài khoản của bạn...</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50/50 px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl">
            <div className="flex justify-center mb-4 text-amber-800">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Đang tải...</h2>
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </div>
  )
}
