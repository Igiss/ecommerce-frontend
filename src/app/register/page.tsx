'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { registerUser } from '@/lib/api/auth.service'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { user, setAuth } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic password validation
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải dài ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const data = await registerUser({ fullName: name, email, password })
      setAuth(data.user || data, data.accessToken || data.token)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-extrabold text-amber-800">
              Cup<span className="text-amber-600">Shop</span>
            </span>
          </Link>
          <h2 className="text-center text-2xl font-bold tracking-tight text-stone-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                Họ và tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2.5 text-sm transition-all focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@viethu.com"
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2.5 text-sm transition-all focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2.5 pr-10 text-sm transition-all focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
                Nhập lại mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2.5 pr-10 text-sm transition-all focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-900 transition-colors focus:outline-none disabled:bg-stone-400"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
