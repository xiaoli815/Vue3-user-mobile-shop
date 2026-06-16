import request from '@/utils/request'
import type { OrderListResponse, OrderDetailResponse, OrderResponse } from '@/types/order'
import type { Order } from '@/types/order'

export interface PreOrderParams {
  cartIds?: number[]
  addressId?: number
  goodsId?: number
  skuId?: number
  count?: number
}

export interface SubmitOrderParams {
  goods: { goodsId?: number; name: string; price: number; count: number }[]
  addressId: number
  couponId?: number
  totalAmount: number
  remark?: string
}

// 订单列表（分页，按状态筛选）
export const getOrderList = (status?: string) =>
  request.get<OrderListResponse>('/order/list', { params: { status } })

// 订单预览（确认下单前）
export const preOrder = (data: PreOrderParams): Promise<Order | null> =>
  request.post<OrderDetailResponse>('/order/pre', data).then(res => res.data) as unknown as Promise<Order | null>

// 提交订单
export const submitOrder = (data: SubmitOrderParams) =>
  request.post<OrderResponse>('/order/submit', data).then(res => res.data)

// 取消订单
export const cancelOrder = (id: number) =>
  request.post(`/order/cancel`, { orderid: id })

// 确认收货
export const confirmReceipt = (id: number) =>
  request.post(`/order/confirm`, { orderid: id })
