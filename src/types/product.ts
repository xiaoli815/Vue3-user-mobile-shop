import type { ApiResponse } from './api'

export interface SpecItem {
  name: string
  value: string
}

export interface Sku {
  id: number
  productId: number
  specs: SpecItem[]
  price: number
  stock: number
  image: string
}

export interface SkuListItem {
  skuId: number
  price?: number
  seckillPrice?: number
  stock?: number
  remainStock?: number
  specs: { specName: string; specValue: string }[]
}

 export interface skuProduct {
  id?: number
  seckillId?: number
  name?: string
  title?: string
  image: string
  price?: number
  seckillPrice?: number
  stock?: number
  remainStock?: number
  limitCount?: number
  skus?: Sku[]
  skuList?: { skuId: number; price?: number; seckillPrice?: number; stock?: number; remainStock?: number; specs: { specName: string; specValue: string }[] }[]
}

export interface Product {
  id: number
  spuId?: number
  name: string
  desc: string
  description?: string
  price: number
  originalPrice: number
  sales: number
  salesCount?: number
  stock: number
  image: string
  images: string[]
  mainImages?: string[]
  categoryId: number
  tags: string[]
  isFlashSale: boolean
  flashSalePrice?: number
  isFavorite: boolean
  detail: string
  content?: string
  skus: Sku[]
  skuList?: SkuListItem[]
}

export type ProductListResponse = ApiResponse<{
  list: Product[]
  total: number
}>

export type ProductDetailResponse = ApiResponse<Product | null>

export type FavoriteResponse = boolean

export type FavoritesListResponse = ApiResponse<Product[]>