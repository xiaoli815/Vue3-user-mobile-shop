import type { ApiResponse } from './api'

/**
 * 优惠券分类
 */
export type CouponCategory = '平台券' | '品类券' | '品牌券' | '单品券' | '店铺券'

/**
 * 优惠券类型
 */
export interface Coupon {
  id: number
  name: string
  type: '满减' | '折扣' | '无门槛'
  value: number
  minUseAmount: number
  expireTime: string
  isUsable: boolean
  collected?: boolean
  description?: string
  discount?: number
  // 分类相关字段
  category?: CouponCategory
  productIds?: number[]         // 特定商品 ID 列表（单品券/品类券适用）
  brandName?: string            // 品牌名称（品牌券适用）
  // Vant CouponList 需要的字段
  valid?: boolean
  startAt?: number
  endAt?: number
  minOrderAmount?: number
  reason?: string
}

/**
 * 优惠券列表响应
 */
export type CouponListResponse = ApiResponse<Coupon[]>

/**
 * 可用优惠券响应
 */
export type AvailableCouponsResponse = ApiResponse<Coupon[]>

/**
 * 领取优惠券响应
 */
export type CollectCouponResponse = ApiResponse<null>

/**
 * 我的优惠券响应
 */
export type MyCouponsResponse = ApiResponse<Coupon[]>

/**
 * 使用优惠券响应
 */
export type UseCouponResponse = ApiResponse<null>

/**
 * 批量领取优惠券响应
 */
export type BatchCollectCouponResponse = ApiResponse<null>
