import Mock from 'mockjs'
import { productList } from './product'

// ========== Mock 接口 ==========

// 获取商品详情（支持带斜杠和不带斜杠的URL）
Mock.mock(/\/api\/goods\/detail\/?/, 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const goodsId = Number(url.searchParams.get('goodsId') || 0)

  const product = productList.find((p: any) => p.id === goodsId)
  if (!product) {
    return { code: 404, msg: '商品不存在', data: null }
  }

  // 转换为 goods/detail 需要的格式
  const data = {
    id: product.id,
    spuId: product.id,
    name: product.name,
    description: product.desc,
    price: product.price,
    originalPrice: product.originalPrice,
    salesCount: product.sales,
    stock: product.stock,
    image: product.image,
    mainImages: product.images,
    skuList: product.skus.map((sku: any) => ({
      skuId: sku.id,
      price: sku.price,
      stock: sku.stock,
      specs: sku.specs.map((s: any) => ({ specName: s.name, specValue: s.value }))
    })),
    content: product.detail || '',
    categoryId: product.categoryId,
    tags: product.tags,
    isFlashSale: product.isFlashSale,
    flashSalePrice: product.flashSalePrice || 0
  }

  return { code: 200, msg: 'success', data }
})