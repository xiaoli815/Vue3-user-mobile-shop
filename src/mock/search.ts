import Mock from 'mockjs'
import type { MockOptions } from './index'
import { productList } from './product'
import type { Product } from '../types/product'

interface SearchSuggestion {
  keyword: string
  count: number
}

Mock.mock(/\/api\/search\/suggestions/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const keyword = url.searchParams.get('keyword') || ''

  if (!keyword.trim()) {
    return { code: 200, msg: 'success', data: [] }
  }

  // 从真实商品中按名称或描述匹配，取前5条作为搜索建议
  const matched = productList
    .filter(p => p.name.includes(keyword) || p.desc.includes(keyword))
    .slice(0, 5)

  const suggestions: SearchSuggestion[] = matched.map(p => ({
    keyword: p.name,
    count: p.sales
  }))

  return { code: 200, msg: 'success', data: suggestions }
})

Mock.mock(/\/api\/search\/products/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const keyword = url.searchParams.get('keyword') || ''
  const page = Number(url.searchParams.get('page')) || 1
  const pageSize = Number(url.searchParams.get('pageSize')) || 20

  if (!keyword.trim()) {
    return { code: 200, msg: 'success', data: { list: [], total: 0 } }
  }

  // 按商品名称或描述筛选真实商品
  const filtered: Product[] = productList.filter(
    p => p.name.includes(keyword) || p.desc.includes(keyword)
  )

  const total = filtered.length
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return { code: 200, msg: 'success', data: { list, total } }
})