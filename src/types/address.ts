import type { ApiResponse } from './api'

export interface Address {
  id: number
  receiverName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export type AddressListResponse = ApiResponse<Address[]>

export type AddressDetailResponse = ApiResponse<Address | null>

export type AddressResponse = ApiResponse<Address | null>