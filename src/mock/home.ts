import Mock from 'mockjs'
import { productList } from './product'

const banners = [
  { id: 1, imageUrl: './images/banner1.jpg', link: '/product/list?category=1' },
  { id: 2, imageUrl: './images/banner2.jpg', link: '/product/list?category=2' },
  { id: 3, imageUrl: './images/banner3.jpg', link: '/product/list?category=3' },
  { id: 4, imageUrl: './images/banner4.jpg', link: '/flash' }
]

Mock.mock('/api/home/banners', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: banners
  }
})

Mock.mock(/\/api\/home\/hot/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = Math.max(Number(url.searchParams.get('page')) || 1, 1)
  const pageSize = Math.min(Math.max(Number(url.searchParams.get('pageSize')) || 10, 1), 20)
  const hotList = [...productList].sort((a, b) => b.sales - a.sales)
  const start = (page - 1) * pageSize
  const list = hotList.slice(start, start + pageSize)
  return {
    code: 200,
    msg: 'success',
    data: { list, total: hotList.length, page, pageSize }
  }
})