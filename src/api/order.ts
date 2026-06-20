import request from '@/utils/request'
import type { OrderListResponse, OrderResponse } from '@/types/order'
import type { Order } from '@/types/order'

export interface SubmitOrderParams {
  goods: { goodsId?: number; name: string; price: number; count: number }[]
  addressId: number
  couponId?: number
  totalAmount: number
  remark?: string
}

export const getOrderList = (status?: string): Promise<{ list: Order[], total: number } | null> =>
  request
    .get<OrderListResponse>('/order/list', { params: { status } })
    .then(res => (res as unknown as OrderListResponse).data)

export const submitOrder = (data: SubmitOrderParams): Promise<{ orderId: number; orderNo: string } | null> =>
  request
    .post<OrderResponse>('/order/submit', data)
    .then(res => (res as unknown as OrderResponse).data)

export const cancelOrder = (id: number) =>
  request.post<{ code: number; msg: string; data: null }>(`/order/cancel`, { orderid: id }).then(res => res as unknown as { code: number; msg: string; data: null })

export const confirmReceipt = (id: number) =>
  request.post<{ code: number; msg: string; data: null }>(`/order/confirm`, { orderid: id }).then(res => res as unknown as { code: number; msg: string; data: null })
