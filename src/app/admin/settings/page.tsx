'use client'

import { useState, useEffect } from 'react'
import { getSepaySettings, updateSepaySettings } from '@/lib/api/admin.service'
import { Building2, CreditCard, ShieldCheck, Check, AlertCircle, Save, QrCode } from 'lucide-react'

export default function AdminSettingsPage() {
  const [bankName, setBankName] = useState('MBBank')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    setLoading(true)
    getSepaySettings()
      .then((data) => {
        if (data) {
          setBankName(data.bankName || 'MBBank')
          setAccountNumber(data.accountNumber || '')
          setAccountHolder(data.accountHolder || '')
          setApiKey(data.apiKey || '')
        }
      })
      .catch((err) => {
        console.error('Failed to load SePay settings:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage({ type: '', text: '' })

    if (!bankName || !accountNumber || !accountHolder) {
      setStatusMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Tên Ngân Hàng, Số Tài Khoản và Tên Chủ Tài Khoản.' })
      return
    }

    try {
      setSaving(true)
      await updateSepaySettings({
        bankName,
        accountNumber,
        accountHolder,
        apiKey
      })
      setStatusMessage({ type: 'success', text: 'Cập nhật cấu hình Tài khoản Ngân hàng SePay thành công!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Không thể lưu cấu hình. Vui lòng thử lại.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-amber-800" />
            Cấu Hình Tài Khoản Ngân Hàng SePay
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Thiết lập thông tin thẻ ngân hàng của bạn để nhận tiền chuyển khoản tự động VietQR từ khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold shrink-0">
          <QrCode className="h-4 w-4" />
          <span>VietQR Auto Gạch Nợ 24/7</span>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12 bg-white rounded-3xl border border-stone-200">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Bank Name Select */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-2">
                Tên Ngân Hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-800 focus:outline-none"
              >
                <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
                <option value="Vietcombank">Vietcombank (VCB)</option>
                <option value="Techcombank">Techcombank (TCB)</option>
                <option value="ACB">ACB (Ngoại Thương)</option>
                <option value="TPBank">TPBank (Tuyên Phong)</option>
                <option value="VPBank">VPBank (Việt Nam Thịnh Vượng)</option>
                <option value="VietinBank">VietinBank (Công Thương)</option>
                <option value="BIDV">BIDV (Đầu tư và Phát triển)</option>
                <option value="Sacombank">Sacombank</option>
                <option value="VIB">VIB (Quốc Tế)</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-2">
                Số Tài Khoản Ngân Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="VD: 0987654321 hoặc 03888888888"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-black text-stone-900 focus:border-amber-800 focus:outline-none font-mono"
              />
            </div>

            {/* Account Holder Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-2">
                Tên Chủ Tài Khoản (Viết Hoa Không Dấu) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                placeholder="VD: NGUYEN VAN A hoặc GIA DUNG 24H"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-black text-stone-900 focus:border-amber-800 focus:outline-none uppercase"
              />
            </div>

            {/* SePay Webhook Token / API Key */}
            <div className="sm:col-span-2 pt-4 border-t border-stone-100">
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                Mã SePay API Key / Webhook Token (Tùy chọn)
              </label>
              <p className="text-[11px] text-stone-400 mb-2">
                Dùng để bảo mật xác thực Webhook từ SePay bắn về server. Nếu chưa cần có thể để trống.
              </p>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API Key từ SePay.vn (Nếu có)"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:border-amber-800 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:bg-stone-300"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Ngân Hàng'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
