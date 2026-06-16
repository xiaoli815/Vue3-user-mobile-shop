import { ApiResponse } from '@/types/index'

export interface SeckillItem {
  seckillId: number
  title: string
  image: string
  seckillPrice: number
  originalPrice: number
  description: string
  mainImages: string[]
  startTime: string
  endTime: string
  totalStock: number
  remainStock: number
  goodsId: number
  soldCount: number
  status: number
  limitCount: number
  skuList: SeckillSku[]
}

export interface SeckillSku {
  skuId: number
  specs: { specName: string; specValue: string }[]
  seckillPrice: number
  remainStock: number
}

export interface TimeSlot {
  label: string
  hour: number
  status: string
}

export type SeckillListResponse = ApiResponse<SeckillItem[]>
export type SeckillProductDetailResponse = ApiResponse<SeckillItem>
