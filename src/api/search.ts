import request from '@/utils/request'
import type { Product } from '@/types/index'

export interface SearchSuggestion {
  keyword: string
  count: number
}

/** 搜索建议（防抖调用） */
export function getSearchSuggestions(keyword: string): Promise<SearchSuggestion[]> {
  return request.get('/search/suggestions', { params: { keyword } })
}

/** 搜索商品 */
export function searchProducts(keyword: string, page = 1, pageSize = 20): Promise<{ list: Product[]; total: number }> {
  return request.get('/search/products', { params: { keyword, page, pageSize } })
}