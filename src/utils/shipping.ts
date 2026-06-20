import type { ShippingRule, ShippingResult } from '@/types/shipping'

/**
 * 运费计算工具（纯前端计算，不依赖后端）
 * 用于快速预计算，最终以接口返回为准
 */

/** 规则优先级映射（数字越小优先级越高） */
const RULE_PRIORITY: Record<string, number> = {
  store: 1,   // 店铺包邮 — 最高优先级
  area: 2,    // 地区运费
  amount: 3,  // 满额包邮
  weight: 4   // 按重量计费 — 最低优先级
}

/**
 * 按优先级排序运费规则
 */
export function sortRulesByPriority(rules: ShippingRule[]): ShippingRule[] {
  return [...rules].sort((a, b) =>
    (RULE_PRIORITY[a.type] || 99) - (RULE_PRIORITY[b.type] || 99)
  )
}

/**
 * 检查规则是否匹配当前省份
 */
export function isRuleMatched(rule: ShippingRule, provinceCode: string): boolean {
  if (rule.provinceCodes.includes('*')) return true
  return rule.provinceCodes.includes(provinceCode)
}

/**
 * 计算商品总重量（公斤）
 * @param items 商品列表，每项包含 weight（公斤）和 count
 * @param defaultWeight 默认单件重量（公斤），商品未配置时使用
 */
export function calcTotalWeight(
  items: { weight?: number; count: number }[],
  defaultWeight = 0.5
): number {
  return items.reduce((sum, item) => sum + (item.weight || defaultWeight) * item.count, 0)
}

/**
 * 计算运费
 * @param rules 所有运费规则
 * @param orderAmount 订单金额（分）
 * @param provinceCode 收货省份编码
 * @param totalWeight 商品总重量（公斤）
 * @param storeId 店铺ID
 */
export function calcShippingFee(
  rules: ShippingRule[],
  orderAmount: number,
  provinceCode: string,
  totalWeight: number,
  storeId: number | null = null
): ShippingResult {
  // 1. 过滤：只保留启用且匹配省份的规则
  const matched = rules.filter(r => r.status && isRuleMatched(r, provinceCode))
  if (matched.length === 0) {
    return { fee: 0, freeAmount: 0, appliedRule: null, isFree: true }
  }

  // 2. 按优先级排序
  const sorted = sortRulesByPriority(matched)

  // 3. 按规则类型计算
  for (const rule of sorted) {
    // 店铺规则：只匹配对应店铺
    if (rule.type === 'store' && rule.storeId !== null && rule.storeId !== storeId) {
      continue
    }

    switch (rule.type) {
      case 'store': {
        // 店铺包邮 — 直接免运费
        return { fee: 0, freeAmount: 0, appliedRule: rule, isFree: true }
      }

      case 'area': {
        // 地区运费 — 按基础运费
        if (rule.freeThreshold > 0 && orderAmount >= rule.freeThreshold) {
          return { fee: 0, freeAmount: 0, appliedRule: rule, isFree: true }
        }
        const freeAmount = rule.freeThreshold > 0 ? rule.freeThreshold - orderAmount : 0
        return { fee: rule.baseFee, freeAmount, appliedRule: rule, isFree: false }
      }

      case 'amount': {
        // 满额包邮
        if (orderAmount >= rule.freeThreshold) {
          return { fee: 0, freeAmount: 0, appliedRule: rule, isFree: true }
        }
        return {
          fee: rule.baseFee,
          freeAmount: rule.freeThreshold - orderAmount,
          appliedRule: rule,
          isFree: false
        }
      }

      case 'weight': {
        // 按重量计费
        const weight = Math.max(totalWeight, rule.minWeight)
        const fee = Math.max(rule.baseFee, Math.ceil(weight * rule.weightRate))
        if (rule.freeThreshold > 0 && orderAmount >= rule.freeThreshold) {
          return { fee: 0, freeAmount: 0, appliedRule: rule, isFree: true }
        }
        return {
          fee,
          freeAmount: rule.freeThreshold > 0 ? rule.freeThreshold - orderAmount : 0,
          appliedRule: rule,
          isFree: false
        }
      }
    }
  }

  // 无匹配规则 — 默认免运费
  return { fee: 0, freeAmount: 0, appliedRule: null, isFree: true }
}

/**
 * 将运费结果转换为展示文本
 */
export function formatShippingText(result: ShippingResult): string {
  if (result.isFree) return '免运费'
  return `¥${(result.fee / 100).toFixed(2)}`
}

/**
 * 获取包邮提示文本
 */
export function getFreeShippingTip(result: ShippingResult): string {
  if (result.isFree) return '已免运费'
  if (result.freeAmount > 0) {
    return `再买 ¥${(result.freeAmount / 100).toFixed(2)} 可享包邮`
  }
  return ''
}