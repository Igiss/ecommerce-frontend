export interface Product {
  id: string
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
  category?: any
  categoryId?: any
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
