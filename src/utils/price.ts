/**
 * 价格格式化工具函数
 */

/**
 * 格式化价格（保留两位小数）
 * @param price 价格（单位：元）
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

/**
 * 格式化价格显示（带货币符号）
 * @param price 价格（单位：元）
 * @returns 格式化后的价格字符串（带¥符号）
 */
export const formatPriceWithSymbol = (price: number): string => {
  return `¥${price.toFixed(2)}`
}

/**
 * 计算总价
 * @param items 商品列表
 * @param priceKey 价格字段名
 * @param countKey 数量字段名
 * @returns 总价
 */
export const calculateTotalPrice = (
  items: { price: number; count: number }[],
  priceKey: string = 'price',
  countKey: string = 'count'
): number => {
  return items.reduce(
    (sum, item) =>
      sum +
      ((item[priceKey as keyof typeof item] as number) || 0) *
        ((item[countKey as keyof typeof item] as number) || 1),
    0
  )
}
