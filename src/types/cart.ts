import type { ApiResponse } from './api'

export interface CartItem {
  cartId?: number
  skuId: number
  goodsId: number
  name: string
  image: string
  price: number
  specText?: string
  count: number
  stock?: number
  checked: boolean
}

export type CartListResponse = ApiResponse<CartItem[]>

export type CartResponse = ApiResponse<null>
