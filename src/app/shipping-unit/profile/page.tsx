'use client'

import { useEffect, useState } from 'react'
import { getMyShippingProfile, updateMyShippingProfile, ShippingUnitResponse } from '@/lib/api/shipping-units.service'
import { Loader2, Save, AlertCircle, CheckCircle, Truck, Building2, Phone, MapPin } from 'lucide-react'

export default function ShippingUnitProfilePage() {
  const [profile, setProfile] = useState<ShippingUnitResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    contactPhone: '',
    address: '',
    province: '',
    ward: ''
  })

  // Province/Ward state
  const [provincesData, setProvincesData] = useState<any[]>([])
  const [selectedProvinceObj, setSelectedProvinceObj] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyShippingProfile()
        setProfile(data)
          setFormData({
            companyName: data.companyName || '',
            contactPhone: data.contactPhone || '',
            address: data.address || '',
            province: data.province || '',
            ward: data.ward || ''
          })
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin hồ sơ.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()

    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then(res => res.json())
      .then(data => setProvincesData(data))
      .catch(err => console.error('Failed to load provinces', err))
  }, [])

  useEffect(() => {
    if (provincesData.length > 0 && formData.province) {
      const pObj = provincesData.find((x: any) => x.name === formData.province)
      setSelectedProvinceObj(pObj || null)
    }
  }, [provincesData, formData.province])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const data = await updateMyShippingProfile(formData)
      setProfile(data)
      setSuccess('Đã cập nhật hồ sơ thành công!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-amber-700" />
          Hồ sơ đơn vị vận chuyển
        </h1>
        <p className="text-sm text-stone-500 mt-1">Cập nhật thông tin công ty và liên hệ.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Tên công ty / Đơn vị</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="VD: Giao Hàng Tiết Kiệm..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Số điện thoại liên hệ</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Tỉnh / Thành phố</label>
              <select
                value={formData.province}
                onChange={(e) => {
                  const pName = e.target.value;
                  setFormData({ ...formData, province: pName, ward: '' });
                }}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value="">Chọn Tỉnh / Thành phố</option>
                {provincesData.map((p: any) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Phường / Xã</label>
              <select
                disabled={!selectedProvinceObj}
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white disabled:bg-stone-100"
              >
                <option value="">Chọn Phường / Xã</option>
                {selectedProvinceObj?.wards?.map((w: any) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Địa chỉ trụ sở / Trạm trung chuyển (Số nhà, đường...)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ đầy đủ..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-bold text-stone-900 mb-2">Khu vực phủ sóng hiện tại (Admin phân công)</label>
              <div className="flex flex-wrap gap-2">
                {!profile?.coverageAreas || profile.coverageAreas.length === 0 ? (
                  <span className="text-sm text-stone-500 italic">Chưa được phân công khu vực nào.</span>
                ) : (
                  profile.coverageAreas.map((area, idx) => (
                    <span key={idx} className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50 text-xs font-bold">
                      {area.ward}, {area.province}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-sm font-bold text-white hover:bg-amber-900 shadow-md transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
