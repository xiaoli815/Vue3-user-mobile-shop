import request from '@/utils/request'
import type {
  SeckillListResponse,
  SeckillProductDetailResponse,
  SeckillItem
} from '@/types/seckill'

// 获取秒杀商品列表
export const getSeckillList = () => {
  return request.get<SeckillListResponse>('/seckill/list')
}

// 获取秒杀商品详情
export const getSeckillProductDetail = (seckillId: number): Promise<SeckillItem> => {
  return request
    .get<SeckillProductDetailResponse>('/seckill/detail', { params: { seckillId } })
    .then(res => res.data) as unknown as Promise<SeckillItem>
}
