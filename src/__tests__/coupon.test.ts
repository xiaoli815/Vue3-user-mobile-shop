import { describe, it, expect } from 'vitest'
import {
  calculateCouponDiscount,
  calculateDiscountedPrice,
  calculateItemDiscountedPrice
} from '@/utils/coupon'
import type { Coupon } from '@/types/coupon'

const createCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 1,
  name: '测试优惠券',
  type: '满减',
  value: 20,
  minUseAmount: 100,
  expireTime: '2026-12-31',
  isUsable: true,
  ...overrides
})

describe('coupon.ts', () => {
  describe('calculateCouponDiscount', () => {
    it('满减券：满足条件时返回优惠金额', () => {
      const coupon = createCoupon({ type: '满减', value: 20, minUseAmount: 100 })
      expect(calculateCouponDiscount(coupon, 150)).toBe(20)
    })

    it('满减券：不满足条件时返回 0', () => {
      const coupon = createCoupon({ type: '满减', value: 20, minUseAmount: 100 })
      expect(calculateCouponDiscount(coupon, 50)).toBe(0)
    })

    it('折扣券：正确计算折扣', () => {
      const coupon = createCoupon({ type: '折扣', value: 80, minUseAmount: 0 })
      // 80 折 = 20% off = 原价 * 0.2
      const discount = calculateCouponDiscount(coupon, 100)
      expect(discount).toBe(20)
    })

    it('无门槛券：直接返回减免金额', () => {
      const coupon = createCoupon({ type: '无门槛', value: 10, minUseAmount: 0 })
      expect(calculateCouponDiscount(coupon, 5)).toBe(10)
    })
  })

  describe('calculateDiscountedPrice', () => {
    it('应该返回折扣后价格', () => {
      const coupon = createCoupon({ type: '满减', value: 20, minUseAmount: 100 })
      expect(calculateDiscountedPrice(coupon, 150)).toBe(130)
    })

    it('折扣后价格不会低于 0', () => {
      const coupon = createCoupon({ type: '满减', value: 200, minUseAmount: 0 })
      expect(calculateDiscountedPrice(coupon, 100)).toBe(0)
    })
  })

  describe('calculateItemDiscountedPrice', () => {
    it('无优惠时返回原价', () => {
      expect(calculateItemDiscountedPrice(100, 1, 100, 0)).toBe(100)
    })

    it('有优惠时按比例分摊', () => {
      const price = calculateItemDiscountedPrice(50, 2, 200, 20)
      // 该商品占订单 50*2/200 = 50%，优惠 20*50% = 10，优惠后单价 50-10/2 = 45
      expect(price).toBe(45)
    })
  })
})
