import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceWithSymbol, calculateTotalPrice } from '@/utils/price'

describe('price.ts', () => {
  describe('formatPrice', () => {
    it('应该格式化价格为两位小数', () => {
      expect(formatPrice(10)).toBe('10.00')
      expect(formatPrice(10.5)).toBe('10.50')
      expect(formatPrice(10.99)).toBe('10.99')
    })

    it('应该处理 0', () => {
      expect(formatPrice(0)).toBe('0.00')
    })

    it('应该处理负数', () => {
      expect(formatPrice(-5.5)).toBe('-5.50')
    })
  })

  describe('formatPriceWithSymbol', () => {
    it('应该带 ¥ 符号', () => {
      expect(formatPriceWithSymbol(10)).toBe('¥10.00')
    })
  })

  describe('calculateTotalPrice', () => {
    it('应该计算商品总价', () => {
      const items = [
        { price: 10, count: 2 },
        { price: 5, count: 3 }
      ]
      expect(calculateTotalPrice(items)).toBe(35)
    })

    it('空数组应该返回 0', () => {
      expect(calculateTotalPrice([])).toBe(0)
    })
  })
})