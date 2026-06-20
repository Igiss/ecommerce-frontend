'use client'

import { useEffect, useState } from 'react'
import { getAllShippingUnits, updateCoverage, ShippingUnitResponse, CoverageArea } from '@/lib/api/shipping-units.service'
import { Truck, MapPin, Search, Edit2, X, Loader2, Save, Plus, Trash2 } from 'lucide-react'

export default function AdminShippingUnitsPage() {
  const [units, setUnits] = useState<ShippingUnitResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Provinces data
  const [provincesData, setProvincesData] = useState<any[]>([])

  // Edit coverage state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [coverageInput, setCoverageInput] = useState<CoverageArea[]>([])
  const [saveLoading, setSaveLoading] = useState(false)

  // Selection state
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  const fetchUnits = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllShippingUnits()
      setUnits(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn vị vận chuyển.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then(res => res.json())
      .then(data => setProvincesData(data))
      .catch(err => console.error('Failed to load provinces', err))
  }, [])

  const startEditing = (unit: ShippingUnitResponse) => {
    setEditingId(unit.userId?._id || unit.userId?.id || unit._id)
    setCoverageInput(unit.coverageAreas || [])
    setSelectedProvince('')
    setSelectedWard('')
  }

  const handleAddArea = () => {
    if (!selectedProvince || !selectedWard) return
    const pName = provincesData.find(p => p.code.toString() === selectedProvince)?.name
    const wName = provincesData.find(p => p.code.toString() === selectedProvince)?.wards?.find((w: any) => w.code.toString() === selectedWard)?.name

    if (pName && wName) {
      // Check if already exists
      if (!coverageInput.some(a => a.province === pName && a.ward === wName)) {
        setCoverageInput(prev => [...prev, { province: pName, ward: wName }])
      }
      setSelectedWard('')
    }
  }

  const handleRemoveArea = (idx: number) => {
    setCoverageInput(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSaveCoverage = async (userId: string) => {
    if (!userId) return
    setSaveLoading(true)
    try {
      await updateCoverage(userId, { coverageAreas: coverageInput })
      
      setUnits(prev => prev.map(u => 
        (u.userId?._id === userId || u.userId?.id === userId || u._id === userId) 
          ? { ...u, coverageAreas: coverageInput } 
          : u
      ))
      setEditingId(null)
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu khu vực phủ sóng.')
    } finally {
      setSaveLoading(false)
    }
  }

  const filteredUnits = units.filter(u => {
    const term = searchTerm.toLowerCase()
    return (
      u.companyName?.toLowerCase().includes(term) || 
      u.userId?.fullName?.toLowerCase().includes(term) ||
      u.coverageAreas?.some(a => a.province.toLowerCase().includes(term) || a.ward.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-amber-700" />
            Đơn vị vận chuyển
          </h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý các đơn vị vận chuyển và khu vực phủ sóng.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị vận chuyển..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 flex justify-center text-stone-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
            Không tìm thấy đơn vị vận chuyển nào.
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const uid = unit.userId?._id || unit.userId?.id || unit._id
            const isEditing = editingId === uid
            
            return (
              <div key={uid} className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 border-r border-stone-100 pr-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-lg">{unit.companyName || unit.userId?.fullName || 'Chưa có tên công ty'}</h3>
                      <p className="text-xs text-stone-500">{unit.userId?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-stone-600">
                    <p><span className="font-semibold text-stone-800">SĐT:</span> {unit.contactPhone || unit.userId?.phone || 'Chưa cập nhật'}</p>
                    <p><span className="font-semibold text-stone-800">Địa chỉ:</span> {unit.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="md:w-2/3 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-stone-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      Khu vực phủ sóng
                    </h4>
                    {!isEditing ? (
                      <button
                        onClick={() => startEditing(unit)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors text-xs font-bold border border-stone-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Cập nhật
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCoverage(uid)}
                          disabled={saveLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition-colors text-xs font-bold disabled:opacity-70"
                        >
                          {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={saveLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors text-xs font-bold"
                        >
                          <X className="h-3.5 w-3.5" />
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2 mb-2 p-3 bg-stone-50 rounded-xl border border-stone-200 min-h-[60px]">
                        {coverageInput.length === 0 ? (
                          <span className="text-sm text-stone-500 italic mt-1">Chưa có khu vực nào. Hãy thêm khu vực bên dưới.</span>
                        ) : (
                          coverageInput.map((area, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-stone-800 border border-stone-200 text-xs font-bold shadow-sm">
                              <MapPin className="h-3 w-3 text-amber-600" />
                              {area.ward}, {area.province}
                              <button onClick={() => handleRemoveArea(idx)} className="text-stone-400 hover:text-red-500 transition-colors ml-1">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          className="flex-1 p-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value)
                            setSelectedWard('')
                          }}
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provincesData.map((p) => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                          ))}
                        </select>

                        <select
                          className="flex-1 p-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-stone-50 disabled:text-stone-400"
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          disabled={!selectedProvince}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {selectedProvince && provincesData.find(p => p.code.toString() === selectedProvince)?.wards?.map((w: any) => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={handleAddArea}
                          disabled={!selectedProvince || !selectedWard}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors text-sm font-bold disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {!unit.coverageAreas || unit.coverageAreas.length === 0 ? (
                        <span className="text-sm text-stone-500 italic">Chưa cấu hình khu vực phủ sóng</span>
                      ) : (
                        unit.coverageAreas.map((area, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50 text-xs font-bold">
                            <MapPin className="h-3 w-3 opacity-70" />
                            {area.ward}, {area.province}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
