import Mock from 'mockjs'
import { productList } from './product'
import type { MockOptions } from './index'
import type { Product } from '../types/product'

Mock.mock(/\/api\/goods\/detail\/?/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const goodsId = Number(url.searchParams.get('goodsId') || 0)

  const product = productList.find((p: Product) => p.id === goodsId)
  if (!product) {
    return { code: 404, msg: '商品不存在', data: null }
  }

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
    skuList: product.skus.map((sku) => ({
      skuId: sku.id,
      price: sku.price,
      stock: sku.stock,
      specs: sku.specs.map((s) => ({ specName: s.name, specValue: s.value }))
    })),
    content: product.detail || '',
    categoryId: product.categoryId,
    tags: product.tags,
    isFlashSale: product.isFlashSale,
    flashSalePrice: product.flashSalePrice || 0
  }

  return { code: 200, msg: 'success', data }
})
