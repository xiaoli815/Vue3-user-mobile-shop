import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'
import { getToken, removeToken } from '@/utils/token'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截器：携带token
request.interceptors.request.use(
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

request.interceptors.response.use(
  response => {
    if (response.data.code === 200) {
      return response.data
    }
    showToast(response.data.message || response.data.msg || '请求失败')
    return Promise.reject(response.data)
  },
  error => {
    // 401 未登录或 token 过期，清除 token 并跳转登录页
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

export default request
