import type { ApiResponse } from './api'

/**
 * 优惠券分类（平台券/品类券/品牌券/单品券/店铺券）
 */
export type CouponCategory = '平台券' | '品类券' | '品牌券' | '单品券' | '店铺券'

/**
 * 优惠券类型
 */
export type CouponType = '满减' | '折扣' | '无门槛'

/**
 * 优惠券叠加规则
 * - single: 不可叠加（同类型只能选一张）
 * - stackable: 可叠加（跨类型可叠加，如平台券+店铺券）
 */
export type CouponStackRule = 'single' | 'stackable'

/**
 * 优惠券核心数据结构
 *
 * 字段说明：
 * - id: 优惠券唯一标识
 * - name: 优惠券名称（如"双11满300减50"）
 * - type: 优惠券类型（满减/折扣/无门槛）
 * - value: 优惠值（满减=优惠金额，折扣=折扣率如90表示9折，无门槛=优惠金额）
 * - minUseAmount: 最低使用门槛金额（元），0表示无门槛
 * - startAt/endAt: 有效期时间戳（毫秒），Vant Coupon 组件所需
 * - expireTime: 过期时间字符串（业务展示用）
 * - isUsable: 是否可用（后端控制，如已使用/已过期则不可用）
 * - collected: 是否已领取
 * - description: 优惠券描述文案
 * - category: 优惠券分类
 * - productIds: 适用商品ID列表（单品券/品类券/品牌券限定商品）
 * - brandName: 品牌名称（品牌券/店铺券适用）
 * - stackRule: 叠加规则
 * - discount: 换算后的优惠金额（分），Vant Coupon 组件所需
 * - minOrderAmount: 最低订单金额（分），Vant Coupon 组件所需
 * - valid: 是否有效（Vant Coupon 组件所需）
 * - reason: 不可用原因文案
 */
export interface Coupon {
  id: number
  name: string
  type: CouponType
  value: number
  minUseAmount: number
  /** 有效期开始时间戳（毫秒），Vant 组件使用 */
  startAt: number
  /** 有效期结束时间戳（毫秒），Vant 组件使用 */
  endAt: number
  /** 过期时间字符串（业务展示用） */
  expireTime: string
  isUsable: boolean
  collected?: boolean
  description?: string
  category?: CouponCategory
  productIds?: number[]
  brandName?: string
  stackRule?: CouponStackRule
  /** 换算后的优惠金额（分），Vant CouponList 组件使用 */
  discount?: number
  /** 最低订单金额（分），Vant CouponList 组件使用 */
  minOrderAmount?: number
  /** 是否有效（Vant CouponList 组件使用） */
  valid?: boolean
  /** 不可用原因文案 */
  reason?: string
}

// ========== API 响应类型 ==========

export type CouponListResponse = ApiResponse<Coupon[]>

export type AvailableCouponsResponse = ApiResponse<Coupon[]>

export type CollectCouponResponse = ApiResponse<null>

export type MyCouponsResponse = ApiResponse<Coupon[]>

export type UseCouponResponse = ApiResponse<null>

export type BatchCollectCouponResponse = ApiResponse<null>