import request from '@/utils/request'
import type { AddressListResponse, AddressDetailResponse, AddressResponse } from '@/types/index'
import type { Address } from '@/types/address'

export const getAddressList = () => {
  return request.get<AddressListResponse>('/address/list').then(res => res.data)
}

export const getAddressDetail = (id: number) => {
  return request.post<AddressDetailResponse>(`/address/setDefault/${id}`).then(res => res.data)
}

export const addAddress = (data: Omit<Address, 'id'> & { id?: number }) => {
  return request.post<AddressResponse>('/address/save', { ...data }).then(res => res.data)
}

export const deleteAddress = (id: number) => {
  return request.delete<AddressResponse>(`/address/delete?id=${id}`).then(res => res.data)
}
