import request from '@/utils/request'
import type { CalculateShippingParams, ShippingCalculateResponse } from '@/types/shipping'

/**
 * 计算运费
 * @desc 根据收货地址和商品列表，查询适用的运费规则并计算运费
 */
export const calculateShipping = (params: CalculateShippingParams) => {
  return request.post<ShippingCalculateResponse>('/shipping/calculate', params)
}