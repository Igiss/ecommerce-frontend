export type UserRole = "user" | "owner" | "admin" | "shipper" | "shipping_unit"
export type UserStatus = "pending" | "active" | "blocked" | "rejected"

export interface User {
  id: string
  fullName?: string
  name?: string
  email: string
  phone?: string
  avatar?: string
  address?: string
  role: UserRole
  status: UserStatus
  
  // Owner request fields
  isRequestingOwner?: boolean
  storeName?: string
  storePhone?: string
  storeAddress?: string

  isAdmin?: boolean
  isOwner?: boolean
  isShipper?: boolean
  isShippingUnit?: boolean
}
