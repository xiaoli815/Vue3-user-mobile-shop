import request from '@/utils/request'
import type { LoginResponse, GetUserInfoResponse, LogoutResponse } from '@/types/index'

// 用户登录请求
export const goLogin = (data: { username: string; password: string }) => {
  return request.post<LoginResponse>('/user/login', data) as unknown as Promise<LoginResponse>
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get<GetUserInfoResponse>('/user/info') as unknown as Promise<GetUserInfoResponse>
}

// 用户退出登录请求
export const goLogout = () => {
  return request.post<LogoutResponse>('/user/logout') as unknown as Promise<LogoutResponse>
}
