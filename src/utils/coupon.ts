import type { Coupon } from '@/types/coupon'

/**
 * 优惠券计算工具函数
 */

/**
 * 计算优惠券优惠金额
 * @param coupon 优惠券对象
 * @param originalPrice 原价（单位：元）
 * @returns 优惠金额（单位：元）
 */
export const calculateCouponDiscount = (coupon: Coupon, originalPrice: number): number => {
  // 检查是否满足使用条件
  if (originalPrice < coupon.minUseAmount) {
    return 0
  }

  if (coupon.type === '折扣') {
    // 折扣券：value=90表示9折，优惠金额 = 原价 * (100 - value) / 100
    return Math.round(originalPrice * (100 - coupon.value) / 100 * 100) / 100
  } else if (coupon.type === '满减') {
    // 满减券：直接返回减免金额
    return coupon.value
  } else if (coupon.type === '无门槛') {
    // 无门槛券：直接返回减免金额
    return coupon.value
  }

  return 0
}

/**
 * 计算折扣后价格
 * @param coupon 优惠券对象
 * @param originalPrice 原价（单位：元）
 * @returns 折扣后价格（单位：元）
 */
export const calculateDiscountedPrice = (coupon: Coupon, originalPrice: number): number => {
  const discount = calculateCouponDiscount(coupon, originalPrice)
  return Math.max(originalPrice - discount, 0)
}

/**
 * 计算单个商品在满减券下的优惠后单价
 * @param itemPrice 商品单价
 * @param itemCount 商品数量
 * @param totalOriginalPrice 订单总价
 * @param totalCouponDiscount 优惠券总优惠金额
 * @returns 优惠后单价
 */
export const calculateItemDiscountedPrice = (
  itemPrice: number,
  itemCount: number,
  totalOriginalPrice: number,
  totalCouponDiscount: number
): number => {
  if (totalCouponDiscount <= 0 || totalOriginalPrice <= 0) {
    return itemPrice
  }

  const itemTotal = itemPrice * itemCount
  const discountRatio = itemTotal / totalOriginalPrice
  const itemDiscount = totalCouponDiscount * discountRatio
  const discountedPrice = (itemTotal - itemDiscount) / itemCount

  return Math.max(Math.round(discountedPrice * 100) / 100, 0)
}

/**
 * 检查优惠券是否可用
 * @param coupon 优惠券对象
 * @param originalPrice 原价（单位：元）
 * @returns 是否可用
 */
export const isCouponUsable = (coupon: Coupon, originalPrice: number): boolean => {
  return originalPrice >= coupon.minUseAmount && coupon.isUsable
}

/**
 * 检查品牌券是否匹配商品
 * @param coupon 优惠券对象
 * @param productId 商品ID
 * @returns 是否匹配
 */
export const isBrandCouponMatched = (coupon: Coupon, productId: number): boolean => {
  if (!productId) return true
  if (!coupon.productIds || coupon.productIds.length === 0) return true
  return coupon.productIds.includes(productId)
}