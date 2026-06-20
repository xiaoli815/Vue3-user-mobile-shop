import type { ApiResponse } from './api'
import type { Address } from './address'

export interface OrderGoods {
  goodsId?: number
  name: string
  image: string
  price: number
  count: number
  specText: string
}

export interface OrderData {
  orderId: string
  createTime: string
  status: string
  goods: OrderGoods[]
  totalAmount: number
  address: Address | null
}

export type OrderStatus = 'pending_pay' | 'pending_ship' | 'shipped' | 'completed' | 'cancelled'

export interface Order {
  orderId: number
  orderNo: string
  status: OrderStatus
  createTime: string
  finalPrice: number
  goodsList: OrderGoods[]
  addressId?: number
  couponId?: number
  remark?: string
  payTime?: string
  shipTime?: string
  confirmTime?: string
  totalOriginalPrice?: number
  discountPrice?: number
  freightPrice?: number
}

export type OrderListResponse = ApiResponse<{ list: Order[], total: number }>

export type OrderDetailResponse = ApiResponse<Order | null>

export type OrderResponse = ApiResponse<{
  orderId: number
  orderNo: string
} | null>
