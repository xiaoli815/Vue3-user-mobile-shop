import type { ApiResponse } from './api'

export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
}

export type LoginResponse = ApiResponse<{
  token: string
  userInfo: UserInfo
}>

export type GetUserInfoResponse = ApiResponse<UserInfo>

export type LogoutResponse = ApiResponse<null>