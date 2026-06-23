import Mock from 'mockjs'
import type { MockOptions } from './index'

interface SearchSuggestion {
  keyword: string
  count: number
}

interface SearchProduct {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
  tags: string[]
}

Mock.mock(/\/api\/search\/suggestions/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const keyword = url.searchParams.get('keyword') || ''

  if (!keyword.trim()) {
    return { code: 200, msg: 'success', data: [] }
  }

  const suggestions: SearchSuggestion[] = [
    { keyword: `${keyword}手机`, count: 1234 },
    { keyword: `${keyword}电脑`, count: 890 },
    { keyword: `${keyword}耳机`, count: 567 },
    { keyword: `${keyword}充电器`, count: 345 },
    { keyword: `${keyword}数据线`, count: 234 },
  ]

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

  const total = 50
  const start = (page - 1) * pageSize
  const end = Math.min(start + pageSize, total)

  const list: SearchProduct[] = Array.from({ length: end - start }, (_, i) => ({
    id: 1000 + start + i,
    name: `${keyword}商品${start + i + 1}`,
    price: Mock.Random.float(9, 999, 2, 2),
    originalPrice: Mock.Random.float(19, 1999, 2, 2),
    image: `https://picsum.photos/seed/search${start + i}/300/300`,
    sales: Mock.Random.integer(100, 9999),
    tags: ['热销', '推荐'].slice(0, Mock.Random.integer(1, 2)),
  }))

  return { code: 200, msg: 'success', data: { list, total } }
})