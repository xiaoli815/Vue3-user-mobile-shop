import Mock from 'mockjs'
import type { Address } from '../types/address'
import type { MockOptions } from './index'
import { getItem, setItem } from './storage'

const ADDRESS_STORE_KEY = 'address_list_anonymous'

const defaultAddresses: Address[] = [
  {
    id: 1,
    receiverName: '张三',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路1号创新大厦A栋1502室',
    isDefault: true
  },
  {
    id: 2,
    receiverName: '李四',
    phone: '13900139002',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '望京街道望京SOHO T1 2001',
    isDefault: false
  },
  {
    id: 3,
    receiverName: '王五',
    phone: '13700137003',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '张江高科技园区博云路2号',
    isDefault: false
  },
  {
    id: 4,
    receiverName: '赵六',
    phone: '13600136004',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detail: '文三路478号华星时代广场1208',
    isDefault: false
  }
]

let addressList: Address[] = []
let addressIdCounter = 5

const loadAddresses = () => {
  try {
    const data = getItem(ADDRESS_STORE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        addressList = parsed
        const maxId = Math.max(...addressList.map(a => a.id), 4)
        addressIdCounter = maxId + 1
        return
      }
    }
  } catch (e) {
    console.error('加载地址列表失败:', e)
  }
  addressList = [...defaultAddresses]
}

const saveAddresses = () => {
  try {
    setItem(ADDRESS_STORE_KEY, JSON.stringify(addressList))
  } catch (e) {
    console.error('保存地址列表失败:', e)
  }
}

loadAddresses()

Mock.mock('/api/address/list', 'get', () => {
  return { code: 200, msg: 'success', data: addressList }
})

Mock.mock('/api/address/save', 'post', (options: MockOptions) => {
  const body = JSON.parse(options.body || '{}')
  if (body.id) {
    const idx = addressList.findIndex((a) => a.id === body.id)
    if (idx > -1) {
      if (body.isDefault) {
        addressList.forEach((a) => (a.isDefault = false))
      }
      addressList[idx] = { ...addressList[idx], ...body }
      saveAddresses()
      return { code: 200, msg: '保存成功', data: addressList[idx] }
    }
    return { code: 404, msg: '地址不存在', data: null }
  }

  const newAddr: Address = {
    id: addressIdCounter++,
    receiverName: body.receiverName || body.name || '',
    phone: body.phone || '',
    province: body.province || '',
    city: body.city || '',
    district: body.district || '',
    detail: body.detail || '',
    isDefault: body.isDefault || false
  }
  if (newAddr.isDefault) {
    addressList.forEach((a) => (a.isDefault = false))
  }
  addressList.push(newAddr)
  saveAddresses()
  return { code: 200, msg: '添加成功', data: newAddr }
})

Mock.mock('/api/address/delete', 'delete', (options: MockOptions) => {
  const url = new URL(options.url, 'http://localhost')
  const id = Number(url.searchParams.get('id'))
  const idx = addressList.findIndex((a) => a.id === id)
  if (idx > -1) {
    addressList.splice(idx, 1)
    saveAddresses()
    return { code: 200, msg: '删除成功', data: null }
  }
  return { code: 404, msg: '地址不存在', data: null }
})

Mock.mock(/\/api\/address\/setDefault\/\d+/, 'post', (options: MockOptions) => {
  const match = options.url.match(/\/api\/address\/setDefault\/(\d+)/)
  const id = match ? Number(match[1]) : 0
  addressList.forEach((a) => (a.isDefault = false))
  const addr = addressList.find((a) => a.id === id)
  if (addr) {
    addr.isDefault = true
    saveAddresses()
    return { code: 200, msg: '设置成功', data: null }
  }
  return { code: 404, msg: '地址不存在', data: null }
})
