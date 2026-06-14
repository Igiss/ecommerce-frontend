'use client'

import { useEffect, useState } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category
} from '@/lib/api/categories.service'
import { useAuthStore } from '@/store/auth.store'
import { Plus, Edit2, Trash2, X, AlertCircle, FolderOpen, RefreshCw } from 'lucide-react'

export default function AdminCategoriesPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchCategoriesList = () => {
    setLoading(true)
    setError('')
    getCategories()
      .then((data: any) => {
        let list: Category[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            list = data.items
          } else if ('categories' in data && Array.isArray(data.categories)) {
            list = data.categories
          }
        }
        
        // Normalize IDs
        const normalized = list.map((item: any) => ({
          ...item,
          id: item.id || item._id
        }))

        setCategories(normalized)
      })
      .catch((err) => {
        setError('Không thể tải danh sách danh mục sản phẩm.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user?.id) {
      fetchCategoriesList()
    }
  }, [user])

  // Open modal for add
  const handleAddClick = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setStatus('active')
    setFormError('')
    setIsOpen(true)
  }

  // Open modal for edit
  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug || '')
    setDescription(category.description || '')
    setStatus(category.status || 'active')
    setFormError('')
    setIsOpen(true)
  }

  // Handle delete/disable
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa danh mục này không? (Trạng thái chuyển về inactive)')) return
    try {
      await deleteCategory(id)
      fetchCategoriesList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi vô hiệu hóa danh mục.')
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    if (!name.trim()) {
      setFormError('Tên danh mục là bắt buộc.')
      setFormLoading(false)
      return
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        status
      }

      if (editingCategory) {
        const catId = editingCategory.id || editingCategory._id || ''
        await updateCategory(catId, payload)
      } else {
        await createCategory(payload)
      }

      setIsOpen(false)
      fetchCategoriesList()
    } catch (err: any) {
      setFormError(err.message || 'Lỗi lưu thông tin danh mục.')
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
            <FolderOpen className="h-6 w-6 text-amber-800" />
            Quản lý Danh mục Sản phẩm (Admin)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Danh sách các phân loại danh mục sản phẩm dùng chung của hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCategoriesList}
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
            Thêm danh mục mới
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150 animate-in fade-in duration-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-655" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories List Table */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white shadow-xs">
          <p className="text-stone-550 text-sm">Chưa có danh mục sản phẩm nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs animate-in fade-in duration-200">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-150 text-xs font-bold text-stone-555 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">Tên danh mục</th>
                <th className="py-3.5 px-6">Đường dẫn rút gọn (Slug)</th>
                <th className="py-3.5 px-6">Mô tả</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((cat) => {
                const catId = cat.id || cat._id || ''
                const isActive = cat.status === 'active'
                return (
                  <tr key={catId} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-4 px-6 font-bold text-stone-900">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-stone-500">
                      {cat.slug}
                    </td>
                    <td className="py-4 px-6 text-stone-600 text-xs max-w-xs truncate" title={cat.description}>
                      {cat.description || <span className="text-stone-400 italic">Không có mô tả</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isActive 
                          ? 'bg-green-50 text-green-700 border-green-150' 
                          : 'bg-red-50 text-red-705 border-red-150'
                      }`}>
                        {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-2 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {isActive && (
                          <button
                            onClick={() => handleDeleteClick(catId)}
                            className="p-2 text-stone-400 hover:text-red-650 transition-colors cursor-pointer"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-755 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-550 uppercase">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Ly thủy tinh"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-550 uppercase">Đường dẫn rút gọn (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Ví dụ: ly-thuy-tinh (tự tạo nếu trống)"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Mô tả danh mục</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả danh mục sản phẩm này..."
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Trạng thái danh mục</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                >
                  <option value="active">Hoạt động (Active)</option>
                  <option value="inactive">Vô hiệu hóa (Inactive)</option>
                </select>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-4 py-2 text-xs font-bold disabled:bg-stone-400 shadow-sm cursor-pointer"
                >
                  {formLoading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
