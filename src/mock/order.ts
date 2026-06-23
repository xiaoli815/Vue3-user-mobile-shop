import Mock from 'mockjs'
import type { MockOptions } from './index'
import type { Order, OrderGoods } from '../types/order'
import { CartItem } from '@/types'

const ORDER_STORAGE_KEY = 'order_list_anonymous'
const COUNTER_STORAGE_KEY = 'order_id_counter'

function getOrderList(): Order[] {
  try {
    const data = localStorage.getItem(ORDER_STORAGE_KEY)
    if (data) {
      return JSON.parse(data) as Order[]
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveOrderList(data: Order[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data))
}

function getOrderIdCounter(): number {
  try {
    const data = localStorage.getItem(COUNTER_STORAGE_KEY)
    if (data) {
      return parseInt(data, 10) || 1
    }
  } catch {
    /* ignore */
  }
  return 1
}

function saveOrderIdCounter(value: number) {
  localStorage.setItem(COUNTER_STORAGE_KEY, String(value))
}

Mock.mock('/api/order/pre', 'post', (options: MockOptions) => {
  const { cartIds } = JSON.parse(options.body || '{}')

  let goodsList: OrderGoods[] = []
  try {
    const cartData = localStorage.getItem('cart_items_anonymous')
    if (cartData) {
      const cartItems: CartItem[] = JSON.parse(cartData)

      if (cartIds && cartIds.length > 0) {
        goodsList = cartItems
          .filter((item) => cartIds.includes(item.cartId))
          .map((item) => ({
            goodsId: item.goodsId,
            skuId: item.skuId,
            name: item.name || '',
            image: item.image || '',
            price: item.price || 0,
            count: item.count || 1,
            specText: item.specText || '暂无规格'
          }))
      } else {
        goodsList = cartItems
          .filter((item) => item.checked)
          .map((item) => ({
            goodsId: item.goodsId,
            skuId: item.skuId,
            name: item.name || '',
            image: item.image || '',
            price: item.price || 0,
            count: item.count || 1,
            specText: item.specText || '暂无规格'
          }))
      }
    }
  } catch (error) {
    console.error('读取购物车数据失败:', error)
  }
  const totalOriginalPrice = goodsList.reduce((sum, g) => sum + (g.price || 0) * (g.count || 0), 0)
  const discountPrice = 0
  const freightPrice = 0

  return {
    code: 200,
    msg: 'success',
    data: {
      totalOriginalPrice,
      discountPrice,
      freightPrice,
      finalPayPrice: totalOriginalPrice - discountPrice + freightPrice,
      goodsList
    }
  }
})

Mock.mock('/api/order/submit', 'post', (options: MockOptions) => {
  const { addressId, couponId, remark, goodsList, goods } = JSON.parse(options.body || '{}')
  const now = new Date().toISOString()
  const orderIdCounter = getOrderIdCounter()
  const orderId = orderIdCounter
  const orderNo = `ORD${Date.now()}${String(orderId).padStart(4, '0')}`

  const orderGoodsList: OrderGoods[] = goodsList || goods || []

  const totalPrice = orderGoodsList.reduce((sum, g) => sum + (g.price || 0) * (g.count || 0), 0)

  const newOrder: Order = {
    orderId,
    orderNo,
    status: 'pending_pay',
    createTime: now,
    finalPrice: totalPrice,
    goodsList: orderGoodsList,
    addressId,
    couponId,
    remark,
    payTime: '',
    shipTime: '',
    confirmTime: '',
    totalOriginalPrice: totalPrice,
    discountPrice: 0,
    freightPrice: 0
  }

  const orderList = getOrderList()
  orderList.unshift(newOrder)
  saveOrderList(orderList)
  saveOrderIdCounter(orderIdCounter + 1)

  return { code: 200, msg: '下单成功', data: { orderId } }
})

Mock.mock('/api/order/list', 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const status = url.searchParams.get('status') || ''
  const page = Number(url.searchParams.get('page') || 1)
  const pageSize = Number(url.searchParams.get('pageSize') || 10)

  let list = getOrderList()
  if (status) {
    list = list.filter(o => o.status === status)
  }

  const total = list.length
  const start = (page - 1) * pageSize
  list = list.slice(start, start + pageSize)

  return {
    code: 200,
    msg: 'success',
    data: { list, total, page, pageSize }
  }
})

Mock.mock('/api/order/cancel', 'post', (options: MockOptions) => {
  const { orderId, orderid } = JSON.parse(options.body || '{}')
  const id = orderId || orderid
  const orderList = getOrderList()
  const order = orderList.find((o) => String(o.orderId) === String(id))
  if (order) {
    order.status = 'cancelled'
    saveOrderList(orderList)
    return { code: 200, msg: '订单已取消', data: null }
  }
  return { code: 404, msg: '订单不存在', data: null }
})

Mock.mock('/api/order/confirm', 'post', (options: MockOptions) => {
  const { orderId, orderid } = JSON.parse(options.body || '{}')
  const id = orderId || orderid
  const orderList = getOrderList()
  const order = orderList.find((o) => String(o.orderId) === String(id))
  if (order) {
    order.status = 'completed'
    order.confirmTime = new Date().toISOString()
    saveOrderList(orderList)
    return { code: 200, msg: '已确认收货', data: null }
  }
  return { code: 404, msg: '订单不存在', data: null }
})

Mock.mock('/api/order/pay', 'post', (options: MockOptions) => {
  const { orderId, orderid } = JSON.parse(options.body || '{}')
  const id = orderId || orderid
  const orderList = getOrderList()
  const order = orderList.find((o) => String(o.orderId) === String(id))
  if (order) {
    order.status = 'paid'
    order.payTime = new Date().toISOString()
    saveOrderList(orderList)
    return { code: 200, msg: '支付成功', data: null }
  }
  return { code: 404, msg: '订单不存在', data: null }
})