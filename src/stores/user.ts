import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userId = ref<number>(0)
  const isLoggedIn = computed(() => !!token.value)

  // 从 localStorage 恢复 token
  function loadToken() {
    try {
      const savedToken = localStorage.getItem('token')
      const savedUserId = localStorage.getItem('user_id')
      if (savedToken) {
        token.value = savedToken
      }
      if (savedUserId) {
        userId.value = Number(savedUserId)
      }
    } catch { /* ignore */ }
  }

  // 保存 token 和 userId
  function setToken(newToken: string, newUserId: number = 0) {
    token.value = newToken
    userId.value = newUserId
    localStorage.setItem('token', newToken)
    localStorage.setItem('user_id', String(newUserId))
  }

  // 清除 token 和 userId
  function clearToken() {
    token.value = ''
    userId.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
  }

  // 登出
  function logout() {
    clearToken()
  }

  // 获取用户唯一标识（用于存储购物车和订单）
  function getUserKey(): string {
    if (userId.value > 0) {
      return `user_${userId.value}`
    }
    return 'anonymous'
  }

  // 初始化时加载 token
  loadToken()

  return {
    token,
    userId,
    isLoggedIn,
    setToken,
    clearToken,
    logout,
    getUserKey
  }
})