'use client'

import { useEffect, useState } from 'react'
import {
  getAllAdminBanners,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
  type Banner
} from '@/lib/api/banners.service'
import { uploadImage } from '@/lib/api/upload.service'
import { useAuthStore } from '@/store/auth.store'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  Layers,
  Sparkles,
  Type
} from 'lucide-react'

export default function AdminBannersPage() {
  const { user } = useAuthStore()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  // Form Fields (2 Lớp ảnh + Chi tiết)
  const [imageUrl, setImageUrl] = useState('')
  const [bgImageUrl, setBgImageUrl] = useState('')
  const [badge, setBadge] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tagline1, setTagline1] = useState('')
  const [tagline2, setTagline2] = useState('')
  const [position, setPosition] = useState(0)
  const [isActive, setIsActive] = useState(true)

  const [uploadingFg, setUploadingFg] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchBannersList = () => {
    setLoading(true)
    setError('')
    getAllAdminBanners()
      .then((data: any) => {
        let list: Banner[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
          list = data.items
        }

        const normalized = list.map((item: any) => ({
          ...item,
          _id: item._id || item.id
        }))

        setBanners(normalized)
      })
      .catch((err) => {
        setError('Không thể tải danh sách banner trang chủ.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user?.id) {
      fetchBannersList()
    }
  }, [user])

  // Upload Handler cho 2 Lớp Ảnh
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'fg' | 'bg') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (target === 'fg') setUploadingFg(true)
    else setUploadingBg(true)
    setFormError('')

    try {
      const res = await uploadImage(file, 'product_image')
      if (res?.url) {
        if (target === 'fg') setImageUrl(res.url)
        else setBgImageUrl(res.url)
      }
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi tải ảnh lên server.')
    } finally {
      if (target === 'fg') setUploadingFg(false)
      else setUploadingBg(false)
    }
  }

  // Open modal for add
  const handleAddClick = () => {
    setEditingBanner(null)
    setImageUrl('')
    setBgImageUrl('')
    setBadge('Khuyến mãi đặc biệt')
    setTitle('')
    setDescription('')
    setLinkUrl('')
    setTagline1('')
    setTagline2('')
    setPosition(banners.length)
    setIsActive(true)
    setFormError('')
    setIsOpen(true)
  }

  // Open modal for edit
  const handleEditClick = (banner: Banner) => {
    setEditingBanner(banner)
    setImageUrl(banner.imageUrl || '')
    setBgImageUrl(banner.bgImageUrl || '')
    setBadge(banner.badge || '')
    setTitle(banner.title || '')
    setDescription(banner.description || '')
    setLinkUrl(banner.linkUrl || '')
    setTagline1(banner.tagline1 || '')
    setTagline2(banner.tagline2 || '')
    setPosition(banner.position || 0)
    setIsActive(banner.isActive ?? true)
    setFormError('')
    setIsOpen(true)
  }

  // Toggle status
  const handleToggleActive = async (bannerId: string) => {
    try {
      await toggleBannerActive(bannerId)
      fetchBannersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thay đổi trạng thái banner.')
    }
  }

  // Delete banner
  const handleDeleteClick = async (bannerId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh banner này không?')) return
    try {
      await deleteBanner(bannerId)
      fetchBannersList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa banner.')
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    if (!imageUrl.trim() && !bgImageUrl.trim()) {
      setFormError('Vui lòng chọn ít nhất 1 ảnh (Lớp nền hoặc Lớp nổi 3D).')
      setFormLoading(false)
      return
    }

    try {
      const payload: Partial<Banner> = {
        imageUrl: imageUrl.trim() || bgImageUrl.trim(),
        bgImageUrl: bgImageUrl.trim() || imageUrl.trim(),
        badge: badge.trim(),
        title: title.trim(),
        description: description.trim(),
        linkUrl: linkUrl.trim(),
        tagline1: tagline1.trim(),
        tagline2: tagline2.trim(),
        position: Number(position) || 0,
        isActive
      }

      if (editingBanner) {
        const id = editingBanner._id || editingBanner.id || ''
        await updateBanner(id, payload)
      } else {
        await createBanner(payload)
      }

      setIsOpen(false)
      fetchBannersList()
    } catch (err: any) {
      setFormError(err.message || 'Lỗi lưu banner.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-800" />
            Quản lý Banner Slider (2 Lớp Ảnh & Chi tiết)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Chỉnh sửa 2 lớp ảnh (Nền full & Ảnh nổi 3D), tiêu đề, mô tả và nút bấm cho từng slide banner.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBannersList}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors shadow-xs cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Thêm Slide Banner mới
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150 animate-in fade-in duration-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-655" />
          <span>{error}</span>
        </div>
      )}

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="flex py-16 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white shadow-xs">
          <ImageIcon className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-700 font-bold text-sm">Chưa có banner nào được tạo.</p>
          <p className="text-stone-400 text-xs mt-1">Nhấn "Thêm Slide Banner mới" để tải lên 2 lớp ảnh banner đầu tiên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => {
            const bannerId = banner._id || banner.id || ''
            const bgImg = banner.bgImageUrl || banner.imageUrl
            const fgImg = banner.imageUrl || banner.bgImageUrl
            return (
              <div
                key={bannerId}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md flex flex-col ${
                  banner.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                {/* 2-Layer Preview Section */}
                <div className="relative aspect-[21/9] bg-stone-950 overflow-hidden flex items-center justify-center p-4">
                  {/* Background Layer Preview */}
                  <img
                    src={bgImg}
                    alt="Background layer"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[1px] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-stone-950/40" />

                  {/* Foreground 3D Card Preview */}
                  <div className="relative z-10 w-28 h-20 rounded-xl overflow-hidden shadow-xl border border-white/30 bg-white/20 backdrop-blur-xs flex-shrink-0">
                    <img src={fgImg} alt="Foreground layer" className="w-full h-full object-cover" />
                  </div>

                  {/* Order & Status Badges */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                      <Layers className="h-3 w-3 text-amber-400" /> Thứ tự #{banner.position ?? 0}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase backdrop-blur-md flex items-center gap-1.5 ${
                        banner.isActive ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                      }`}
                    >
                      {banner.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {banner.isActive ? 'Đang bật' : 'Đang ẩn'}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {banner.badge && (
                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {banner.badge}
                      </span>
                    )}
                    <h3 className="font-bold text-stone-900 text-base leading-snug">
                      {banner.title || <span className="text-stone-400 italic font-normal">Chưa nhập tiêu đề</span>}
                    </h3>
                    {banner.description && (
                      <p className="text-xs text-stone-500 line-clamp-2">{banner.description}</p>
                    )}
                    {banner.linkUrl && (
                      <p className="text-xs text-stone-400 flex items-center gap-1 pt-1 truncate">
                        <LinkIcon className="h-3 w-3 text-amber-700 shrink-0" />
                        <span className="truncate">{banner.linkUrl}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                    <button
                      onClick={() => handleToggleActive(bannerId)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                        banner.isActive
                          ? 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                          : 'border-stone-300 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {banner.isActive ? 'Ẩn Banner' : 'Hiện Banner'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(banner)}
                        className="p-2 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                        title="Sửa banner"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bannerId)}
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                        title="Xóa banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Form Dialog (Chỉnh sửa 2 lớp) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-800" />
                {editingBanner ? 'Cập nhật Banner 2 Lớp' : 'Thêm Banner 2 Lớp mới'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-755 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SECTION: 2 LAYER IMAGES */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-amber-800" /> Cấu hình 2 Lớp Ảnh Banner
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Layer 1: Background Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      1. Ảnh Lớp Nền Full-screen (Background)
                    </label>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-stone-300 bg-white hover:bg-stone-100 p-2.5 text-xs font-bold text-stone-700 transition-colors">
                      <Upload className="h-4 w-4 text-amber-800" />
                      <span>{uploadingBg ? 'Đang tải lên...' : 'Tải file ảnh nền'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e, 'bg')} disabled={uploadingBg} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh nền..."
                      className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                    {bgImageUrl && (
                      <div className="h-20 rounded-xl overflow-hidden border border-stone-200 relative bg-stone-900">
                        <img src={bgImageUrl} alt="Background preview" className="w-full h-full object-cover opacity-80" />
                      </div>
                    )}
                  </div>

                  {/* Layer 2: Foreground 3D Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      2. Ảnh Lớp Nổi 3D (Foreground)
                    </label>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-stone-300 bg-white hover:bg-stone-100 p-2.5 text-xs font-bold text-stone-700 transition-colors">
                      <Upload className="h-4 w-4 text-amber-800" />
                      <span>{uploadingFg ? 'Đang tải lên...' : 'Tải file ảnh 3D'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e, 'fg')} disabled={uploadingFg} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh 3D..."
                      className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                    {imageUrl && (
                      <div className="h-20 rounded-xl overflow-hidden border border-stone-200 relative bg-stone-900">
                        <img src={imageUrl} alt="Foreground preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: TEXT DETAILS */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Nhãn Huy hiệu (Badge)</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Ví dụ: Bán chạy nhất, Khuyến mãi..."
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Link liên kết khi click</label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Ví dụ: /products/ly-giu-nhiet"
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Tiêu đề Banner chính</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Giữ trọn hương vị, đậm đà phong cách"
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-bold focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả nội dung chương trình hoặc sản phẩm..."
                    className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Dòng cam kết 1</label>
                    <input
                      type="text"
                      value={tagline1}
                      onChange={(e) => setTagline1(e.target.value)}
                      placeholder="Ví dụ: ✔ Giữ nóng 12h & lạnh 24h"
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Dòng cam kết 2</label>
                    <input
                      type="text"
                      value={tagline2}
                      onChange={(e) => setTagline2(e.target.value)}
                      placeholder="Ví dụ: ✔ In ấn theo yêu cầu"
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      min={0}
                      value={position}
                      onChange={(e) => setPosition(Number(e.target.value))}
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Trạng thái</label>
                    <select
                      value={isActive ? 'true' : 'false'}
                      onChange={(e) => setIsActive(e.target.value === 'true')}
                      className="block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    >
                      <option value="true">Bật (Active)</option>
                      <option value="false">Ẩn (Inactive)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingFg || uploadingBg}
                  className="rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors text-white px-5 py-2.5 text-xs font-bold disabled:bg-stone-400 shadow-sm cursor-pointer"
                >
                  {formLoading ? 'Đang lưu...' : 'Lưu Slide Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
