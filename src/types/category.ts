import type { ApiResponse } from './api'
import type { Product } from './product'

export interface Category {
  id: number
  name: string
  icon?: string
  children?: Category[]
  pid?: number
}

export type CategoryListResponse = ApiResponse<Category[]>

export type CategoryGoodsResponse = ApiResponse<{
  list: Product[]
  total: number
  page: number
  pageSize: number
}>