import request from '@/utils/request'
import type { AddressListResponse, AddressDetailResponse, AddressResponse } from '@/types/index'
import type { Address } from '@/types/address'

// 获取地址列表
export const getAddressList = () => {
  return request.get<AddressListResponse>('/address/list')
}

// 获取地址详情（备用接口）
export const getAddressDetail = (id: number) => {
  return request.get<AddressDetailResponse>(`/address/detail?id=${id}`)
}

// 新增/编辑地址
export const addAddress = (data: Omit<Address, 'id'> & { id?: number }) => {
  return request.post<AddressResponse>('/address/save', { ...data })
}

// 删除地址 — 后端使用 DELETE + query 传 id
export const deleteAddress = (id: number) => {
  return request.delete<AddressResponse>(`/address/delete?id=${id}`)
}

// 设置默认地址 — 后端使用 POST /setDefault/:id
export const setDefaultAddress = (id: number) => {
  return request.post<AddressResponse>(`/address/setDefault/${id}`)
}
