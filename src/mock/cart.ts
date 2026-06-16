import Mock from 'mockjs'

// ========== 购物车数据存储 ==========
let cartData: any[] = []
let cartIdCounter = 1

// ========== Mock 接口 ==========

// 获取购物车列表 (匹配 GET /cart)
Mock.mock('/api/cart', 'get', () => {
  const list = cartData.map(item => ({
    cartId: item.cartId || item.id,
    skuId: item.skuId || 0,
    goodsId: item.productId || item.goodsId || 0,
    name: item.productName || item.name || '',
    image: item.productImage || item.image || '',
    price: item.price || 0,
    specText: item.specs ? item.specs.map((s: any) => s.value).join(' / ') : (item.specText || ''),
    count: item.quantity || item.count || 1,
    stock: item.stock || 999,
    checked: item.checked !== undefined ? item.checked : item.isChecked || true
  }))
  return { code: 200, msg: 'success', data: list }
})

// 加入购物车 (匹配 POST /cart/add)
Mock.mock('/api/cart/add', 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const { skuId, goodsId, count } = body

  if (skuId && goodsId) {
    const exist = cartData.find(item => item.skuId === skuId && item.goodsId === goodsId)
    if (exist) {
      exist.count = (exist.count || 0) + (count || 1)
    } else {
      cartData.push({
        cartId: cartIdCounter++,
        skuId,
        goodsId,
        count: count || 1,
        checked: true,
        name: body.name || '',
        image: body.image || '',
        price: body.price || 0,
        specText: body.specText || ''
      })
    }
    return { code: 200, msg: '加入购物车成功', data: null }
  }

  // 旧格式兼容
  const exist = cartData.find((item: any) => item.id === body.id)
  if (exist) {
    exist.quantity = (exist.quantity || 0) + (body.quantity || 1)
  } else {
    cartData.push({ ...body, checked: true })
  }
  return { code: 200, msg: 'success', data: null }
})

// 清空购物车 (匹配 POST /cart/clear)
Mock.mock('/api/cart/clear', 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const { ids } = body
  
  if (ids && ids.length) {
    // 删除指定的商品
    cartData = cartData.filter(i => !ids.includes(Number(i.cartId)))
  } else {
    // 清空所有
    cartData = []
  }
  return { code: 200, msg: '操作成功', data: null }
})
