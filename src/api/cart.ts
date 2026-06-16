import request from '@/utils/request'
import type { CartListResponse, CartResponse } from '@/types/cart'
import type { CartItem } from '@/types/cart'

export interface AddToCartParams {
  goodsId: number
  skuId: number
  count: number
  name: string
  image: string
  price: number
  specText?: string
}

// 获取购物车列表
export const getCart = (): Promise<CartItem[]> => {
  return request.get<CartListResponse>('/cart').then(res => res.data) as unknown as Promise<CartItem[]>
}

// 加入购物车
export const addToCart = (data: AddToCartParams) => {
  return request.post<CartResponse>('/cart/add', data).then(res => res.data)
}

// 清空购物车（结算时调用）
export const clearCart = (ids?: string[]) => {
  return request.post<CartResponse>('/cart/clear', { ids }).then(res => res.data)
}
