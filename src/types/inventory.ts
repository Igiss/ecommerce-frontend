export type InventoryLogType = 'IMPORT' | 'EXPORT' | 'SALE' | 'CANCEL_ORDER' | 'RETURN' | 'ADJUSTMENT'

export interface InventoryLog {
  id: string
  productId: any // Can be populated with Product object
  type: InventoryLogType
  quantity: number
  previousStock: number
  newStock: number
  referenceId?: string
  note?: string
  createdAt: string
  updatedAt: string
}
