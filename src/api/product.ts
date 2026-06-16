import request from '@/utils/request'
import type { ProductListResponse, ProductDetailResponse } from '@/types/product'
import type { Product } from '@/types/product'

// 支持搜索和筛选
export const getProductList = (keyword: string) => {
  return request.get<ProductListResponse>('/products', { params: { keyword } })
}

// 获取商品详情
export const getProductDetail = (goodsId: number): Promise<Product | null> => {
  return request.get<ProductDetailResponse>(`/goods/detail/`, { params: { goodsId: goodsId } }).then(res => res.data) as unknown as Promise<Product | null>
}

// 获取单个商品
export const getProduct = (id: string): Promise<Product | null> => {
  return request.get<ProductDetailResponse>(`/products/${id}`).then(res => res.data) as unknown as Promise<Product | null>
}

// 收藏或取消收藏
export const toggleFavorite = (id: number) => {
  return request.post<{ code: number; msg: string; data: boolean }>(`/products/${id}/favorite`).then(res => res.data)
}

export const getFavorites = () => {
  return request.get<{ code: number; msg: string; data: Product[] }>('/favorites').then(res => res.data)
}