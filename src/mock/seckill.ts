import Mock from 'mockjs'
import { productList } from './product'

// ========== 工具函数 ==========
function pad(n: number) {
  return n < 10 ? '0' + n : String(n)
}

// 生成未来时间，offsetHours 小时后开始，持续 durationHours 小时
function futureTime(offsetHours: number, durationHours: number) {
  const now = new Date()
  const start = new Date(now.getTime() + offsetHours * 60 * 60 * 1000)
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return { startTime: fmt(start), endTime: fmt(end) }
}

// ========== 秒杀活动数据 ==========
// 从 productList 中选取 6 个商品生成秒杀活动，覆盖不同状态
const flashProducts = productList.slice(0, 6)

// 生成秒杀活动列表
const seckillList = flashProducts.map((p: any, i: number) => {
  const totalStock = 50 + i * 30
  const soldCount = Math.floor(Math.random() * totalStock * 0.6)
  const remainStock = totalStock - soldCount

  // 状态分配：0=未开始 1=进行中 2=已结束
  let status: number
  let time: { startTime: string; endTime: string }
  if (i < 2) {
    // 进行中：已经开始，持续2小时
    time = futureTime(-1, 2)
    status = 1
  } else if (i < 4) {
    // 即将开始：2小时后开始
    time = futureTime(2, 2)
    status = 0
  } else {
    // 已结束
    time = futureTime(-3, 2)
    status = 2
  }

  return {
    seckillId: 1000 + i,
    title: `${p.name} 限时秒杀`,
    goodsId: p.id,
    image: p.image,
    originalPrice: p.originalPrice || p.price,
    seckillPrice: Math.floor(p.price * (0.5 + Math.random() * 0.3)),
    startTime: time.startTime,
    endTime: time.endTime,
    totalStock,
    remainStock,
    limitCount: 1,
    status,
    soldCount
  }
})

// 生成秒杀详情（含 SKU）
const seckillDetailMap: Record<number, any> = {}
seckillList.forEach(seckill => {
  const product = productList.find((p: any) => p.id === seckill.goodsId) || productList[0]
  const skuList = (product.skus || []).map((sku: any, j: number) => ({
    skuId: sku.id,
    specs: sku.specs.map((s: any) => ({ specName: s.name, specValue: s.value })),
    seckillPrice: Math.floor(seckill.seckillPrice * (1 + j * 0.05)),
    remainStock: Math.max(1, Math.floor(seckill.remainStock * (1 - j * 0.3)))
  }))

  seckillDetailMap[seckill.seckillId] = {
    ...seckill,
    description: product.desc || '品质保证，限时抢购',
    mainImages: product.images || [product.image],
    skuList
  }
})

// 模拟订单存储
const orderStore: Record<string, any> = {}
let orderSeq = 0

// ========== Mock 接口 ==========

// 1. 获取秒杀活动列表
Mock.mock(/\/api\/seckill\/list/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: seckillList
  }
})

// 2. 获取秒杀商品详情
Mock.mock(/\/api\/seckill\/detail/, 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const seckillId = Number(url.searchParams.get('seckillId') || 0)

  const detail = seckillDetailMap[seckillId]
  if (!detail) {
    return { code: 404, msg: '秒杀活动不存在', data: null }
  }
  return { code: 200, msg: 'success', data: detail }
})

// 3. 秒杀下单
Mock.mock(/\/api\/seckill\/submit/, 'post', (options: any) => {
  const body = JSON.parse(options.body || '{}')
  const { seckillId, skuId, addressId, count } = body

  const detail = seckillDetailMap[seckillId]
  if (!detail) {
    return { code: 404, msg: '秒杀活动不存在', data: null }
  }

  // 校验1：活动状态
  if (detail.status === 2) {
    return { code: 400, msg: '活动不在有效期内', data: null }
  }
  if (detail.status === 0) {
    return { code: 400, msg: '活动不在有效期内', data: null }
  }

  // 校验2：库存
  if (detail.remainStock <= 0) {
    return { code: 400, msg: '商品库存不足', data: null }
  }
  if (detail.remainStock < count) {
    return { code: 400, msg: '商品库存不足', data: null }
  }

  // 校验3：限购
  if (count > detail.limitCount) {
    return { code: 400, msg: '超出单人限购数量', data: null }
  }

  // 校验通过：生成订单
  orderSeq++
  const orderId = 'SK' + Date.now() + String(orderSeq).padStart(3, '0')

  // 扣减库存
  detail.remainStock -= count
  detail.soldCount += count

  const order = {
    orderId,
    seckillId,
    skuId: skuId || 0,
    addressId: addressId || 0,
    goodsId: detail.goodsId,
    goodsName: detail.title,
    seckillPrice: detail.seckillPrice,
    count,
    totalAmount: detail.seckillPrice * count,
    createTime: new Date().toISOString(),
    status: 'pending'
  }
  orderStore[orderId] = order

  return { code: 200, msg: 'success', data: { orderId } }
})
