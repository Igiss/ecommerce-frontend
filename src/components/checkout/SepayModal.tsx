'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSepayStatus } from '@/lib/api/orders.service'
import {
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  QrCode,
  ShieldCheck,
  Building2,
  CreditCard,
  X,
  Sparkles,
  RefreshCw,
  FlaskConical
} from 'lucide-react'

interface SepayModalProps {
  orderId: string
  qrData: {
    orderId: string
    totalAmount: number
    paymentCode: string
    qrUrl: string
    bankName: string
    accountNumber: string
    accountHolder: string
  }
  onClose: () => void
}

export function SepayModal({ orderId, qrData, onClose }: SepayModalProps) {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simMessage, setSimMessage] = useState('')

  // 1-Click Copy Helper
  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  // Real-time Polling every 3 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        setIsChecking(true)
        const res = await getSepayStatus(orderId)
        if (res && res.isPaid) {
          setIsPaid(true)
          clearInterval(interval)
          setTimeout(() => {
            router.push(`/orders/${orderId}`)
          }, 2500)
        }
      } catch (err) {
        console.error('Failed to poll SePay status:', err)
      } finally {
        setIsChecking(false)
      }
    }

    checkStatus()
    interval = setInterval(checkStatus, 3000)

    return () => clearInterval(interval)
  }, [orderId, router])

  // Dev Test Simulated Webhook Trigger
  const handleSimulatePayment = async () => {
    try {
      setIsSimulating(true)
      setSimMessage('Đang giả lập SePay Webhook...')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      
      const res = await fetch(`${API_URL}/payments/sepay/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: qrData.bankName,
          accountNumber: qrData.accountNumber,
          code: qrData.paymentCode,
          content: `Thanh toan don hang ${qrData.paymentCode}`,
          transferAmount: qrData.totalAmount,
          referenceCode: `TEST_SEPAY_${Date.now()}`
        })
      })

      const data = await res.json()
      if (data.success) {
        setSimMessage('Giả lập SePay thành công! Đang tự động gạch nợ...')
        setIsPaid(true)
        setTimeout(() => {
          router.push(`/orders/${orderId}`)
        }, 2000)
      } else {
        setSimMessage(`Lỗi giả lập: ${data.message || 'Không thành công'}`)
      }
    } catch (err: any) {
      setSimMessage(`Lỗi giả lập: ${err.message}`)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-stone-200 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-800 text-white shadow-xs">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-stone-900">Thanh Toán VietQR SePay</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  ⚡ Tự động 24/7
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Mở App Ngân Hàng Quét Mã VietQR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {isPaid ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-stone-900">Thanh Toán Thành Công! 🎉</h3>
              <p className="text-xs text-stone-600 mt-1">
                Hệ thống đã nhận được số tiền <strong className="text-amber-800">{qrData.totalAmount.toLocaleString('vi-VN')}đ</strong> từ ngân hàng.
              </p>
              <p className="text-xs text-stone-400 mt-2 font-medium">
                Đang chuyển sang màn hình Chi Tiết Đơn Hàng...
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            
            {/* VietQR Code Image Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="relative shrink-0 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
                <img
                  src={qrData.qrUrl}
                  alt="VietQR SePay Code"
                  className="h-40 w-40 object-contain rounded-lg"
                />
                <span className="absolute bottom-1 right-1 bg-amber-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                  VIETQR
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-700 w-full">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                  <Building2 className="h-4 w-4 text-amber-800" />
                  <span>{qrData.bankName}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-stone-400 uppercase font-bold">Chủ tài khoản:</p>
                  <p className="font-black text-stone-900">{qrData.accountHolder}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-stone-400 uppercase font-bold">Số tiền chuyển:</p>
                  <p className="text-lg font-black text-amber-800">
                    {qrData.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            {/* Transfer Syntax & Details Card */}
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              
              {/* Account Number Copy */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">Số tài khoản:</span>
                  <p className="text-sm font-black text-stone-900 font-mono">{qrData.accountNumber}</p>
                </div>
                <button
                  onClick={() => handleCopy(qrData.accountNumber, 'acc')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:border-amber-800 hover:text-amber-800 transition-colors shadow-2xs"
                >
                  {copiedField === 'acc' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Sao chép
                    </>
                  )}
                </button>
              </div>

              {/* Transfer Syntax Copy */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                <div>
                  <span className="text-[10px] text-amber-800 font-extrabold uppercase flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Cú pháp (Nội dung chuyển tiền):
                  </span>
                  <p className="text-sm font-black text-amber-900 font-mono bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-lg mt-0.5 inline-block">
                    {qrData.paymentCode}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(qrData.paymentCode, 'code')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-extrabold hover:bg-amber-900 transition-colors shadow-2xs"
                >
                  {copiedField === 'code' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Sao chép mã
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                ⚠️ *Quý khách vui lòng giữ nguyên nội dung chuyển khoản để hệ thống ghi nhận tự động 24/7.*
              </p>
            </div>

            {/* Live Status Indicator Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-100/80 border border-stone-200 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Loader2 className="h-4 w-4 animate-spin text-amber-800 shrink-0" />
                <span>Đang chờ nhận chuyển khoản từ ngân hàng...</span>
              </div>
              <span className="text-[10px] font-bold text-stone-400">Tự động check mỗi 3s</span>
            </div>

            {/* Dev Simulated Test Webhook Trigger */}
            <div className="pt-2 border-t border-stone-100 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <FlaskConical className="h-4 w-4 text-purple-600" />
                {isSimulating ? 'Đang giả lập giao dịch...' : '🧪 Test Giả Lập Giao Dịch SePay (Không Tốn Tiền)'}
              </button>

              {simMessage && (
                <p className="text-[11px] font-bold text-purple-700 animate-in fade-in">
                  {simMessage}
                </p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
