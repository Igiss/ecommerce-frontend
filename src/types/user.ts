export type UserRole = "user" | "owner" | "admin" | "shipper" | "shipping_unit"
export type UserStatus = "pending" | "active" | "blocked"

export interface User {
  id: string
  fullName: string
  name?: string
  email: string
  avatar?: string
  phone?: string
  address?: string
  role: UserRole
  status: UserStatus
  isAdmin?: boolean
  isOwner?: boolean
  isShipper?: boolean
  isShippingUnit?: boolean
}
