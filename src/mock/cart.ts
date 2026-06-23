import Mock from 'mockjs'
import type { CartItem } from '../types/cart'
import type { MockOptions } from './index'

const memoryStorage = new Map<string, string>()

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key)
  }
  return memoryStorage.get(key) || null
}

function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value)
  } else {
    memoryStorage.set(key, value)
  }
}

function getStorageKey(): string {
  try {
    const token = getItem('token')
    const userId = getItem('user_id')
    if (token && userId) {
      return `cart_items_user_${userId}`
    }
  } catch {
    /* ignore */
  }
  return 'cart_items_anonymous'
}

function getCartData(): CartItem[] {
  try {
    const data = getItem(getStorageKey())
    if (data) {
      return JSON.parse(data) as CartItem[]
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveCartData(data: CartItem[]) {
  setItem(getStorageKey(), JSON.stringify(data))
}

Mock.mock('/api/cart', 'get', () => {
  const cartData = getCartData()
  return { code: 200, msg: 'success', data: cartData }
})

Mock.mock('/api/cart/add', 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  const { skuId, goodsId, count, name, image, price, specText } = body

  const cartData = getCartData()

  if (skuId && goodsId) {
    const exist = cartData.find(item => item.skuId === skuId && item.goodsId === goodsId)
    if (exist) {
      exist.count = (exist.count || 0) + (count || 1)
    } else {
      const maxId = Math.max(...cartData.map(item => item.cartId || 0), 0)
      cartData.push({
        cartId: maxId + 1,
        skuId,
        goodsId,
        count: count || 1,
        checked: true,
        name: name || '',
        image: image || '',
        price: price || 0,
        specText: specText || ''
      })
    }
    saveCartData(cartData)
    return { code: 200, msg: '加入购物车成功', data: null }
  }

  return { code: 400, msg: '参数错误', data: null }
})

Mock.mock('/api/cart/clear', 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  const { ids } = body

  let cartData = getCartData()

  if (ids && ids.length) {
    cartData = cartData.filter(i => !ids.includes(Number(i.cartId)))
  } else {
    cartData = []
  }
  saveCartData(cartData)
  return { code: 200, msg: '操作成功', data: null }
})

Mock.mock('/api/cart/update', 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  const { cartId, count, checked } = body

  const cartData = getCartData()
  const item = cartData.find(i => i.cartId === cartId)
  if (item) {
    if (count !== undefined) item.count = count
    if (checked !== undefined) item.checked = checked
    saveCartData(cartData)
  }
  return { code: 200, msg: '操作成功', data: null }
})

Mock.mock('/api/cart/delete', 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  const { ids } = body

  let cartData = getCartData()
  cartData = cartData.filter(i => !ids.includes(Number(i.cartId)))
  saveCartData(cartData)
  return { code: 200, msg: '删除成功', data: null }
})