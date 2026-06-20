import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { showToast } from 'vant'
import router from '@/router'
import { getToken, removeToken } from '@/utils/token'

interface UnwrappedAxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  interceptors: {
    request: {
      use(
        onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
        onRejected?: (error: unknown) => unknown
      ): number
    }
    response: {
      use(
        onFulfilled?: (response: AxiosResponse) => unknown,
        onRejected?: (error: unknown) => unknown
      ): number
    }
  }
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

axiosInstance.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    if (response.data.code === 200) {
      return response.data
    }
    showToast(response.data.message || response.data.msg || '请求失败')
    return Promise.reject(response.data)
  },
  error => {
    if (error.response?.status === 401) {
      removeToken()
      showToast('登录已过期，请重新登录')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return Promise.reject(error)
    }
    showToast('网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

const request = axiosInstance as unknown as UnwrappedAxiosInstance

export default request
