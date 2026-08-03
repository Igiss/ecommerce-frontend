export enum PriceAdjustmentType {
  BASE_PRICE_CHANGE = 'base_price_change', // Hạ / Đổi giá gốc
  SALE_CAMPAIGN = 'sale_campaign',         // Sale khuyến mãi có thời hạn
}

export enum DiscountValueType {
  FIXED_PRICE = 'fixed_price',   // Nhập trực tiếp số tiền
  PERCENTAGE = 'percentage',     // Giảm theo %
  AMOUNT_OFF = 'amount_off',     // Giảm trừ số tiền
}

export enum ScheduleStatus {
  PENDING = 'pending',     // Chờ đến giờ kích hoạt
  ACTIVE = 'active',       // Đang diễn ra (cho Sale)
  APPLIED = 'applied',     // Đã áp dụng xong vào giá gốc (cho Base Price Change)
  EXPIRED = 'expired',     // Đã hết hạn (cho Sale)
  CANCELLED = 'cancelled', // Đã bị hủy
}

export interface ProductPriceSchedule {
  id: string
  _id?: string
  productId: string
  type: PriceAdjustmentType
  valueType: DiscountValueType
  value: number
  calculatedPrice: number
  startDate: string
  endDate?: string
  status: ScheduleStatus
  title?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: {
    id?: string
    _id?: string
    fullName?: string
    email?: string
    storeName?: string
  }
}

export interface CreatePriceSchedulePayload {
  productId: string
  type: PriceAdjustmentType
  valueType?: DiscountValueType
  value: number
  startDate: string
  endDate?: string
  title?: string
}

export interface CategoryRef {
  id?: string
  _id?: string
  name?: string
  slug?: string
}

export interface Product {
  id: string
  _id?: string
  productId?: number
  name: string
  description: string
  price: number
  originalPrice?: number
  rating?: number
  salePrice?: number
  saleStartDate?: string
  saleEndDate?: string
  slug?: string
  images?: string[]
  category?: string | CategoryRef
  categoryId?: string | CategoryRef
  modelUrl?: string
  soldCount?: number
  createdAt?: string | Date
  updatedAt?: string | Date
  createdBy?: {
    id?: string
    _id?: string
    fullName?: string
    email?: string
    storeName?: string
    storePhone?: string
  }
}
