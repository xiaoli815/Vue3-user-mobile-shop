import { ref } from 'vue'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'

const STORAGE_KEY = 'search_history'
const MAX_HISTORY = 10

/**
 * 搜索历史管理组合式函数
 * 基于 localStorage 持久化，支持多用户隔离
 */
export function useSearchHistory() {
  const history = ref<string[]>([])
  const userId = ref<string>('default')

  // 生成当前用户的存储 key
  function getKey(): string {
    return `${STORAGE_KEY}_${userId.value}`
  }

  // 从 localStorage 加载
  function loadHistory(): void {
    const stored = getLocalStorage<string[]>(getKey())
    history.value = Array.isArray(stored) ? stored : []
  }

  // 保存到 localStorage
  function saveHistory(): void {
    setLocalStorage(getKey(), history.value)
  }

  // 添加搜索记录（去重、限制数量）
  function addSearch(keyword: string): void {
    const trimmed = keyword.trim()
    if (!trimmed) return

    // 移除重复项
    const index = history.value.indexOf(trimmed)
    if (index > -1) {
      history.value.splice(index, 1)
    }

    // 添加到最前面
    history.value.unshift(trimmed)

    // 限制数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }

    saveHistory()
  }

  // 删除单条记录
  function removeSearch(keyword: string): void {
    const index = history.value.indexOf(keyword)
    if (index > -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }

  // 清空历史
  function clearHistory(): void {
    history.value = []
    saveHistory()
  }

  // 设置用户 ID（用于多用户隔离）
  function setUserId(id: string): void {
    userId.value = id
    loadHistory()
  }

  // 初始化加载
  loadHistory()

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    setUserId,
  }
}