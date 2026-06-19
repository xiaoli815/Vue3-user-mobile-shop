import type { ApiResponse } from './api'
import type { Product } from './product'

export interface Banner {
  id: number
  imageUrl: string
  link: string
}

export interface HomeBlock {
  id: number
  name: string
  coverImage: string
  categoryId: number
}

export interface HotData {
  hotProducts: Product[]
}

// 分类导航
export interface CategoryItem {
  id: number
  name: string
  icon?: string
}

export type BannerListResponse = ApiResponse<Banner[]>

export type HomeDataResponse = ApiResponse<HomeBlock[]>
