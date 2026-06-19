import request from '@/utils/request'
import {
  CouponListResponse,
  AvailableCouponsResponse,
  CollectCouponResponse,
  MyCouponsResponse
} from '@/types/coupon'

/**
 * 获取所有优惠券列表（活动页展示）
 * @returns 优惠券列表
 */
export const getCouponList = () => {
  return request.get<CouponListResponse>('/coupons/list').then(res => res.data)
}

/**
 * 获取可用优惠券（根据订单金额筛选）
 * @param amount 订单金额
 * @returns 可用优惠券列表
 */
export const getAvailableCoupons = (amount: number) => {
  return request
    .get<AvailableCouponsResponse>('/coupons/available', { params: { amount } })
    .then(res => res.data)
}

/**
 * 领取优惠券
 * @param id 优惠券ID
 * @returns 领取结果
 */
export const collectCoupon = (id: number) => {
  return request.post<CollectCouponResponse>('/coupons/collect', { id }).then(res => res.data)
}

/**
 * 获取我的优惠券列表
 * @returns 我的优惠券列表
 */
export const getMyCoupons = () => {
  return request.get<MyCouponsResponse>('/coupons/my').then(res => res.data)
}

/**
 * 使用优惠券
 * @param id 优惠券ID
 * @param orderId 订单ID
 * @returns 使用结果
 */
export const useCoupon = (id: number, orderId: string) => {
  return request.post<CollectCouponResponse>('/coupons/use', { id, orderId }).then(res => res.data)
}

/**
 * 批量领取优惠券
 * @param ids 优惠券ID列表
 * @returns 领取结果
 */
export const batchCollectCoupons = (ids: number[]) => {
  return request
    .post<CollectCouponResponse>('/coupons/batch-collect', { ids })
    .then(res => res.data)
}

/**
 * 获取指定商品可用的店铺券/品牌券/品类券/单品券（不含平台券）
 * @param productId 商品ID
 * @returns 该商品可用的优惠券列表
 */
export const getProductCoupons = (productId: number) => {
  return request.get<CouponListResponse>(`/coupons/product/${productId}`).then(res => res.data)
}
