import Mock from 'mockjs'
import { productList } from './product'
import type { MockOptions } from './index'
import type { Product, Sku, SpecItem } from '../types/product'

interface SeckillItem {
  seckillId: number
  title: string
  goodsId: number
  image: string
  originalPrice: number
  seckillPrice: number
  startTime: string
  endTime: string
  totalStock: number
  remainStock: number
  limitCount: number
  status: number
  soldCount: number
}

interface SeckillDetail extends SeckillItem {
  description: string
  mainImages: string[]
  skuList: {
    skuId: number
    specs: { specName: string; specValue: string }[]
    seckillPrice: number
    remainStock: number
  }[]
}

interface SeckillOrder {
  orderId: string
  seckillId: number
  skuId: number
  addressId: number
  goodsId: number
  goodsName: string
  seckillPrice: number
  count: number
  totalAmount: number
  createTime: string
  status: string
}

function pad(n: number) {
  return n < 10 ? '0' + n : String(n)
}

function futureTime(offsetHours: number, durationHours: number) {
  const now = new Date()
  const start = new Date(now.getTime() + offsetHours * 60 * 60 * 1000)
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return { startTime: fmt(start), endTime: fmt(end) }
}

const flashProducts = productList.slice(0, 6)

const seckillList: SeckillItem[] = flashProducts.map((p: Product, i: number) => {
  const totalStock = 50 + i * 30
  const soldCount = Math.floor(Math.random() * totalStock * 0.6)
  const remainStock = totalStock - soldCount

  let status: number
  let time: { startTime: string; endTime: string }
  if (i < 2) {
    time = futureTime(-1, 2)
    status = 1
  } else if (i < 4) {
    time = futureTime(2, 2)
    status = 0
  } else {
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

const seckillDetailMap: Record<number, SeckillDetail> = {}
seckillList.forEach(seckill => {
  const product = productList.find((p: Product) => p.id === seckill.goodsId) || productList[0]
  const skuList = (product.skus || []).map((sku: Sku, j: number) => ({
    skuId: sku.id,
    specs: sku.specs.map((s: SpecItem) => ({ specName: s.name, specValue: s.value })),
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

const orderStore: Record<string, SeckillOrder> = {}
let orderSeq = 0

Mock.mock(/\/api\/seckill\/list/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: seckillList
  }
})

Mock.mock(/\/api\/seckill\/detail/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const seckillId = Number(url.searchParams.get('seckillId') || 0)

  const detail = seckillDetailMap[seckillId]
  if (!detail) {
    return { code: 404, msg: '秒杀活动不存在', data: null }
  }
  return { code: 200, msg: 'success', data: detail }
})

Mock.mock(/\/api\/seckill\/submit/, 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  const { seckillId, skuId, addressId, count } = body

  const detail = seckillDetailMap[seckillId]
  if (!detail) {
    return { code: 404, msg: '秒杀活动不存在', data: null }
  }

  if (detail.status === 2) {
    return { code: 400, msg: '活动不在有效期内', data: null }
  }
  if (detail.status === 0) {
    return { code: 400, msg: '活动不在有效期内', data: null }
  }

  if (detail.remainStock <= 0) {
    return { code: 400, msg: '商品库存不足', data: null }
  }
  if (detail.remainStock < count) {
    return { code: 400, msg: '商品库存不足', data: null }
  }

  if (count > detail.limitCount) {
    return { code: 400, msg: '超出单人限购数量', data: null }
  }

  orderSeq++
  const orderId = 'SK' + Date.now() + String(orderSeq).padStart(3, '0')

  detail.remainStock -= count
  detail.soldCount += count

  const order: SeckillOrder = {
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
