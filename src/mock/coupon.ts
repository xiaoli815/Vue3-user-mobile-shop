import Mock from 'mockjs'
import { getToken } from '@/utils/token'

// ============================================================
// 优惠券 Mock 数据生成规则
// ============================================================
//
// 优惠券分类（5种）：
//   平台券 — 全场通用，任何商品可用
//   品类券 — 限定品类（如手机数码、服装鞋帽）
//   品牌券 — 限定品牌（如 Apple、Adidas、李宁）
//   单品券 — 限定单件商品
//   店铺券 — 限定店铺（商品详情页带入结算页）
//
// 优惠券类型（3种）：
//   满减券 — 满 X 元减 Y 元
//   折扣券 — 打 N 折（value=90 表示 9 折）
//   无门槛券 — 无最低消费限制
//
// 叠加规则：
//   - 同类券不可叠加（同类型只能选一张优惠力度最大的）
//   - 跨类券可叠加（平台券 + 店铺券/品牌券 + 品类券 可叠加）
//   - 单品券不可与其他券叠加
// ============================================================

// 品牌名称池
const brandNames = ['Apple', '华为', '小米', 'Adidas', 'Nike', '李宁', '三星', '索尼', '戴森', '优衣库', '波司登', '大疆']

// 品类名称池
const categoryNames = ['手机数码', '服装鞋帽', '家用电器', '美妆护肤', '食品饮料', '家居家装', '母婴用品', '运动户外']

/** 生成指定范围内的随机整数 */
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

/** 生成未来 N 天后的时间戳 */
const futureDays = (days: number) => Date.now() + days * 24 * 60 * 60 * 1000

/** 生成过去 N 天前的时间戳 */
const pastDays = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000

/** 生成过期时间字符串 */
const formatExpireTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 生成指定品类下的商品 ID 列表
 * 规则：每个品类约 25 个商品，ID 从 1 开始按品类递增
 * 品类1: 商品ID 1~25, 品类2: 商品ID 26~50, ...
 */
const getProductIdsByCategory = (categoryIndex: number): number[] => {
  const start = (categoryIndex - 1) * 25 + 1
  const end = start + 24
  return Array.from({ length: 25 }, (_, i) => start + i)
}

/**
 * 生成优惠券 Vant 兼容字段
 * 将业务字段转换为 Vant CouponList 组件所需格式
 */
const toVantCoupon = (coupon: {
  id: number
  name: string
  type: string
  value: number
  minUseAmount: number
  startAt: number
  endAt: number
  expireTime: string
  isUsable: boolean
  collected?: boolean
  description?: string
  category?: string
  productIds?: number[]
  brandName?: string
  stackRule?: string
  reason?: string
}) => {
  const now = Date.now()
  const isExpired = now > coupon.endAt

  // 折扣券：discount = 折扣值 * 10（Vant 约定：9折 → discount=90）
  // 满减/无门槛券：discount = 优惠金额 * 100（Vant 约定：20元 → discount=2000）
  const discount = coupon.type === '折扣'
    ? Math.round(coupon.value * 10)      // 折扣值 90 → 900
    : coupon.value * 100                  // 优惠金额 20 → 2000

  return {
    ...coupon,
    // Vant 兼容字段
    discount,
    minOrderAmount: coupon.minUseAmount * 100, // 元 → 分
    valid: !isExpired && coupon.isUsable,
    startAt: coupon.startAt,
    endAt: coupon.endAt,
    reason: isExpired ? '已过期' : coupon.reason || ''
  }
}

// ============================================================
// 优惠券数据生成
// ============================================================

/** 生成平台券（全场通用） */
const generatePlatformCoupons = () => {
  const coupons = [
    {
      name: '新人满100减20',
      type: '满减', value: 20, minUseAmount: 100,
      startAt: pastDays(30), endAt: futureDays(180),
      description: '新用户专享全场通用券',
    },
    {
      name: '全场9折优惠券',
      type: '折扣', value: 90, minUseAmount: 0,
      startAt: pastDays(7), endAt: futureDays(90),
      description: '全场商品通用，不限品类',
    },
    {
      name: '无门槛5元券',
      type: '无门槛', value: 5, minUseAmount: 0,
      startAt: pastDays(14), endAt: futureDays(365),
      description: '无消费门槛，全场通用',
    },
    {
      name: '双11满300减50',
      type: '满减', value: 50, minUseAmount: 300,
      startAt: futureDays(30), endAt: futureDays(45), // 未来活动
      description: '双11大促专享，限时领取',
    },
    {
      name: '618满200减30',
      type: '满减', value: 30, minUseAmount: 200,
      startAt: futureDays(10), endAt: futureDays(20), // 近期活动
      description: '618年中大促，全场通用',
    },
    {
      name: '满500减60',
      type: '满减', value: 60, minUseAmount: 500,
      startAt: pastDays(60), endAt: futureDays(120),
      description: '大额消费专享优惠',
    },
    {
      name: '会员专享满1000减120',
      type: '满减', value: 120, minUseAmount: 1000,
      startAt: pastDays(30), endAt: futureDays(180),
      description: 'VIP会员专享大额优惠券',
    },
    {
      name: '无门槛10元券',
      type: '无门槛', value: 10, minUseAmount: 0,
      startAt: pastDays(7), endAt: futureDays(30),
      description: '会员专享无门槛券',
    },
    {
      name: '限时满150减25',
      type: '满减', value: 25, minUseAmount: 150,
      startAt: pastDays(1), endAt: futureDays(3), // 即将过期
      description: '限时抢购，即将过期',
    },
    {
      name: '全场8.8折',
      type: '折扣', value: 88, minUseAmount: 0,
      startAt: pastDays(14), endAt: futureDays(60),
      description: '全场通用折扣券',
    },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: i + 1,
    ...c,
    expireTime: formatExpireTime(c.endAt),
    isUsable: true,
    category: '平台券',
    productIds: [],
    stackRule: 'stackable',
    description: c.description,
  }))
}

/** 生成品类券（限定品类商品） */
const generateCategoryCoupons = () => {
  const coupons = [
    { name: '手机数码满2000减150', type: '满减', value: 150, minUseAmount: 2000, categoryIndex: 1 },
    { name: '手机数码9.5折', type: '折扣', value: 95, minUseAmount: 0, categoryIndex: 1 },
    { name: '服装鞋帽满300减40', type: '满减', value: 40, minUseAmount: 300, categoryIndex: 2 },
    { name: '服装鞋帽8.5折', type: '折扣', value: 85, minUseAmount: 0, categoryIndex: 2 },
    { name: '家用电器满500减80', type: '满减', value: 80, minUseAmount: 500, categoryIndex: 3 },
    { name: '家用电器9折', type: '折扣', value: 90, minUseAmount: 0, categoryIndex: 3 },
    { name: '美妆护肤满200减30', type: '满减', value: 30, minUseAmount: 200, categoryIndex: 4 },
    { name: '运动户外满400减50', type: '满减', value: 50, minUseAmount: 400, categoryIndex: 8 },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: 11 + i,
    name: c.name,
    type: c.type,
    value: c.value,
    minUseAmount: c.minUseAmount,
    startAt: pastDays(30),
    endAt: futureDays(90 + randInt(0, 60)),
    expireTime: formatExpireTime(futureDays(90)),
    isUsable: true,
    category: '品类券',
    productIds: getProductIdsByCategory(c.categoryIndex),
    stackRule: 'stackable',
    description: `仅限${categoryNames[c.categoryIndex - 1]}品类商品使用`,
  }))
}

/** 生成品牌券（限定品牌商品） */
const generateBrandCoupons = () => {
  const coupons = [
    { name: 'Apple品牌满2000减150', type: '满减', value: 150, minUseAmount: 2000, brandIdx: 0, productIds: [1, 9] },
    { name: '华为品牌满1000减80', type: '满减', value: 80, minUseAmount: 1000, brandIdx: 1, productIds: [2, 10] },
    { name: 'Adidas品牌满500减60', type: '满减', value: 60, minUseAmount: 500, brandIdx: 3, productIds: [27] },
    { name: 'Nike品牌满600减70', type: '满减', value: 70, minUseAmount: 600, brandIdx: 4, productIds: [26] },
    { name: '李宁品牌9折', type: '折扣', value: 90, minUseAmount: 0, brandIdx: 5, productIds: [28] },
    { name: '三星品牌满800减50', type: '满减', value: 50, minUseAmount: 800, brandIdx: 6, productIds: [6, 14] },
    { name: '戴森品牌满1500减100', type: '满减', value: 100, minUseAmount: 1500, brandIdx: 8, productIds: [53] },
    { name: '大疆品牌满2000减200', type: '满减', value: 200, minUseAmount: 2000, brandIdx: 11, productIds: [19] },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: 21 + i,
    name: c.name,
    type: c.type,
    value: c.value,
    minUseAmount: c.minUseAmount,
    startAt: pastDays(30),
    endAt: futureDays(90 + randInt(0, 60)),
    expireTime: formatExpireTime(futureDays(90)),
    isUsable: true,
    category: '品牌券',
    brandName: brandNames[c.brandIdx],
    productIds: c.productIds,
    stackRule: 'stackable',
    description: `仅限${brandNames[c.brandIdx]}品牌商品使用`,
  }))
}

/** 生成单品券（限定单件商品） */
const generateProductCoupons = () => {
  const coupons = [
    { name: 'iPhone 15 Pro Max 专属券', type: '满减', value: 100, minUseAmount: 5000, productId: 1 },
    { name: 'MacBook Air M3 专属8.5折', type: '折扣', value: 85, minUseAmount: 0, productId: 10 },
    { name: 'iPad Pro M4 专属满300减50', type: '满减', value: 50, minUseAmount: 300, productId: 9 },
    { name: '李宁超轻20 专属满300减40', type: '满减', value: 40, minUseAmount: 300, productId: 28 },
    { name: 'AirPods Pro 2 专属券', type: '满减', value: 30, minUseAmount: 100, productId: 13 },
    { name: '戴森V15 专属满200减100', type: '满减', value: 100, minUseAmount: 200, productId: 53 },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: 31 + i,
    name: c.name,
    type: c.type,
    value: c.value,
    minUseAmount: c.minUseAmount,
    startAt: pastDays(30),
    endAt: futureDays(90 + randInt(0, 60)),
    expireTime: formatExpireTime(futureDays(90)),
    isUsable: true,
    category: '单品券',
    productIds: [c.productId],
    stackRule: 'single', // 单品券不可与其他券叠加
    description: `仅限指定商品使用`,
  }))
}

/** 生成店铺券（限定店铺商品） */
const generateStoreCoupons = () => {
  const coupons = [
    { name: 'Apple官方店满500减50', type: '满减', value: 50, minUseAmount: 500, brand: 'Apple', productIds: [1, 9, 10, 13] },
    { name: 'Adidas官方店满300减30', type: '满减', value: 30, minUseAmount: 300, brand: 'Adidas', productIds: [27] },
    { name: '李宁官方店9折', type: '折扣', value: 90, minUseAmount: 0, brand: '李宁', productIds: [28] },
    { name: '华为官方店满800减60', type: '满减', value: 60, minUseAmount: 800, brand: '华为', productIds: [2, 10] },
    { name: 'Nike官方店满500减55', type: '满减', value: 55, minUseAmount: 500, brand: 'Nike', productIds: [26] },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: 41 + i,
    name: c.name,
    type: c.type,
    value: c.value,
    minUseAmount: c.minUseAmount,
    startAt: pastDays(30),
    endAt: futureDays(90 + randInt(0, 60)),
    expireTime: formatExpireTime(futureDays(90)),
    isUsable: true,
    category: '店铺券',
    brandName: c.brand,
    productIds: c.productIds,
    stackRule: 'stackable', // 店铺券可与平台券叠加
    description: `${c.brand}官方店专属`,
  }))
}

/** 生成已过期的优惠券（用于展示不可用状态） */
const generateExpiredCoupons = () => {
  const coupons = [
    { name: '元旦满200减40', type: '满减', value: 40, minUseAmount: 200, category: '平台券' },
    { name: '春节全场8折', type: '折扣', value: 80, minUseAmount: 0, category: '平台券' },
    { name: '元宵节无门槛15元', type: '无门槛', value: 15, minUseAmount: 0, category: '平台券' },
  ]

  return coupons.map((c, i) => toVantCoupon({
    id: 51 + i,
    name: c.name,
    type: c.type,
    value: c.value,
    minUseAmount: c.minUseAmount,
    startAt: pastDays(120),
    endAt: pastDays(30), // 已过期30天
    expireTime: formatExpireTime(pastDays(30)),
    isUsable: false,
    category: c.category as any,
    productIds: [],
    stackRule: 'stackable',
    description: '该优惠券已过期',
  }))
}

// ============================================================
// 汇总所有优惠券
// ============================================================
const allCoupons = [
  ...generatePlatformCoupons(),     // id 1-10
  ...generateCategoryCoupons(),     // id 11-18
  ...generateBrandCoupons(),        // id 21-28
  ...generateProductCoupons(),      // id 31-36
  ...generateStoreCoupons(),        // id 41-45
  ...generateExpiredCoupons(),      // id 51-53
]

// ============================================================
// 用户已领取的优惠券存储
// key: userId, value: 已领取的优惠券ID列表
// ============================================================
const userCollectedCoupons: Record<number, number[]> = {
  1: [2, 3, 5, 8, 12, 15, 21, 23, 31, 41, 17], // 用户1：已领取多张不同类别的券
  2: [1, 3, 6, 9, 22, 32, 42], // 用户2：已领取的券
}

// ============================================================
// Token 存储（与 user.ts 保持一致）
// ============================================================
const TOKEN_STORE_KEY = 'token_store'
let tokenStore: Record<string, number> = {}

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

const saveTokenStore = () => {
  try {
    localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(tokenStore))
  } catch (e) {
    console.error('保存 tokenStore 失败:', e)
  }
}

loadTokenStore()

/**
 * 从请求中提取用户 ID
 * 优先级：请求头 Authorization > headers.authorization > localStorage token
 */
const getUserIdFromToken = (options: any): number => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''

  if (!token) {
    token = getToken() || ''
  }

  token = token.replace('Bearer ', '')

  const userId = tokenStore[token]
  if (userId) {
    return userId
  }

  return 1 // 默认用户ID
}

/**
 * 获取当前用户的已领取优惠券ID列表
 */
const getCollectedCouponIds = (options: any): number[] => {
  const userId = getUserIdFromToken(options)
  return userCollectedCoupons[userId] || []
}

/**
 * GET /coupons/product/:productId — 获取指定商品可用的优惠券（商品详情页使用）
 * 返回：店铺券 + 品牌券 + 品类券 + 单品券（不含平台券，平台券在结算页展示）
 * 规则：优惠券的 productIds 列表中包含该商品ID即为可用
 */
Mock.mock(/\/coupons\/product\/\d+/, 'get', (options: any) => {
  // 从 URL 路径中提取 productId
  const match = options.url.match(/\/coupons\/product\/(\d+)/)
  const productId = match ? parseInt(match[1]) : 0

  if (!productId) {
    return { code: 400, message: '缺少商品ID', data: [] }
  }

  const collectedIds = getCollectedCouponIds(options)
  const now = Date.now()

  // 过滤：排除平台券（productIds 为空），匹配商品ID，未过期
  const productCoupons = allCoupons.filter(coupon => {
    // 平台券 productIds 为空数组，不适合商品详情页展示
    if (coupon.category === '平台券') return false
    // 单品券/品牌券/品类券/店铺券：productIds 中包含该商品ID即为适用
    if (!coupon.productIds || coupon.productIds.length === 0) return false
    if (!coupon.productIds.includes(productId)) return false
    // 未过期
    if (now > coupon.endAt) return false
    return true
  }).map(coupon => ({
    ...coupon,
    collected: collectedIds.includes(coupon.id),
  }))

  return {
    code: 200,
    message: 'success',
    data: productCoupons
  }
})

// ============================================================
// Mock 接口注册
// ============================================================

/**
 * GET /coupons/list — 获取所有优惠券列表（优惠券中心展示）
 * 返回所有优惠券，根据用户是否领取标记 collected 状态
 */
Mock.mock(/\/coupons\/list/, 'get', (options: any) => {
  const collectedIds = getCollectedCouponIds(options)
  return {
    code: 200,
    message: 'success',
    data: allCoupons.map(coupon => ({
      ...coupon,
      collected: collectedIds.includes(coupon.id),
    }))
  }
})

/**
 * GET /coupons/available — 获取可用优惠券（结算页使用）
 * 参数：amount (订单金额，元)
 * 返回：当前用户已领取且可用的优惠券（过滤掉已过期/不满足门槛的）
 */
Mock.mock(/\/coupons\/available/, 'get', (options: any) => {
  const collectedIds = getCollectedCouponIds(options)

  // 解析 URL 参数中的 amount
  const url = new URL(options.url, 'http://localhost')
  const amount = parseFloat(url.searchParams.get('amount') || '0')

  const now = Date.now()

  // 过滤：已领取 + 未过期 + 可用 + 满足门槛
  const available = allCoupons.filter(coupon => {
    if (!collectedIds.includes(coupon.id)) return false
    if (now > coupon.endAt) return false
    if (!coupon.isUsable) return false
    if (amount < coupon.minUseAmount) return false
    return true
  })

  return {
    code: 200,
    message: 'success',
    data: available
  }
})

/**
 * POST /coupons/collect — 领取优惠券
 * 参数：{ id: number }
 * 返回：领取结果
 */
Mock.mock(/\/coupons\/collect/, 'post', (options: any) => {
  const body = JSON.parse(options.body || '{}')
  const userId = getUserIdFromToken(options)

  if (!body.id) {
    return { code: 400, message: '缺少优惠券ID', data: null }
  }

  const coupon = allCoupons.find(c => c.id === body.id)
  if (!coupon) {
    return { code: 404, message: '优惠券不存在', data: null }
  }

  const now = Date.now()
  if (now > coupon.endAt) {
    return { code: 400, message: '优惠券已过期', data: null }
  }

  // 初始化用户领取记录
  if (!userCollectedCoupons[userId]) {
    userCollectedCoupons[userId] = []
  }

  if (userCollectedCoupons[userId].includes(body.id)) {
    return { code: 400, message: '已领取过该优惠券', data: null }
  }

  userCollectedCoupons[userId].push(body.id)
  return { code: 200, message: '领取成功', data: null }
})

/**
 * GET /coupons/my — 获取我的优惠券（已领取的）
 * 返回：当前用户已领取的所有优惠券
 */
Mock.mock(/\/coupons\/my/, 'get', (options: any) => {
  const collectedIds = getCollectedCouponIds(options)
  const myCoupons = allCoupons.filter(c => collectedIds.includes(c.id))
  return {
    code: 200,
    message: 'success',
    data: myCoupons.map(c => ({ ...c, collected: true }))
  }
})

/**
 * POST /coupons/use — 使用优惠券
 * 参数：{ id: number, orderId: string }
 * 返回：使用结果
 */
Mock.mock(/\/coupons\/use/, 'post', (options: any) => {
  const body = JSON.parse(options.body || '{}')
  const userId = getUserIdFromToken(options)

  if (!body.id) {
    return { code: 400, message: '缺少优惠券ID', data: null }
  }

  const collected = userCollectedCoupons[userId] || []
  if (!collected.includes(body.id)) {
    return { code: 400, message: '未领取该优惠券', data: null }
  }

  // 从已领取列表中移除（表示已使用）
  userCollectedCoupons[userId] = collected.filter(id => id !== body.id)

  return { code: 200, message: '使用成功', data: null }
})

/**
 * POST /coupons/batch-collect — 批量领取优惠券
 * 参数：{ ids: number[] }
 */
Mock.mock(/\/coupons\/batch-collect/, 'post', (options: any) => {
  const body = JSON.parse(options.body || '{}')
  const userId = getUserIdFromToken(options)

  if (!body.ids || !Array.isArray(body.ids)) {
    return { code: 400, message: '缺少优惠券ID列表', data: null }
  }

  if (!userCollectedCoupons[userId]) {
    userCollectedCoupons[userId] = []
  }

  body.ids.forEach((id: number) => {
    if (!userCollectedCoupons[userId].includes(id)) {
      userCollectedCoupons[userId].push(id)
    }
  })

  return { code: 200, message: '批量领取成功', data: null }
})

// 导出供其他模块使用
export { allCoupons, userCollectedCoupons }