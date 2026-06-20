'use client'

import { useEffect, useState } from 'react'
import {
  getOwnerProducts,
  createOwnerProduct,
  updateOwnerProduct,
  deleteOwnerProduct
} from '@/lib/api/owner.service'
import { uploadProductImages } from '@/lib/api/upload.service'
import { useAuthStore } from '@/store/auth.store'
import type { Product } from '@/types/product'
import { Plus, Edit2, Trash2, X, Upload, AlertCircle, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

export default function OwnerProductsPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  
  // Form Fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | string>('')
  const [salePrice, setSalePrice] = useState<number | string>('')
  const [saleStartDate, setSaleStartDate] = useState('')
  const [saleEndDate, setSaleEndDate] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState<number | string>('')
  const [modelUrl, setModelUrl] = useState('')
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  
  // Dynamic categories list
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Fetch product list and filter for this owner
  const fetchProductsList = () => {
    setLoading(true)
    getOwnerProducts()
      .then((data: any) => {
        let list: Product[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            list = data.items
          } else if ('products' in data && Array.isArray(data.products)) {
            list = data.products
          }
        }
        
        // Normalize product ids
        const normalized = list.map((item: any) => ({
          ...item,
          id: item.id || item._id
        }))

        setProducts(normalized)
      })
      .catch((err) => {
        setError('Không thể tải danh sách sản phẩm.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user?.id) {
      fetchProductsList()
    }

    // Fetch categories dynamically
    apiClient<any>('/categories')
      .then((data: any) => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (data && typeof data === 'object' && Array.isArray(data.items)) list = data.items
        setCategoriesList(list)
        if (list.length > 0) {
          setCategory((prev) => prev || list[0].id || list[0]._id)
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
  }, [user])

  // Open modal for add
  const handleAddClick = () => {
    setEditingProduct(null)
    setName('')
    setDescription('')
    setPrice('')
    setSalePrice('')
    setSaleStartDate('')
    setSaleEndDate('')
    setCategory(categoriesList[0]?.id || categoriesList[0]?._id || '')
    setCountInStock('')
    setModelUrl('')
    setImageFiles(null)
    setFormError('')
    setIsOpen(true)
  }

  // Open modal for edit
  const handleEditClick = (product: any) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price)
    setSalePrice(product.salePrice || '')
    setSaleStartDate(product.saleStartDate ? new Date(product.saleStartDate).toISOString().slice(0, 16) : '')
    setSaleEndDate(product.saleEndDate ? new Date(product.saleEndDate).toISOString().slice(0, 16) : '')
    const catId = product.categoryId?.id || product.categoryId?._id || product.categoryId || ''
    setCategory(catId)
    setCountInStock(product.stock ?? product.countInStock ?? 0)
    setModelUrl(product.modelUrl || '')
    setImageFiles(null)
    setFormError('')
    setIsOpen(true)
  }

  // Handle delete
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return
    try {
      await deleteOwnerProduct(id)
      fetchProductsList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa sản phẩm.')
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    const parsedPrice = Number(price)
    const parsedStock = Number(countInStock)

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Đơn giá phải lớn hơn 0.')
      setFormLoading(false)
      return
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError('Số lượng trong kho không được nhỏ hơn 0.')
      setFormLoading(false)
      return
    }

    if (!category) {
      setFormError('Vui lòng chọn danh mục sản phẩm.')
      setFormLoading(false)
      return
    }

    try {
      const completedUploads = imageFiles?.length
        ? await uploadProductImages(Array.from(imageFiles))
        : []

      const payload = {
        name,
        description,
        price: parsedPrice,
        salePrice: salePrice ? Number(salePrice) : undefined,
        saleStartDate: saleStartDate ? new Date(saleStartDate).toISOString() : undefined,
        saleEndDate: saleEndDate ? new Date(saleEndDate).toISOString() : undefined,
        stock: parsedStock,
        categoryId: category,
        modelUrl: modelUrl || undefined,
        ...(completedUploads.length
          ? { imageUploadIds: completedUploads.map((upload) => upload.id) }
          : {})
      }

      if (editingProduct) {
        await updateOwnerProduct(editingProduct.id, payload)
      } else {
        await createOwnerProduct(payload)
      }

      setIsOpen(false)
      fetchProductsList()
    } catch (err: any) {
      setFormError(err.message || 'Lỗi lưu thông tin sản phẩm.')
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
            Quản lý Sản phẩm của Shop
          </h1>
          <p className="text-xs text-stone-500 mt-1">Danh sách các sản phẩm do shop của bạn đăng bán.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors"
        >
          <Plus className="h-4.5 w-4.5" />
          Thêm sản phẩm mới
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Product List Table */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-550 text-sm">Chưa có sản phẩm nào do shop đăng bán.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-150 text-xs font-bold text-stone-550 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">Ảnh</th>
                <th className="py-3.5 px-6">Tên sản phẩm</th>
                <th className="py-3.5 px-6">Danh mục</th>
                <th className="py-3.5 px-6">Đơn giá</th>
                <th className="py-3.5 px-6">Số lượng kho</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => {
                const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'
                const stockQty = (product as any).stock ?? (product as any).countInStock ?? 0
                const isLowStock = stockQty < 5
                
                return (
                  <tr key={product.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-3 px-6 shrink-0">
                      <img src={imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-stone-50 border border-stone-100" />
                    </td>
                    <td className="py-3 px-6 font-bold text-stone-900">
                      <div className="flex items-center gap-1.5">
                        <span>{product.name}</span>
                        {product.modelUrl && (
                          <span className="text-[9px] font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30 px-1 py-0.5 rounded-md flex items-center gap-0.5" title="Hỗ trợ Custom 3D">
                            <Sparkles className="h-2.5 w-2.5" /> 3D
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-stone-555 text-xs font-medium capitalize">
                      {(product as any).categoryId?.name || (product as any).category || 'Chưa phân loại'}
                    </td>
                    <td className="py-3 px-6 font-semibold text-stone-850">
                      {product.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isLowStock ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {stockQty}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-stone-400 hover:text-amber-800 transition-colors"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2 text-stone-400 hover:text-red-650 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-755 border border-red-100">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-550 uppercase">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ly sứ Trắng Đắp Hoa Trụ"
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-555 uppercase">Mô tả sản phẩm</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chất liệu gốm sứ cao cấp tráng men bóng, kiểu dáng thời trang..."
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Đơn giá (VND)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Giá Sale (VND)</label>
                  <input
                    type="number"
                    min="1"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Ngày bắt đầu sale</label>
                  <input
                    type="datetime-local"
                    value={saleStartDate}
                    onChange={(e) => setSaleStartDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Ngày kết thúc sale</label>
                  <input
                    type="datetime-local"
                    value={saleEndDate}
                    onChange={(e) => setSaleEndDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Số lượng trong kho</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Phân loại danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Đường dẫn 3D (.glb)</label>
                  <input
                    type="text"
                    value={modelUrl}
                    onChange={(e) => setModelUrl(e.target.value)}
                    placeholder="/models/classic-cup.glb"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Tải lên file ảnh từ máy</label>
                  <div className="mt-1.5 border-2 border-dashed border-stone-300 rounded-lg p-2.5 text-center hover:border-amber-600 transition-colors cursor-pointer relative bg-stone-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(e.target.files)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-5 w-5 text-stone-400 mx-auto mb-1" />
                    <p className="text-[11px] text-stone-600 font-bold">Kéo thả hoặc click chọn file</p>
                  </div>
              </div>
              {imageFiles && imageFiles.length > 0 && (
                <p className="text-xs text-green-700 font-bold mt-2">
                  Đã chọn {imageFiles.length} file: {Array.from(imageFiles).map(f => f.name).join(', ')}
                </p>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-amber-800 hover:bg-amber-900 transition-colors text-white px-4 py-2 text-xs font-bold disabled:bg-stone-400 shadow-sm"
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
