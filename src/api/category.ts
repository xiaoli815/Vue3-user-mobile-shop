import request from '@/utils/request'
import { CategoryListResponse, CategoryGoodsResponse } from '@/types/index'

export const getCategoryList = () => {
  return request.get<CategoryListResponse>('/category/list').then(res => res.data)
}

export const getCategoryGoods = (params: {
  categoryId: number
  page?: number
  pageSize?: number
}) => {
  return request.get<CategoryGoodsResponse>('/category/goods', { params }).then(res => res.data)
}
