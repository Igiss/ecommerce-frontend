export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  saleStartDate?: string
  saleEndDate?: string
  slug?: string
  images?: string[]
  category?: any
  modelUrl?: string
}
