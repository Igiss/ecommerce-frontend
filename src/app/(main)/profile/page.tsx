'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { updateUserProfile, changePassword } from '@/lib/api/auth.service'
import { requestUpgradeOwner } from '@/lib/api/auth.service'
import { uploadImage } from '@/lib/api/upload.service'
import { User, Lock, Mail, AlertCircle, CheckCircle, Store } from 'lucide-react'

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

  // Crop Modal States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1.0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Request Owner States
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [requestOwnerLoading, setRequestOwnerLoading] = useState(false)
  const [requestOwnerSuccess, setRequestOwnerSuccess] = useState('')
  const [requestOwnerError, setRequestOwnerError] = useState('')

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setTempImageSrc(URL.createObjectURL(file))
    setZoom(1.0)
    setOffsetX(0)
    setOffsetY(0)
    setIsCropModalOpen(true)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffsetX(e.clientX - dragStart.x)
    setOffsetY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setOffsetX(e.touches[0].clientX - dragStart.x)
    setOffsetY(e.touches[0].clientY - dragStart.y)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleCancelCrop = () => {
    setIsCropModalOpen(false)
    if (tempImageSrc) {
      URL.revokeObjectURL(tempImageSrc)
    }
    setTempImageSrc('')
    setSelectedFile(null)
  }

  const handleCropSave = async () => {
    if (!tempImageSrc || !selectedFile) return

    setUploadingAvatar(true)
    setIsCropModalOpen(false)
    setProfileError('')
    setProfileSuccess('')

    try {
      const img = new Image()
      img.src = tempImageSrc
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      let W_base = 200
      let H_base = 200

      if (naturalWidth > naturalHeight) {
        H_base = 200
        W_base = 200 * (naturalWidth / naturalHeight)
      } else {
        W_base = 200
        H_base = 200 * (naturalHeight / naturalWidth)
      }

      const W_zoom = W_base * zoom
      const H_zoom = H_base * zoom

      const x = (200 - W_zoom) / 2 + offsetX
      const y = (200 - H_zoom) / 2 + offsetY

      const canvasWidth = W_zoom * 2
      const canvasHeight = H_zoom * 2
      const canvasX = x * 2
      const canvasY = y * 2

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 400)
      ctx.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight)

      const croppedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
      })

      if (!croppedBlob) throw new Error('Failed to crop image')

      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg',
      })

      const upload = await uploadImage(croppedFile, 'avatar')
      setAvatarUploadId(upload.id)
      setAvatarUrl(upload.url)
      setProfileSuccess('Cắt và tải ảnh đại diện lên thành công! Nhấn "Lưu thay đổi" để cập nhật.')
    } catch (err: any) {
      setProfileError(err.message || 'Lỗi tải ảnh đại diện lên.')
    } finally {
      setUploadingAvatar(false)
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc)
      }
      setTempImageSrc('')
      setSelectedFile(null)
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

  const handleRequestOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestOwnerError('')
    setRequestOwnerSuccess('')
    setRequestOwnerLoading(true)

    try {
      await requestUpgradeOwner({ storeName, storePhone, storeAddress })
      setRequestOwnerSuccess('Yêu cầu đăng ký Kênh Người Bán đã được gửi thành công. Vui lòng chờ Admin duyệt.')
      // Update local user state
      if (user) {
        setUser({ ...user, isRequestingOwner: true })
      }
    } catch (err: any) {
      setRequestOwnerError(err.message || 'Lỗi khi gửi yêu cầu đăng ký.')
    } finally {
      setRequestOwnerLoading(false)
    }
  }

  if (!mounted || !user) return null

  return (
    <div className="mx-auto max-w-2xl bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
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

        {user.role === 'user' && !user.isRequestingOwner && (
          <div className="mt-12 pt-8 border-t border-stone-200">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-amber-700" />
              Đăng ký làm Người bán (Mở Shop)
            </h2>
            <p className="text-xs text-stone-550 mb-6">Điền thông tin cửa hàng của bạn để bắt đầu đăng bán sản phẩm.</p>
            
            {requestOwnerError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-150 mb-4">
                <AlertCircle className="h-4.5 w-4.5 text-red-650 shrink-0" />
                <span>{requestOwnerError}</span>
              </div>
            )}

            {requestOwnerSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3.5 text-xs text-green-700 border border-green-150 mb-4">
                <CheckCircle className="h-4.5 w-4.5 text-green-650 shrink-0" />
                <span>{requestOwnerSuccess}</span>
              </div>
            )}

            {!requestOwnerSuccess && (
              <form onSubmit={handleRequestOwner} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Tên Cửa Hàng</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ví dụ: Cốc Xinh Store"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Số điện thoại Cửa Hàng</label>
                  <input
                    type="text"
                    required
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Hotline hỗ trợ khách hàng"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Địa chỉ Cửa Hàng</label>
                  <input
                    type="text"
                    required
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Địa chỉ giao dịch chính"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={requestOwnerLoading}
                  className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 transition-colors py-2.5 text-xs font-bold text-white shadow-sm disabled:bg-stone-300 mt-4"
                >
                  {requestOwnerLoading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Đăng Ký Người Bán'}
                </button>
              </form>
            )}
          </div>
        )}

        {user.role === 'user' && user.isRequestingOwner && (
          <div className="mt-12 pt-8 border-t border-stone-200">
            <div className="rounded-xl bg-amber-50/70 border border-amber-250 p-5">
              <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                <Store className="h-4.5 w-4.5" />
                Yêu cầu Mở Shop đang chờ duyệt
              </h2>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Bạn đã gửi yêu cầu nâng cấp lên Kênh Người Bán. Admin đang xem xét yêu cầu của bạn. Quá trình này thường mất khoảng 24h làm việc. Cảm ơn bạn đã kiên nhẫn!
              </p>
            </div>
          </div>
        )}

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xl max-w-sm w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-sm font-bold text-stone-900">Chỉnh sửa ảnh đại diện</h3>
              <p className="text-[10px] text-stone-500 mt-1">Kéo để di chuyển, sử dụng thanh trượt để điều chỉnh tỉ lệ phù hợp.</p>
            </div>

            <div className="relative h-[200px] w-[200px] rounded-full overflow-hidden border-2 border-amber-600 bg-stone-100 flex items-center justify-center select-none shadow-md">
              <img
                src={tempImageSrc}
                alt="Crop preview"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                  cursor: 'move',
                  maxWidth: 'none',
                  userSelect: 'none',
                }}
                className="select-none pointer-events-auto origin-center transition-transform duration-75"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth > img.naturalHeight) {
                    img.style.height = '200px';
                    img.style.width = 'auto';
                  } else {
                    img.style.width = '200px';
                    img.style.height = 'auto';
                  }
                }}
              />
            </div>

            <div className="space-y-1.5 w-full max-w-xs">
              <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>Thu nhỏ</span>
                <span>Phóng to</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="flex-1 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors py-2 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Cắt & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
