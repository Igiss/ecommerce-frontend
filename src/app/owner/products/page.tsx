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
import { Plus, Edit2, Trash2, X, Upload, AlertCircle, Sparkles, Search, Tag } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { PriceScheduleModal } from '@/components/owner/PriceScheduleModal'


export default function OwnerProductsPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  // Price Schedule Modal State
  const [priceScheduleProduct, setPriceScheduleProduct] = useState<Product | null>(null)
  const [isPriceScheduleOpen, setIsPriceScheduleOpen] = useState(false)

  const handleOpenPriceScheduleModal = (product: Product) => {
    setPriceScheduleProduct(product)
    setIsPriceScheduleOpen(true)
  }


  // Search, filter & pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const itemsPerPage = 10

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setPageInput('1')
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])
  
  // Form Fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | string>('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState<number | string>('')

  const [modelUrl, setModelUrl] = useState('')
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  // Dynamic categories list
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) {
      setImagePreviews([])
      return
    }

    const objectUrls = Array.from(imageFiles).map(file => URL.createObjectURL(file))
    setImagePreviews(objectUrls)

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imageFiles])
  const [formLoading, setFormLoading] = useState(false)

  // Helper to format number string to thousands separated by dots
  const formatPriceString = (val: string | number): string => {
    if (val === undefined || val === null || val === '') return ''
    const cleaned = String(val).replace(/\D/g, '')
    if (!cleaned) return ''
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Filter products by search query and category
  const productsList = Array.isArray(products) ? products : []
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())

    const categoryName = (p as any).categoryId?.name || (p as any).category || ''
    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      categoryName.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

      {/* Filters Row */}
      {!loading && !error && products.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs mb-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mô tả sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter Select */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
              <span>Lọc danh mục:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-700 cursor-pointer"
              >
                <option value="Tất cả">Tất cả danh mục</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-stone-550 font-bold md:ml-2">
              Hiển thị {filteredProducts.length} trên {products.length} sản phẩm
            </div>
          </div>
        </div>
      )}

      {/* Product List Table */}
      {loading ? (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-stone-200 rounded-lg w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-stone-100 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-550 text-sm">Chưa có sản phẩm nào do shop đăng bán.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-550 text-sm">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('Tất cả')
            }}
            className="mt-4 px-4 py-2 bg-amber-800 hover:bg-amber-900 transition-colors text-white rounded-xl text-xs font-bold shadow-sm active:scale-98 cursor-pointer focus:outline-none"
          >
            Xóa bộ lọc
          </button>
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
              {paginatedProducts.map((product) => {
                const imageUrl = (product as any).images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'
                const stockQty = (product as any).stock ?? (product as any).countInStock ?? 0
                const isLowStock = stockQty < 5
                
                return (
                  <tr key={product.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="py-3 px-6 shrink-0">
                      <img src={imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-contain bg-stone-50 border border-stone-100" />
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
                          onClick={() => handleOpenPriceScheduleModal(product)}
                          className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                          title="Lịch trình giá & Sale"
                        >
                          <Tag className="h-4 w-4" />
                        </button>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 p-4 border-t border-stone-100 bg-stone-50/50">
              {/* First Page Button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                title="Trang đầu"
              >
                Đầu
              </button>

              {/* Previous Page Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
              >
                Trước
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                    currentPage === page
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
              >
                Sau
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-stone-700 transition-all cursor-pointer focus:outline-none"
                title="Trang cuối"
              >
                Cuối
              </button>

              {/* Jump to Page Input */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-4">
                <span className="text-xs text-stone-500">Đến trang:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(pageInput, 10)
                      if (!isNaN(val) && val >= 1 && val <= totalPages) {
                        setCurrentPage(val)
                      }
                    }
                  }}
                  className="w-12 h-8 text-center text-xs font-bold border border-stone-200 rounded-xl focus:outline-none focus:border-amber-700"
                />
              </div>
            </div>
          )}
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
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Đơn giá gốc (VND)</label>
                  <input
                    type="text"
                    required
                    value={formatPriceString(price)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setPrice(raw)
                    }}
                    placeholder="Nhập đơn giá gốc..."
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
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
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-green-700 font-bold">
                    Đã chọn {imageFiles.length} file: {Array.from(imageFiles).map(f => f.name).join(', ')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
                        <img
                          src={url}
                          alt={`preview-${idx}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If editing and has existing images, and no new files selected */}
              {!imageFiles && editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-stone-500 font-bold">Ảnh hiện tại của sản phẩm:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {editingProduct.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
                        <img
                          src={imgUrl}
                          alt={`existing-${idx}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
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

      {/* Price Schedule Modal */}
      <PriceScheduleModal
        product={priceScheduleProduct}
        isOpen={isPriceScheduleOpen}
        onClose={() => setIsPriceScheduleOpen(false)}
        onSuccess={() => {
          fetchProductsList()
        }}
      />
    </div>
  )
}


