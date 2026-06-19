import Mock from 'mockjs'

// ========== 订单数据存储 ==========
const orderList: any[] = []
let orderIdCounter = 1

// ========== Mock 接口 ==========

// 订单预览（确认下单前）
Mock.mock('/api/order/pre', 'post', (options: any) => {
  const { cartIds } = JSON.parse(options.body)

  // 从 localStorage 获取购物车数据（支持带用户标识的key）
  let goodsList: any[] = []
  try {
    // 先尝试带用户标识的 key（如 cart_items_user_guest）
    let cartData = localStorage.getItem('cart_items_user_guest')
    if (!cartData) {
      // 如果没有，尝试其他可能的 key
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cart_items_'))
      if (keys.length > 0) {
        cartData = localStorage.getItem(keys[0])
      }
    }
    if (!cartData) {
      // 最后尝试不带后缀的旧 key
      cartData = localStorage.getItem('cart_items')
    }
    if (cartData) {
      const cartItems = JSON.parse(cartData)

      // 如果传入了 cartIds，筛选对应的商品
      if (cartIds && cartIds.length > 0) {
        goodsList = cartItems
          .filter((item: any) => cartIds.includes(item.cartId))
          .map((item: any) => ({
            goodsId: item.goodsId,
            skuId: item.skuId,
            name: item.name,
            image: item.image,
            price: item.price,
            count: item.count,
            specText: item.specText || '暂无规格'
          }))
      } else {
        // 如果没有传入 cartIds，返回所有选中的商品
        goodsList = cartItems
          .filter((item: any) => item.checked)
          .map((item: any) => ({
            goodsId: item.goodsId,
            skuId: item.skuId,
            name: item.name,
            image: item.image,
            price: item.price,
            count: item.count,
            specText: item.specText || '暂无规格'
          }))
      }
    }
  } catch (error) {
    console.error('读取购物车数据失败:', error)
  }
  const totalOriginalPrice = goodsList.reduce((sum, g) => sum + g.price * g.count, 0)
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

// 提交订单
Mock.mock('/api/order/submit', 'post', (options: any) => {
  const { addressId, couponId, remark } = JSON.parse(options.body)
  const now = new Date().toISOString()
  const orderId = orderIdCounter++
  const orderNo = `ORD${Date.now()}${String(orderId).padStart(4, '0')}`

  const newOrder = {
    orderId,
    orderNo,
    status: 'pending_pay',
    createTime: now,
    finalPrice: 10898,
    goodsList: [
      {
        name: 'iPhone 15 Pro Max',
        image: '/images/product/phone/product1.jpg',
        price: 8999,
        count: 1,
        specText: '曜石黑 / M'
      },
      {
        name: 'AirPods Pro 2',
        image: '/images/product/phone/product13.jpg',
        price: 1899,
        count: 1,
        specText: '白色 / 标准版'
      }
    ],
    addressId,
    couponId,
    remark,
    payTime: '',
    shipTime: '',
    confirmTime: '',
    totalOriginalPrice: 10898,
    discountPrice: 0,
    freightPrice: 0
  }

  orderList.unshift(newOrder)
  return { code: 200, msg: '下单成功', data: { orderId } }
})

// 订单列表（分页，按状态筛选）
Mock.mock('/api/order/list', 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const status = url.searchParams.get('status') || ''
  const page = Number(url.searchParams.get('page') || 1)
  const pageSize = Number(url.searchParams.get('pageSize') || 10)

  let list = [...orderList]
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

// 取消订单
Mock.mock('/api/order/cancel', 'post', (options: any) => {
  const { orderId } = JSON.parse(options.body)
  const order = orderList.find((o: any) => o.orderId === orderId)
  if (order) {
    order.status = 'cancelled'
    return { code: 200, msg: '订单已取消', data: null }
  }
  return { code: 404, msg: '订单不存在', data: null }
})

// 确认收货
Mock.mock('/api/order/confirm', 'post', (options: any) => {
  const { orderId } = JSON.parse(options.body)
  const order = orderList.find((o: any) => o.orderId === orderId)
  if (order) {
    order.status = 'completed'
    order.confirmTime = new Date().toISOString()
    return { code: 200, msg: '已确认收货', data: null }
  }
  return { code: 404, msg: '订单不存在', data: null }
})
