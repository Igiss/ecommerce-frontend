'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { loginUser } from '@/lib/api/auth.service'
import { Coffee, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    setLoading(true)

    try {
      const data = await loginUser({ email, password })
      const userObj = data.user || data
      setUser(userObj)
      useWishlistStore.getState().syncWithServer()
      
      if (userObj.isAdmin) {
        router.replace('/admin/dashboard')
      } else if (userObj.isShipper) {
        router.replace('/shipper/dashboard')
      } else if (userObj.isShippingUnit) {
        router.replace('/shipping-unit/dashboard')
      } else if (userObj.isOwner) {
        router.replace('/owner/dashboard')
      } else {
        router.replace('/')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth route (Next.js proxy rewrites /api/auth/google to backend)
    window.location.href = '/api/auth/google'
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
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-amber-700 hover:text-amber-800 transition-colors">
              đăng ký tài khoản mới miễn phí
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-900 transition-colors focus:outline-none disabled:bg-stone-400"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-400">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors focus:outline-none"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M23.49 12.27c0-.8-.07-1.56-.19-2.3H12v4.35h6.44a5.5 5.5 0 0 1-2.39 3.6v2.99h3.86c2.26-2.08 3.58-5.14 3.58-8.64Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.99c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.32v3.09A11.97 11.97 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.61H1.32A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.32 5.39L5.27 14.3Z"
              />
              <path
                fill="#4285F4"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.28 2.68 1.32 6.61l3.95 3.09c.95-2.85 3.6-4.95 6.73-4.95Z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}
