import type { ApiResponse } from './api'

/** 运费规则类型 */
export type ShippingRuleType = 'area' | 'amount' | 'weight' | 'store'

/** 运费规则 */
export interface ShippingRule {
  id: number
  name: string                          // 规则名称，如"江浙沪包邮"
  type: ShippingRuleType                // 规则类型
  provinceCodes: string[]               // 适用省份编码，['*'] 表示全国通用
  baseFee: number                       // 基础运费（分）
  freeThreshold: number                 // 满额包邮门槛（分），0 = 无门槛
  weightRate: number                    // 重量费率（分/公斤）
  minWeight: number                     // 最低计费重量（公斤）
  storeId: number | null                // 店铺ID，null = 全平台
  priority: number                      // 优先级（数字越小越高）
  status: boolean                       // 是否启用
}

/** 运费计算结果 */
export interface ShippingResult {
  fee: number                           // 运费（分）
  freeAmount: number                    // 还差多少包邮（分），0 = 已包邮
  appliedRule: ShippingRule | null      // 命中的规则
  isFree: boolean                       // 是否免运费
}

/** 计算运费请求参数 */
export interface CalculateShippingParams {
  addressId: number
  items: {
    goodsId: number
    skuId: number
    count: number
    price: number
    weight?: number
  }[]
}

/** 运费计算接口响应 */
export type ShippingCalculateResponse = ApiResponse<ShippingResult>

/** 运费规则列表响应 */
export type ShippingRuleListResponse = ApiResponse<ShippingRule[]>