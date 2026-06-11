import { apiClient } from './client'

export function validateCoupon(code: string, orderTotal: number) {
  return apiClient<any>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal })
  })
}
