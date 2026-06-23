import Mock from 'mockjs'
import type { Address } from '../types/address'
import type { MockOptions } from './index'

const addressList: Address[] = [
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
let addressIdCounter = 5

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
  return { code: 200, msg: '添加成功', data: newAddr }
})

Mock.mock('/api/address/delete', 'post', (options: MockOptions) => {
  const { id } = JSON.parse(options.body || '{}')
  const idx = addressList.findIndex((a) => a.id === id)
  if (idx > -1) {
    addressList.splice(idx, 1)
    return { code: 200, msg: '删除成功', data: null }
  }
  return { code: 404, msg: '地址不存在', data: null }
})

Mock.mock('/api/address/setDefault', 'post', (options: MockOptions) => {
  const { id } = JSON.parse(options.body || '{}')
  addressList.forEach((a) => (a.isDefault = false))
  const addr = addressList.find((a) => a.id === id)
  if (addr) {
    addr.isDefault = true
    return { code: 200, msg: '设置成功', data: null }
  }
  return { code: 404, msg: '地址不存在', data: null }
})
