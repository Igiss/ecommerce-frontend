'use client'

import { useEffect, useState } from 'react'
import { getAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress, type UserAddress } from '@/lib/api/address.service'
import { MapPin, AlertCircle, Edit2, Trash2, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

interface Province {
  code: number
  name: string
  wards: Ward[]
}

interface Ward {
  code: number
  name: string
}

export default function ProfileAddressesPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [addrError, setAddrError] = useState('')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)

  // Address Form States
  const [addrLabel, setAddrLabel] = useState('Nhà riêng')
  const [addrFullName, setAddrFullName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrAddressLine, setAddrAddressLine] = useState('')
  const [addrProvince, setAddrProvince] = useState('')
  const [addrWard, setAddrWard] = useState('')
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addrFormError, setAddrFormError] = useState('')
  const [addrFormLoading, setAddrFormLoading] = useState(false)

  // VN Provinces Data
  const [provincesData, setProvincesData] = useState<Province[]>([])
  const [selectedProvinceObj, setSelectedProvinceObj] = useState<Province | null>(null)

  useEffect(() => {
    setMounted(true)
    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then(res => res.json())
      .then(data => setProvincesData(data))
      .catch(err => console.error('Failed to load provinces', err))
  }, [])

  useEffect(() => {
    if (mounted && user) {
      fetchAddressesList()
    }
  }, [mounted, user])

  const fetchAddressesList = () => {
    setAddrLoading(true)
    getAddresses()
      .then((data) => {
        setAddresses(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setAddrError(err.message || 'Không thể tải danh sách địa chỉ.')
      })
      .finally(() => setAddrLoading(false))
  }

  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setAddrLabel('Nhà riêng')
    setAddrFullName(user?.fullName || user?.name || '')
    setAddrPhone(user?.phone || '')
    setAddrAddressLine('')
    setAddrProvince('')
    setAddrWard('')
    setAddrIsDefault(false)
    setAddrFormError('')
    setSelectedProvinceObj(null)
    setAddressModalOpen(true)
  }

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr)
    setAddrLabel(addr.label)
    setAddrFullName(addr.fullName)
    setAddrPhone(addr.phone)
    setAddrAddressLine(addr.addressLine)
    setAddrProvince(addr.province)
    setAddrWard(addr.ward)
    setAddrIsDefault(addr.isDefault)
    setAddrFormError('')

    // Set initial objects for dropdowns
    const p = provincesData.find(x => x.name === addr.province)
    if (p) {
      setSelectedProvinceObj(p)
    } else {
      setSelectedProvinceObj(null)
    }

    setAddressModalOpen(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddrFormError('')

    if (!addrProvince || !addrWard || !addrAddressLine) {
      setAddrFormError('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Phường/Xã và nhập địa chỉ chi tiết.')
      return
    }

    setAddrFormLoading(true)

    const payload = {
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      addressLine: addrAddressLine,
      ward: addrWard,
      province: addrProvince,
      isDefault: addrIsDefault
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.addressId, payload)
      } else {
        await createAddress(payload)
      }
      setAddressModalOpen(false)
      fetchAddressesList()
    } catch (err: any) {
      setAddrFormError(err.message || 'Lỗi lưu thông tin địa chỉ.')
    } finally {
      setAddrFormLoading(false)
    }
  }

  const handleDeleteAddress = async (addrId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return
    try {
      await deleteAddress(addrId)
      fetchAddressesList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa địa chỉ.')
    }
  }

  const handleSetDefaultAddress = async (addrId: number) => {
    try {
      await setDefaultAddress(addrId)
      fetchAddressesList()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đặt địa chỉ mặc định.')
    }
  }

  if (!mounted || !user) return null

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs min-h-[400px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-700" />
            Sổ địa chỉ giao hàng
          </h2>
          <button
            onClick={handleOpenAddAddress}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm địa chỉ mới
          </button>
        </div>

        {addrLoading ? (
          <div className="flex py-12 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
          </div>
        ) : addrError ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
            <span>{addrError}</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 border border-stone-200 border-dashed rounded-2xl bg-stone-50/20">
            <p className="text-stone-550 text-sm">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
            <button
              onClick={handleOpenAddAddress}
              className="mt-3.5 inline-block text-xs font-bold text-amber-800 hover:underline cursor-pointer"
            >
              Tạo địa chỉ đầu tiên của bạn &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.addressId}
                className={`relative rounded-2xl border p-5 shadow-xs bg-white transition-all flex flex-col justify-between hover:shadow-md ${
                  addr.isDefault 
                    ? 'border-amber-800/60 bg-amber-500/2.5' 
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-800 text-white px-2 py-0.5 rounded-md">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{addr.fullName}</h4>
                  <p className="text-xs text-stone-550 font-medium">SĐT: {addr.phone}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.addressLine}, {addr.ward}, {addr.province}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100/60 flex items-center justify-between gap-4">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.addressId)}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-955 transition-colors cursor-pointer"
                    >
                      Đặt làm mặc định
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-stone-400 select-none">Địa chỉ mặc định</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-2 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                      title="Sửa địa chỉ"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.addressId)}
                      className="p-2 text-stone-400 hover:text-red-650 transition-colors cursor-pointer"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">
                {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h3>
              <button 
                onClick={() => setAddressModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {addrFormError && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-150">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-650" />
                  <span>{addrFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-555 uppercase">Loại địa chỉ</label>
                    <select
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    >
                      <option value="Nhà riêng">Nhà riêng</option>
                      <option value="Cơ quan">Cơ quan</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-555 uppercase">Số điện thoại</label>
                    <input
                      type="text"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="Số điện thoại người nhận"
                      className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Họ và tên người nhận</label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Tỉnh / Thành phố</label>
                  <select
                    required
                    value={addrProvince}
                    onChange={(e) => {
                      const pName = e.target.value;
                      setAddrProvince(pName);
                      const pObj = provincesData.find(x => x.name === pName);
                      setSelectedProvinceObj(pObj || null);
                      setAddrWard('');
                    }}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provincesData.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Phường / Xã</label>
                  <select
                    required
                    disabled={!selectedProvinceObj}
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {selectedProvinceObj?.wards?.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-555 uppercase">Địa chỉ chi tiết (Số nhà, đường)</label>
                  <input
                    type="text"
                    required
                    value={addrAddressLine}
                    onChange={(e) => setAddrAddressLine(e.target.value)}
                    placeholder="Ví dụ: 123 Nguyễn Huệ"
                    className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-600"
                  />
                  <label htmlFor="isDefault" className="text-sm font-semibold text-stone-700 cursor-pointer">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={addrFormLoading}
                    className="rounded-xl bg-amber-800 hover:bg-amber-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-colors"
                  >
                    {addrFormLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
