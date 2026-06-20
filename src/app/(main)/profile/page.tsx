'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { updateUserProfile, changePassword } from '@/lib/api/auth.service'
import { uploadImage } from '@/lib/api/upload.service'
import { User, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function ProfileInfoPage() {
  const { user, setUser } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  // Profile Form States
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarUploadId, setAvatarUploadId] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return

    setName(user.fullName || user.name || '')
    setPhone(user.phone || '')
    setAvatarUrl(user.avatar || '')
    setAvatarUploadId(null)
  }, [mounted, user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const upload = await uploadImage(file, 'avatar')
      setAvatarUploadId(upload.id)
      setAvatarUrl(upload.url)
      setProfileSuccess('Tải ảnh đại diện lên thành công! Nhấn "Lưu thay đổi" để cập nhật.')
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi tải ảnh đại diện lên.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (password) {
      if (!oldPassword) {
        setProfileError('Vui lòng nhập mật khẩu cũ để đổi mật khẩu.')
        return
      }
      if (password !== confirmPassword) {
        setProfileError('Mật khẩu mới nhập lại không khớp.')
        return
      }
    }

    setLoading(true)
    try {
      const updatedUser = await updateUserProfile({
        fullName: name,
        phone: phone || undefined,
        ...(avatarUploadId ? { avatarUploadId } : {})
      })

      if (password) {
        await changePassword({
          oldPassword,
          newPassword: password
        })
      }

      setUser(updatedUser)
      setAvatarUploadId(null)
      setProfileSuccess('Cập nhật thông tin cá nhân thành công!')
      setOldPassword('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi cập nhật hồ sơ.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !user) return null

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
      <div className="max-w-2xl space-y-6">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <User className="h-5 w-5 text-amber-700" />
          Hồ sơ cá nhân
        </h2>

        {profileError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-150">
            <AlertCircle className="h-4.5 w-4.5 text-red-650" />
            <span>{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3.5 text-xs text-green-700 border border-green-150">
            <CheckCircle className="h-4.5 w-4.5 text-green-650" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-6 pb-6 border-b border-stone-100">
          <div className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-600/30 bg-stone-50 flex items-center justify-center cursor-pointer shadow-inner shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-amber-850">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đổi ảnh</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">{name || 'Thành viên'}</h3>
            <p className="text-xs text-stone-500 mt-1">{user.email}</p>
            <span className="mt-2.5 inline-block text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Vai trò: {user.role === 'admin' ? 'Quản trị viên' : user.role === 'owner' ? 'Chủ cửa hàng' : 'Thành viên'}
            </span>
            {uploadingAvatar && (
              <p className="text-[10px] text-amber-850 mt-1.5 animate-pulse font-medium">Đang tải ảnh lên...</p>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-stone-550 uppercase">Địa chỉ Email</label>
            <div className="mt-1.5 relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                disabled
                value={user.email}
                className="block w-full rounded-lg border border-stone-200 bg-stone-100/50 pl-10 pr-3 py-2 text-sm text-stone-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-555 uppercase">Họ và tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-555 uppercase">Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-850 uppercase mb-4">Thay đổi mật khẩu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Mật khẩu cũ (Để đổi mật khẩu)</label>
                <div className="mt-1.5 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Mật khẩu mới</label>
                <div className="mt-1.5 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {password && (
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Xác nhận mật khẩu mới</label>
                  <div className="mt-1.5 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-2.5 text-xs font-bold text-white shadow-sm disabled:bg-stone-300 cursor-pointer mt-4"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}
