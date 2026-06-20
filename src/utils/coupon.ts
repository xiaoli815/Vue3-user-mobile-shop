import type { Coupon, CouponCategory } from '@/types/coupon'
import type { OrderGoods } from '@/types/order'

// ============================================================
// 接口定义
// ============================================================

/** 单张优惠券应用结果 */
export interface CouponDiscountResult {
  coupon: Coupon
  discount: number
  discountedPrice: number
  valid: boolean
  reason?: string
}

/** 已应用的优惠券集合（按分类） */
export interface AppliedCoupons {
  store: CouponDiscountResult | null
  platform: CouponDiscountResult | null
  brand: CouponDiscountResult | null
  category: CouponDiscountResult | null
}

/** 价格明细 */
export interface PriceBreakdown {
  originalPrice: number
  storeDiscount: number
  platformDiscount: number
  brandDiscount: number
  categoryDiscount: number
  totalDiscount: number
  shipping: number
  finalPrice: number
}

/** 优惠券校验结果 */
export interface ValidationResult {
  valid: boolean
  reason: string
}

// ============================================================
// 策略模式：优惠金额计算
// ============================================================

/** 优惠计算策略接口 */
interface DiscountStrategy {
  calculate(coupon: Coupon, amount: number): number
}

/** 折扣券策略：amount * (100 - value) / 100，value=90 → 9折 → 优惠10% */
class DiscountCouponStrategy implements DiscountStrategy {
  calculate(coupon: Coupon, amount: number): number {
    return Math.round(((amount * (100 - coupon.value)) / 100) * 100) / 100
  }
}

/** 满减/无门槛券策略：直接返回 value 作为优惠金额 */
class FixedDiscountStrategy implements DiscountStrategy {
  calculate(coupon: Coupon, _amount: number): number {
    return coupon.value
  }
}

/** 空策略（兜底） */
class NullStrategy implements DiscountStrategy {
  calculate(_coupon: Coupon, _amount: number): number {
    return 0
  }
}

/** 策略工厂 */
class DiscountStrategyFactory {
  static getStrategy(type: Coupon['type']): DiscountStrategy {
    switch (type) {
      case '折扣':
        return new DiscountCouponStrategy()
      case '满减':
      case '无门槛':
        return new FixedDiscountStrategy()
      default:
        return new NullStrategy()
    }
  }
}

// ============================================================
// 优惠券预校验器：淘宝真实业务规则
// ============================================================

/**
 * 优惠券有效性预校验
 *
 * 校验规则（按淘宝真实业务）：
 * 1. 优惠券是否可用（isUsable）
 * 2. 是否在有效期内（startAt ≤ now ≤ endAt）
 * 3. 是否满足最低消费门槛（orderAmount ≥ minUseAmount）
 * 4. 商品是否匹配（productIds 非空时，订单商品必须包含指定商品）
 */
class CouponValidator {
  /**
   * 对单张优惠券进行有效性预校验
   * @param coupon 优惠券
   * @param orderAmount 订单金额（元）
   * @param goodsIds 订单商品ID列表
   * @returns 校验结果
   */
  static validate(coupon: Coupon, orderAmount: number, goodsIds: number[] = []): ValidationResult {
    // 1. 后端标记不可用（如已使用）
    if (!coupon.isUsable) {
      return { valid: false, reason: '优惠券不可用' }
    }

    // 2. 有效期校验
    const now = Date.now()
    if (now < coupon.startAt) {
      return { valid: false, reason: '优惠券尚未生效' }
    }
    if (now > coupon.endAt) {
      return { valid: false, reason: '优惠券已过期' }
    }

    // 3. 最低消费门槛
    if (orderAmount < coupon.minUseAmount) {
      return { valid: false, reason: `满${coupon.minUseAmount}元可用，还差${(coupon.minUseAmount - orderAmount).toFixed(2)}元` }
    }

    // 4. 商品匹配校验（单品券/品类券/品牌券/店铺券限定商品）
    if (coupon.productIds && coupon.productIds.length > 0) {
      const hasMatch = goodsIds.some(id => coupon.productIds!.includes(id))
      if (!hasMatch) {
        return { valid: false, reason: '当前订单商品不适用此优惠券' }
      }
    }

    return { valid: true, reason: '' }
  }
}

// ============================================================
// 叠加规则：淘宝真实业务逻辑
// ============================================================

/**
 * 优惠券叠加规则（淘宝真实业务）
 *
 * 规则：
 * - 同类券不可叠加：同一分类（平台券/店铺券/品牌券/品类券）下只能选一张最优的
 * - 单品券独占：选择单品券后不可再选其他券
 * - 跨类券可叠加：平台券 + 店铺券 + 品牌券 + 品类券 可同时使用
 * - 叠加顺序：单品券 > 店铺券 > 品牌券 > 品类券 > 平台券
 */
export const COUPON_STACK_RULES = {
  /** 可叠加的分类组合 */
  STACKABLE_GROUPS: [
    ['平台券', '店铺券'],
    ['平台券', '品牌券'],
    ['平台券', '品类券'],
    ['店铺券', '品牌券'],
    ['店铺券', '品类券'],
    ['品牌券', '品类券'],
  ] as const,

  /** 独占分类（选择后不可叠加其他券） */
  EXCLUSIVE_CATEGORIES: ['单品券'] as const,
}

/** 判断两张优惠券是否可以叠加 */
export function canStackCoupons(
  category1: CouponCategory | undefined,
  category2: CouponCategory | undefined
): boolean {
  if (!category1 || !category2) return false
  if (category1 === category2) return false // 同类不可叠加

  // 单品券不可与任何券叠加
  if (category1 === '单品券' || category2 === '单品券') return false

  return true
}

// ============================================================
// 公开 API
// ============================================================

/** 计算单张优惠券的优惠金额 */
export function calculateCouponDiscount(coupon: Coupon, originalPrice: number): number {
  if (originalPrice < coupon.minUseAmount) {
    return 0
  }
  const strategy = DiscountStrategyFactory.getStrategy(coupon.type)
  return strategy.calculate(coupon, originalPrice)
}

/** 计算优惠后价格 */
export function calculateDiscountedPrice(coupon: Coupon, originalPrice: number): number {
  const discount = calculateCouponDiscount(coupon, originalPrice)
  return Math.max(originalPrice - discount, 0)
}

/** 判断优惠券是否可用（简单门槛判断） */
export function isCouponUsable(coupon: Coupon, originalPrice: number): boolean {
  return originalPrice >= coupon.minUseAmount && coupon.isUsable
}

/** 判断品牌券是否匹配指定商品 */
export function isBrandCouponMatched(coupon: Coupon, productId: number): boolean {
  if (!productId) return true
  if (!coupon.productIds || coupon.productIds.length === 0) return true
  return coupon.productIds.includes(productId)
}

/**
 * 将优惠总额按商品金额占比分摊到单个商品
 * 公式：商品优惠 = 总优惠 × (商品金额 / 订单总金额)
 */
export function calculateItemDiscountedPrice(
  itemPrice: number,
  itemCount: number,
  totalOriginalPrice: number,
  totalCouponDiscount: number
): number {
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
 * 应用单张优惠券（校验 + 计算）
 * @param coupon 优惠券
 * @param orderAmount 订单金额（元）
 * @param goodsIds 订单商品ID列表
 * @returns 应用结果
 */
export function applySingleCoupon(
  coupon: Coupon,
  orderAmount: number,
  goodsIds: number[] = []
): CouponDiscountResult {
  const { valid, reason } = CouponValidator.validate(coupon, orderAmount, goodsIds)
  if (!valid) {
    return { coupon, discount: 0, discountedPrice: orderAmount, valid: false, reason }
  }
  const discount = calculateCouponDiscount(coupon, orderAmount)
  return {
    coupon,
    discount,
    discountedPrice: Math.max(orderAmount - discount, 0),
    valid: true
  }
}

/**
 * 从优惠券列表中找出优惠力度最大的优惠券
 * 算法：遍历所有券，校验有效性，取 discount 最大者
 * @param coupons 候选优惠券列表
 * @param orderAmount 订单金额（元）
 * @param goodsIds 订单商品ID列表
 * @returns 最优优惠券应用结果，无可用券返回 null
 */
export function findBestCoupon(
  coupons: Coupon[],
  orderAmount: number,
  goodsIds: number[] = []
): CouponDiscountResult | null {
  let bestResult: CouponDiscountResult | null = null

  for (const coupon of coupons) {
    const result = applySingleCoupon(coupon, orderAmount, goodsIds)
    if (!result.valid) continue
    if (!bestResult || result.discount > bestResult.discount) {
      bestResult = result
    }
  }

  return bestResult
}

/**
 * 按分类自动选择最优优惠券（淘宝核心逻辑）
 *
 * 规则：
 * 1. 每个分类下自动选择优惠力度最大的券
 * 2. 单品券独占：选中单品券后其他券全部清空
 * 3. 跨类券可叠加
 *
 * @param coupons 候选优惠券列表
 * @param orderAmount 订单金额（元）
 * @param goodsIds 订单商品ID列表
 * @returns 按分类选出的最优券集合
 */
export function autoSelectBestCoupons(
  coupons: Coupon[],
  orderAmount: number,
  goodsIds: number[] = []
): AppliedCoupons {
  const result: AppliedCoupons = {
    store: null,
    platform: null,
    brand: null,
    category: null
  }

  // 按分类分组
  const grouped = groupCouponsByCategory(coupons)

  // 每个分类选最优
  const categoryMap: Record<string, CouponDiscountResult | null> = {
    '平台券': findBestCoupon(grouped['平台券'] || [], orderAmount, goodsIds),
    '店铺券': findBestCoupon(grouped['店铺券'] || [], orderAmount, goodsIds),
    '品牌券': findBestCoupon(grouped['品牌券'] || [], orderAmount, goodsIds),
    '品类券': findBestCoupon(grouped['品类券'] || [], orderAmount, goodsIds),
    '单品券': findBestCoupon(grouped['单品券'] || [], orderAmount, goodsIds),
  }

  // 单品券独占规则：如果选中了单品券，清空其他分类
  if (categoryMap['单品券']) {
    result.store = null
    result.platform = null
    result.brand = null
    result.category = null
    // 单品券存入 platform 字段（前端展示用）
    result.platform = categoryMap['单品券']
    return result
  }

  result.platform = categoryMap['平台券']
  result.store = categoryMap['店铺券']
  result.brand = categoryMap['品牌券']
  result.category = categoryMap['品类券']

  return result
}

/**
 * 计算最终价格明细
 * @param originalPrice 商品原价合计
 * @param applied 已应用的优惠券集合
 * @returns 价格明细
 */
export function calculatePriceBreakdown(
  originalPrice: number,
  applied: AppliedCoupons
): PriceBreakdown {
  const storeDiscount = applied.store?.discount || 0
  const platformDiscount = applied.platform?.discount || 0
  const brandDiscount = applied.brand?.discount || 0
  const categoryDiscount = applied.category?.discount || 0

  const totalDiscount = storeDiscount + platformDiscount + brandDiscount + categoryDiscount

  return {
    originalPrice,
    storeDiscount,
    platformDiscount,
    brandDiscount,
    categoryDiscount,
    totalDiscount,
    shipping: 0,
    finalPrice: Math.max(originalPrice - totalDiscount, 0)
  }
}

/**
 * 重新校验已应用的优惠券集合
 * 当订单商品或金额变化时调用，自动移除失效的券
 *
 * @param applied 当前已应用的优惠券
 * @param orderAmount 新订单金额
 * @param goodsIds 新订单商品ID列表
 * @returns 重新校验后的优惠券集合
 */
export function revalidateAppliedCoupons(
  applied: AppliedCoupons,
  orderAmount: number,
  goodsIds: number[]
): { coupons: AppliedCoupons; invalidReasons: string[] } {
  const invalidReasons: string[] = []
  const newCoupons: AppliedCoupons = { ...applied }

  const keys: (keyof AppliedCoupons)[] = ['store', 'platform', 'brand', 'category']

  for (const key of keys) {
    const item = applied[key]
    if (!item) continue

    const { valid, reason } = CouponValidator.validate(item.coupon, orderAmount, goodsIds)
    if (!valid) {
      newCoupons[key] = null
      invalidReasons.push(`${item.coupon.category || '优惠券'}「${item.coupon.name}」${reason}`)
    } else {
      // 重新计算优惠金额（金额可能变化）
      newCoupons[key] = applySingleCoupon(item.coupon, orderAmount, goodsIds)
    }
  }

  return { coupons: newCoupons, invalidReasons }
}

/** 从订单商品中提取商品ID列表 */
export function getGoodsIdsFromOrder(orderGoods: OrderGoods[]): number[] {
  return orderGoods.map(item => item.goodsId).filter((id): id is number => id !== undefined && id > 0)
}

/** 按分类分组优惠券 */
export function groupCouponsByCategory(coupons: Coupon[]): Record<string, Coupon[]> {
  return coupons.reduce((acc, coupon) => {
    const category = coupon.category || '其他'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(coupon)
    return acc
  }, {} as Record<string, Coupon[]>)
}

/** 过滤出可用优惠券（校验有效性 + 门槛 + 商品匹配） */
export function filterUsableCoupons(
  coupons: Coupon[],
  orderAmount: number,
  goodsIds: number[] = []
): Coupon[] {
  return coupons.filter(coupon => {
    const { valid } = CouponValidator.validate(coupon, orderAmount, goodsIds)
    return valid
  })
}

/**
 * 过滤出不可用优惠券（用于展示不可用原因）
 * 优先返回已领取中不可用的券
 */
export function filterUnusableCoupons(
  coupons: Coupon[],
  orderAmount: number,
  goodsIds: number[] = []
): Coupon[] {
  return coupons.filter(coupon => {
    const { valid } = CouponValidator.validate(coupon, orderAmount, goodsIds)
    return !valid
  })
}