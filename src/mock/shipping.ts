import Mock from 'mockjs'
import type { MockOptions } from './index'

Mock.mock('/api/shipping/calculate', 'post', (options: MockOptions) => {
  const { addressId, items } = JSON.parse(options.body || '{}')

  const totalPrice = items?.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.count || 0), 0) || 0

  let fee = 0
  let freeAmount = 0
  let isFree = false

  if (totalPrice >= 99) {
    isFree = true
    fee = 0
    freeAmount = 0
  } else {
    isFree = false
    fee = Math.round(10 * 100)
    freeAmount = Math.max(0, (99 - totalPrice) * 100)
  }

  return {
    code: 200,
    msg: 'success',
    data: {
      fee,
      freeAmount,
      isFree,
      appliedRule: null
    }
  }
})