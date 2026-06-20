'use client'

import { useState, useEffect } from 'react'
import { getShippers, createShipper, updateShipperAvailability, updateShipper, CoverageArea } from '@/lib/api/shipping-units.service'
import { Plus, Check, X, ShieldAlert, Loader2, Edit, Truck, MapPin } from 'lucide-react'

export default function ShippersManagementPage() {
  const [shippers, setShippers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Provinces data
  const [provincesData, setProvincesData] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    vehicleType: 'Xe máy',
    licensePlate: ''
  })
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  const fetchShippers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getShippers()
      setShippers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tài xế')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShippers()
    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then(res => res.json())
      .then(data => setProvincesData(data))
      .catch(err => console.error('Failed to load provinces', err))
  }, [])

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateShipperAvailability(id, !current)
      fetchShippers()
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError('')
    
    try {
      const pName = provincesData.find(p => p.code.toString() === selectedProvince)?.name
      const wName = provincesData.find(p => p.code.toString() === selectedProvince)?.wards?.find((w: any) => w.code.toString() === selectedWard)?.name
      
      const coverageArea = (pName && wName) ? { province: pName, ward: wName } : undefined

      if (!coverageArea) {
        throw new Error('Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã phụ trách')
      }

      if (editingId) {
        // Update
        await updateShipper(editingId, {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate,
          coverageArea: coverageArea,
        })
      } else {
        // Create
        await createShipper({
          ...formData,
          coverageArea: coverageArea
        })
      }
      setIsModalOpen(false)
      fetchShippers()
    } catch (err: any) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setModalLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      vehicleType: 'Xe máy',
      licensePlate: ''
    })
    setSelectedProvince('')
    setSelectedWard('')
    setIsModalOpen(true)
  }

  const openEditModal = (shipper: any) => {
    setEditingId(shipper.userId?._id || shipper.userId?.id || shipper.userId)
    setFormData({
      fullName: shipper.userId?.fullName || '',
      email: shipper.userId?.email || '',
      password: '', // Leave blank on edit
      phone: shipper.userId?.phone || '',
      address: shipper.userId?.address || '',
      vehicleType: shipper.vehicleType || 'Xe máy',
      licensePlate: shipper.licensePlate || ''
    })
    
    // Attempt to pre-fill select if coverageArea is available
    if (shipper.coverageArea && provincesData.length > 0) {
      const p = provincesData.find(p => p.name === shipper.coverageArea.province)
      if (p) {
        setSelectedProvince(p.code.toString())
        const w = p.wards?.find((w: any) => w.name === shipper.coverageArea.ward)
        if (w) setSelectedWard(w.code.toString())
      }
    } else {
      setSelectedProvince('')
      setSelectedWard('')
    }
    
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Tài xế</h1>
          <p className="text-sm text-stone-500 mt-1">Danh sách tài xế trực thuộc đơn vị của bạn.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-amber-900 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Tài xế mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-bold text-stone-900">Tài xế</th>
                <th className="px-6 py-4 font-bold text-stone-900">Liên hệ</th>
                <th className="px-6 py-4 font-bold text-stone-900">Phương tiện</th>
                <th className="px-6 py-4 font-bold text-stone-900">Phụ trách</th>
                <th className="px-6 py-4 font-bold text-stone-900">Sẵn sàng giao</th>
                <th className="px-6 py-4 font-bold text-stone-900 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shippers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    Chưa có tài xế nào. Bấm nút Thêm tài xế để bắt đầu.
                  </td>
                </tr>
              ) : (
                shippers.map((shipper: any) => (
                  <tr key={shipper._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{shipper.userId?.fullName}</div>
                      <div className="text-xs text-stone-500">{shipper.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{shipper.userId?.phone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-stone-700">
                        <Truck className="h-4 w-4 text-stone-400" />
                        {shipper.vehicleType}
                      </div>
                      <div className="text-xs font-mono font-medium text-stone-500 mt-0.5">
                        {shipper.licensePlate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {shipper.coverageArea ? (
                        <div className="flex items-center gap-1.5 text-sm text-stone-700">
                          <MapPin className="h-4 w-4 text-stone-400" />
                          <span className="font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">{shipper.coverageArea.ward}, {shipper.coverageArea.province}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-stone-400">Chưa cấu hình</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(shipper.userId?._id || shipper.userId?.id, shipper.isAvailable)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          shipper.isAvailable ? 'bg-green-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            shipper.isAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(shipper)}
                        className="p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-lg font-black text-stone-900">
                {editingId ? 'Cập nhật Thông tin Tài xế' : 'Tạo Tài xế Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {modalError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}
              
              <form id="shipper-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Họ và tên *</label>
                    <input
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email * {editingId && '(Không đổi)'}</label>
                    <input
                      type="email"
                      required={!editingId}
                      disabled={!!editingId}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mật khẩu * {editingId && '(Bỏ trống)'}</label>
                    <input
                      type="password"
                      required={!editingId}
                      disabled={!!editingId}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Số điện thoại *</label>
                    <input
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Loại phương tiện *</label>
                    <select
                      required
                      value={formData.vehicleType}
                      onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Xe máy">Xe máy</option>
                      <option value="Xe tải nhỏ">Xe tải nhỏ</option>
                      <option value="Xe bán tải">Xe bán tải</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Biển số xe *</label>
                    <input
                      required
                      value={formData.licensePlate}
                      onChange={e => setFormData({...formData, licensePlate: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                      placeholder="VD: 59A1-12345"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Khu vực phụ trách *</label>
                    <div className="flex gap-2">
                      <select
                        required
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value)
                          setSelectedWard('')
                        }}
                        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provincesData.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                      
                      <select
                        required
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedProvince}
                        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-stone-50"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {selectedProvince && provincesData.find(p => p.code.toString() === selectedProvince)?.wards?.map((w: any) => (
                          <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Địa chỉ thường trú</label>
                    <input
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="border-t border-stone-100 px-6 py-4 flex gap-3 justify-end shrink-0 bg-stone-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="shipper-form"
                disabled={modalLoading || !selectedProvince || !selectedWard}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 shadow-sm disabled:opacity-50 transition-colors"
              >
                {modalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
