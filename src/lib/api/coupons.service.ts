import { apiClient } from './client'

export function validateCoupon(code: string, orderTotal: number) {
  return apiClient<any>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal })
  })
}

export const STATIC_COUPONS = [
  {
    _id: '6a36276fa85914852b216478',
    ownerId: '6a2f70a452b2bae0ba23fdfe',
    code: 'SUMMER26',
    discountType: 'percentage',
    discountAmount: 30,
    minOrderValue: 300000,
    maxDiscount: 500000,
    expiryDate: '2026-07-20T00:00:00.000Z',
    isActive: true
  },
  {
    _id: '6a3615f4fb0b2cccc9997a0c',
    ownerId: '6a2f70a452b2bae0ba23fdfe',
    code: 'TEST',
    discountType: 'percentage',
    discountAmount: 100,
    minOrderValue: 100000,
    maxDiscount: 50000,
    expiryDate: '2026-07-20T00:00:00.000Z',
    isActive: true
  }
]

export function getActiveCoupons(): Promise<any[]> {
  return Promise.resolve(STATIC_COUPONS)
}
