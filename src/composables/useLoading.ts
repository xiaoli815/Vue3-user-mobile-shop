import { ref } from 'vue'

/**
 * 加载状态管理组合式函数
 * 用于统一管理异步请求的 loading 状态
 */
export function useLoading(initialValue: boolean = false) {
  const loading = ref<boolean>(initialValue)

  /**
   * 包裹异步请求，自动管理 loading 状态
   * @param fn 异步请求函数
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    withLoading,
  }
}