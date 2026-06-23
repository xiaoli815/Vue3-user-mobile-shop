import request from '@/utils/request'
import type { ApiResponse, BannerListResponse, HomeDataResponse } from '@/types/index'
import type { Product } from '@/types/product'

export interface HotProductsResponse {
  list: Product[]
  total: number
}

export const getBannersList = () => {
  return request.get<BannerListResponse>('/home/banners').then(res => res.data)
}

export const getHotProducts = (params: { page: number; pageSize: number }) => {
  return request
    .get<ApiResponse<HotProductsResponse>>(`/home/hot?page=${params.page}&pageSize=${params.pageSize}`)
    .then(res => res.data)
}
