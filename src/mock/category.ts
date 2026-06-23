import Mock from 'mockjs'
import { productList } from './product'
import type { MockOptions } from './index'

interface CategoryChild {
  id: number
  name: string
}

interface CategoryItem {
  id: number
  name: string
  icon: string
  children: CategoryChild[]
}

const categoryTree: CategoryItem[] = [
  {
    id: 1,
    name: '手机数码',
    icon: 'phone-o',
    children: [
      { id: 101, name: '手机' },
      { id: 102, name: '平板电脑' },
      { id: 103, name: '笔记本' },
      { id: 104, name: '耳机/音箱' },
      { id: 105, name: '智能穿戴' },
      { id: 106, name: '相机/摄像机' },
      { id: 107, name: '游戏设备' },
      { id: 108, name: '电脑外设' }
    ]
  },
  {
    id: 2,
    name: '服装鞋帽',
    icon: 'bag-o',
    children: [
      { id: 201, name: '男装' },
      { id: 202, name: '女装' },
      { id: 203, name: '运动鞋' },
      { id: 204, name: '休闲鞋' },
      { id: 205, name: '羽绒服/棉服' },
      { id: 206, name: '卫衣/针织衫' },
      { id: 207, name: '帽子/配饰' },
      { id: 208, name: '户外服饰' }
    ]
  },
  {
    id: 3,
    name: '家用电器',
    icon: 'tv-o',
    children: [
      { id: 301, name: '空调' },
      { id: 302, name: '冰箱' },
      { id: 303, name: '洗衣机' },
      { id: 304, name: '厨房电器' },
      { id: 305, name: '清洁电器' },
      { id: 306, name: '生活电器' },
      { id: 307, name: '个护电器' },
      { id: 308, name: '净水设备' }
    ]
  },
  {
    id: 4,
    name: '美妆护肤',
    icon: 'gem-o',
    children: [
      { id: 401, name: '面部精华' },
      { id: 402, name: '眼霜/眼精华' },
      { id: 403, name: '化妆水/爽肤水' },
      { id: 404, name: '面霜/乳液' },
      { id: 405, name: '口红/唇釉' },
      { id: 406, name: '粉底/遮瑕' },
      { id: 407, name: '眼影/眉笔' },
      { id: 408, name: '香水' }
    ]
  },
  {
    id: 5,
    name: '食品生鲜',
    icon: 'shopping-cart-o',
    children: [
      { id: 501, name: '休闲零食' },
      { id: 502, name: '坚果炒货' },
      { id: 503, name: '乳制品' },
      { id: 504, name: '饮料冲调' },
      { id: 505, name: '酒类' },
      { id: 506, name: '生鲜水产' },
      { id: 507, name: '礼盒礼券' },
      { id: 508, name: '巧克力糖果' }
    ]
  },
  {
    id: 6,
    name: '家居家装',
    icon: 'home-o',
    children: [
      { id: 601, name: '沙发' },
      { id: 602, name: '床/床垫' },
      { id: 603, name: '家纺' },
      { id: 604, name: '卫浴洁具' },
      { id: 605, name: '灯具' },
      { id: 606, name: '插座/开关' },
      { id: 607, name: '台灯/护眼灯' },
      { id: 608, name: '办公家具' }
    ]
  },
  {
    id: 7,
    name: '母婴玩具',
    icon: 'gift-o',
    children: [
      { id: 701, name: '纸尿裤' },
      { id: 702, name: '喂养用品' },
      { id: 703, name: '婴儿推车' },
      { id: 704, name: '婴儿出行' },
      { id: 705, name: '奶粉' },
      { id: 706, name: '积木/拼装' },
      { id: 707, name: '盲盒/玩偶' },
      { id: 708, name: '早教/学习机' }
    ]
  },
  {
    id: 8,
    name: '图书文娱',
    icon: 'bookmark-o',
    children: [
      { id: 801, name: '文学小说' },
      { id: 802, name: '历史/社科' },
      { id: 803, name: '经管/励志' },
      { id: 804, name: '少儿读物' },
      { id: 805, name: '考试/教辅' },
      { id: 806, name: '编程/技术' },
      { id: 807, name: '文具用品' },
      { id: 808, name: '笔记本/手账' }
    ]
  }
]

const subToParent: Record<number, number> = {}
categoryTree.forEach(cat => {
  cat.children.forEach(child => {
    subToParent[child.id] = cat.id
  })
})

Mock.mock('/api/category/list', 'get', () => {
  return { code: 200, msg: 'success', data: categoryTree }
})

Mock.mock(/\/api\/category\/goods/, 'get', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const categoryId = Number(url.searchParams.get('categoryId') || 0)
  const page = Number(url.searchParams.get('page') || 1)
  const pageSize = Number(url.searchParams.get('pageSize') || 10)

  let list = [...productList]

  const parentCategoryId = subToParent[categoryId] || categoryId

  if (parentCategoryId) {
    list = list.filter(p => p.categoryId === parentCategoryId)
  }

  const total = list.length
  const start = (page - 1) * pageSize
  list = list.slice(start, start + pageSize)

  return {
    code: 200,
    msg: 'success',
    data: { list, total, page, pageSize }
  }
})
