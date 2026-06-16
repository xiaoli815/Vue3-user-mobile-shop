import Mock from 'mockjs'

// ========== 优惠券数据 ==========
const couponList: any[] = [
  // ===== 平台券（全场通用） =====
  {
    id: 1,
    name: '新人满100减20',
    type: '满减',
    value: 20,
    minUseAmount: 100,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '新用户专享',
    category: '平台券',
    productIds: []
  },
  {
    id: 2,
    name: '全场9折优惠券',
    type: '折扣',
    value: 90,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '全场商品通用',
    category: '平台券',
    productIds: []
  },
  {
    id: 3,
    name: '无门槛5元券',
    type: '无门槛',
    value: 5,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '无消费门槛',
    category: '平台券',
    productIds: []
  },
  {
    id: 4,
    name: '满500减50',
    type: '满减',
    value: 50,
    minUseAmount: 500,
    expireTime: '2026-06-30 23:59:59',
    isUsable: true,
    description: '大额消费专享',
    category: '平台券',
    productIds: []
  },
  // ===== 品类券 =====
  {
    id: 5,
    name: '手机数码满2000减100',
    type: '满减',
    value: 100,
    minUseAmount: 2000,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限手机数码品类商品使用',
    category: '品类券',
    productIds: [1, 9, 17, 25]
  },
  {
    id: 6,
    name: '服装鞋帽满300减30',
    type: '满减',
    value: 30,
    minUseAmount: 300,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限服装鞋帽品类商品使用',
    category: '品类券',
    productIds: [2, 10, 18, 26]
  },
  {
    id: 7,
    name: '家用电器8.5折',
    type: '折扣',
    value: 85,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限家用电器品类商品使用',
    category: '品类券',
    productIds: [3, 11, 19, 27]
  },
  // ===== 品牌券 =====
  {
    id: 8,
    name: 'Apple品牌满1000减60',
    type: '满减',
    value: 60,
    minUseAmount: 1000,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限Apple品牌商品使用',
    category: '品牌券',
    brandName: 'Apple',
    productIds: [1]
  },
  {
    id: 9,
    name: 'Adidas品牌满500减40',
    type: '满减',
    value: 40,
    minUseAmount: 500,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限Adidas品牌商品使用',
    category: '品牌券',
    brandName: 'Adidas',
    productIds: [2]
  },
  {
    id: 10,
    name: '李宁品牌9折',
    type: '折扣',
    value: 90,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限李宁品牌商品使用',
    category: '品牌券',
    brandName: '李宁',
    productIds: [18]
  },
  // ===== 单品券 =====
  {
    id: 11,
    name: 'iPhone 15 Pro Max 专属券',
    type: '满减',
    value: 50,
    minUseAmount: 100,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限iPhone 15 Pro Max使用',
    category: '单品券',
    productIds: [1]
  },
  {
    id: 12,
    name: 'iPad Pro M4 专属8折',
    type: '折扣',
    value: 80,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限iPad Pro M4使用',
    category: '单品券',
    productIds: [9]
  },
  {
    id: 13,
    name: '李宁超轻20 满300减40',
    type: '满减',
    value: 40,
    minUseAmount: 300,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '仅限李宁超轻20跑鞋使用',
    category: '单品券',
    productIds: [18]
  },
  // ===== 已过期券 =====
  {
    id: 14,
    name: '指定商品8折',
    type: '折扣',
    value: 80,
    minUseAmount: 0,
    expireTime: '2026-01-15 23:59:59',
    isUsable: false,
    description: '部分商品可用',
    category: '平台券',
    productIds: []
  },
  {
    id: 15,
    name: '满200减30',
    type: '满减',
    value: 30,
    minUseAmount: 200,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '限时优惠',
    category: '平台券',
    productIds: []
  },
  {
    id: 16,
    name: '无门槛10元券',
    type: '无门槛',
    value: 10,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '会员专享',
    category: '平台券',
    productIds: []
  },
  {
    id: 17,
    name: '满1000减100',
    type: '满减',
    value: 100,
    minUseAmount: 1000,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: 'VIP专享大额券',
    category: '平台券',
    productIds: []
  },
  // ===== 店铺券 =====
  {
    id: 18,
    name: 'Apple官方店满500减40',
    type: '满减',
    value: 40,
    minUseAmount: 500,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: 'Apple官方店专属',
    category: '店铺券',
    brandName: 'Apple',
    productIds: [1]
  },
  {
    id: 19,
    name: 'Adidas官方店满300减20',
    type: '满减',
    value: 20,
    minUseAmount: 300,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: 'Adidas官方店专属',
    category: '店铺券',
    brandName: 'Adidas',
    productIds: [2]
  },
  {
    id: 20,
    name: '李宁运动旗舰店9折',
    type: '折扣',
    value: 90,
    minUseAmount: 0,
    expireTime: '2026-12-31 23:59:59',
    isUsable: true,
    description: '李宁运动旗舰店专属',
    category: '店铺券',
    brandName: '李宁',
    productIds: [18]
  }
]

// 用户已领取的优惠券存储结构: { userId: [couponIds] }
const userCollectedCoupons: Record<number, number[]> = {
  1: [2, 3, 5, 8, 12],   // 用户1已领取的优惠券ID
  2: [1, 3, 6, 9]         // 用户2已领取的优惠券ID
}

// token 存储（需要和 user.ts 保持一致）
const TOKEN_STORE_KEY = 'token_store'
let tokenStore: Record<string, number> = {}

// 从 localStorage 加载 tokenStore
const loadTokenStore = () => {
  try {
    const data = localStorage.getItem(TOKEN_STORE_KEY)
    if (data) {
      tokenStore = JSON.parse(data)
    }
  } catch (e) {
    console.error('加载 tokenStore 失败:', e)
    tokenStore = {}
  }
}

// 保存 tokenStore 到 localStorage
const saveTokenStore = () => {
  try {
    localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(tokenStore))
  } catch (e) {
    console.error('保存 tokenStore 失败:', e)
  }
}

// 初始化时加载 tokenStore
loadTokenStore()

// 从请求头中获取用户ID
const getUserIdFromToken = (options: any): number => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''
  
  // 如果请求头没有 token，尝试从 localStorage 获取
  if (!token) {
    token = localStorage.getItem('token') || ''
  }
  
  // 去掉 'Bearer ' 前缀
  token = token.replace('Bearer ', '')
  
  // 尝试从 tokenStore 中获取 userId
  const userId = tokenStore[token]
  if (userId) {
    return userId
  }
  
  // 如果 tokenStore 中没有，尝试用正则解析（兼容性处理）
  const match = token.match(/token_(\d+)_/)
  if (match) {
    return parseInt(match[1])
  }
  
  // 如果都没有，返回 0（匿名用户）
  return 0
}

// 获取用户已领取的优惠券列表
const getUserCollectedCouponIds = (userId: number): number[] => {
  return userCollectedCoupons[userId] || []
}

// 保存用户领取的优惠券
const saveUserCollectedCoupon = (userId: number, couponId: number) => {
  if (!userCollectedCoupons[userId]) {
    userCollectedCoupons[userId] = []
  }
  if (!userCollectedCoupons[userId].includes(couponId)) {
    userCollectedCoupons[userId].push(couponId)
  }
}

// ========== Mock 接口 ==========

// 获取所有优惠券列表（活动页展示）
Mock.mock('/api/coupons/list', 'get', (options: any) => {
  const userId = getUserIdFromToken(options)
  const collectedIds = getUserCollectedCouponIds(userId)
  
  const coupons = couponList.map(coupon => {
    const expireDate = new Date(coupon.expireTime).getTime()
    const startDate = new Date('2026-01-01').getTime()
    
    let discount = coupon.value
    // 折扣券：value是折扣率（如90表示9折），满减券：value是金额（元）
    if (coupon.type === '折扣') {
      discount = coupon.value
    } else {
      discount = coupon.value * 100
    }
    
    return {
      id: coupon.id,
      name: coupon.name,
      type: coupon.type,
      discount: discount,
      minOrderAmount: coupon.minUseAmount * 100,
      startAt: startDate,
      endAt: expireDate,
      reason: coupon.isUsable ? '' : '已过期',
      valid: coupon.isUsable,
      collected: collectedIds.includes(coupon.id),
      description: coupon.description,
      category: coupon.category || '平台券',
      productIds: coupon.productIds || [],
      brandName: coupon.brandName || ''
    }
  })
  
  return { code: 200, msg: 'success', data: coupons }
})

// 获取可用优惠券（根据订单金额筛选）
Mock.mock('/api/coupons/available', 'get', (options: any) => {
  const userId = getUserIdFromToken(options)
  const collectedIds = getUserCollectedCouponIds(userId)
  
  const amount = parseInt(options.url.split('=')[1]) || 0
  const availableCoupons = couponList.filter(coupon => {
    return coupon.isUsable && coupon.minUseAmount <= amount
  }).map(coupon => {
    const expireDate = new Date(coupon.expireTime).getTime()
    const startDate = new Date('2026-01-01').getTime()
    
    let discount = coupon.value
    if (coupon.type === '折扣') {
      discount = coupon.value
    } else {
      discount = coupon.value * 100
    }
    
    return {
      id: coupon.id,
      name: coupon.name,
      type: coupon.type,
      discount: discount,
      minOrderAmount: coupon.minUseAmount * 100,
      startAt: startDate,
      endAt: expireDate,
      reason: coupon.isUsable ? '' : '已过期',
      valid: coupon.isUsable,
      collected: collectedIds.includes(coupon.id),
      description: coupon.description,
      category: coupon.category || '平台券',
      productIds: coupon.productIds || [],
      brandName: coupon.brandName || ''
    }
  })
  
  return { code: 200, msg: 'success', data: availableCoupons }
})

// 领取优惠券（需要登录）
Mock.mock('/api/coupons/collect', 'post', (options: any) => {
  const userId = getUserIdFromToken(options)
  
  // 验证用户是否登录
  if (userId === 0) {
    return { code: 401, msg: '请先登录' }
  }
  
  const body = JSON.parse(options.body)
  const couponId = body.id
  
  const coupon = couponList.find(c => c.id === couponId)
  if (!coupon) {
    return { code: 404, msg: '优惠券不存在' }
  }
  
  if (!coupon.isUsable) {
    return { code: 400, msg: '该优惠券已过期或不可用' }
  }
  
  const collectedIds = getUserCollectedCouponIds(userId)
  if (collectedIds.includes(couponId)) {
    return { code: 400, msg: '您已领取过该优惠券' }
  }
  
  saveUserCollectedCoupon(userId, couponId)
  
  return { code: 200, msg: '领取成功', data: null }
})

// 获取我的优惠券列表（需要登录）
Mock.mock('/api/coupons/my', 'get', (options: any) => {
  const userId = getUserIdFromToken(options)
  
  // 验证用户是否登录
  if (userId === 0) {
    return { code: 401, msg: '请先登录' }
  }
  
  const collectedIds = getUserCollectedCouponIds(userId)
  const myCoupons = couponList
    .filter(coupon => collectedIds.includes(coupon.id))
    .map(coupon => ({
      ...coupon,
      collected: true
    }))
  
  return { code: 200, msg: 'success', data: myCoupons }
})

// 使用优惠券
Mock.mock('/api/coupons/use', 'post', (options: any) => {
  const userId = getUserIdFromToken(options)
  
  // 验证用户是否登录
  if (userId === 0) {
    return { code: 401, msg: '请先登录' }
  }
  
  const body = JSON.parse(options.body)
  const couponId = body.id
  
  const coupon = couponList.find(c => c.id === couponId)
  if (!coupon) {
    return { code: 404, msg: '优惠券不存在' }
  }
  
  const collectedIds = getUserCollectedCouponIds(userId)
  if (!collectedIds.includes(couponId)) {
    return { code: 400, msg: '您还未领取该优惠券' }
  }
  
  if (!coupon.isUsable) {
    return { code: 400, msg: '该优惠券已过期或不可用' }
  }
  
  return { code: 200, msg: '使用成功', data: null }
})

// 批量领取优惠券（需要登录）
Mock.mock('/api/coupons/batch-collect', 'post', (options: any) => {
  const userId = getUserIdFromToken(options)
  
  // 验证用户是否登录
  if (userId === 0) {
    return { code: 401, msg: '请先登录' }
  }
  
  const body = JSON.parse(options.body)
  const ids = body.ids || []
  
  const successIds: number[] = []
  const failedIds: number[] = []
  
  ids.forEach((couponId: number) => {
    const coupon = couponList.find(c => c.id === couponId)
    if (!coupon) {
      failedIds.push(couponId)
      return
    }
    
    if (!coupon.isUsable) {
      failedIds.push(couponId)
      return
    }
    
    const collectedIds = getUserCollectedCouponIds(userId)
    if (collectedIds.includes(couponId)) {
      failedIds.push(couponId)
      return
    }
    
    saveUserCollectedCoupon(userId, couponId)
    successIds.push(couponId)
  })
  
  if (successIds.length > 0 && failedIds.length === 0) {
    return { code: 200, msg: '全部领取成功', data: null }
  } else if (successIds.length > 0 && failedIds.length > 0) {
    return { code: 200, msg: `成功领取 ${successIds.length} 张，${failedIds.length} 张领取失败`, data: null }
  } else {
    return { code: 400, msg: '全部领取失败', data: null }
  }
})

// 获取指定商品可用的店铺券/品牌券/品类券/单品券（不含平台券）
Mock.mock(/\/api\/coupons\/product\/(\d+)/, 'get', (options: any) => {
  const userId = getUserIdFromToken(options)
  const collectedIds = getUserCollectedCouponIds(userId)
  const productId = parseInt(options.url.match(/\/api\/coupons\/product\/(\d+)/)[1])

  const productCoupons = couponList.filter(coupon => {
    // 平台券不在此处显示（在结算页展示）
    if (coupon.category === '平台券') return false
    if (!coupon.isUsable) return false
    // 店铺券/品牌券/品类券/单品券：检查 productIds 是否包含该商品
    if (coupon.productIds && coupon.productIds.length > 0) {
      return coupon.productIds.includes(productId)
    }
    return false
  }).map(coupon => {
    const expireDate = new Date(coupon.expireTime).getTime()
    const startDate = new Date('2026-01-01').getTime()
    
    let discount = coupon.value
    if (coupon.type === '折扣') {
      discount = coupon.value
    } else {
      discount = coupon.value * 100
    }
    
    return {
      id: coupon.id,
      name: coupon.name,
      type: coupon.type,
      discount: discount,
      minOrderAmount: coupon.minUseAmount * 100,
      startAt: startDate,
      endAt: expireDate,
      reason: coupon.isUsable ? '' : '已过期',
      valid: coupon.isUsable,
      collected: collectedIds.includes(coupon.id),
      description: coupon.description,
      category: coupon.category || '品牌券',
      productIds: coupon.productIds || [],
      brandName: coupon.brandName || ''
    }
  })

  return { code: 200, msg: 'success', data: productCoupons }
})