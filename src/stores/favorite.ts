import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '@/types/product'
import { useUserStore } from './user'

const STORAGE_KEY = 'favorites_data'

// 从 localStorage 加载数据
function loadFavorites(): Record<string, Product[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// 保存数据到 localStorage
function saveFavorites(data: Record<string, Product[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('保存收藏数据失败:', error)
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  const userStore = useUserStore()
  const favoriteList = ref<Product[]>([])

  // 根据当前用户获取对应的收藏数据 key
  const getUserKey = (): string => {
    const userId = userStore.userId || 'guest'
    return `user_${userId}`
  }

  // 从 localStorage 加载当前用户的收藏数据
  const loadUserFavorites = () => {
    const allFavorites = loadFavorites()
    const userKey = getUserKey()
    favoriteList.value = allFavorites[userKey] || []
  }

  // 保存当前用户的收藏数据到 localStorage
  const saveUserFavorites = () => {
    const allFavorites = loadFavorites()
    const userKey = getUserKey()
    allFavorites[userKey] = [...favoriteList.value]
    saveFavorites(allFavorites)
  }

  // 监听用户变化，重新加载对应用户的收藏数据
  watch(
    () => userStore.userId,
    () => {
      loadUserFavorites()
    },
    { immediate: true }
  )

  // 监听 favoriteList 变化，自动保存
  watch(
    favoriteList,
    () => {
      saveUserFavorites()
    },
    { deep: true }
  )

  // 添加收藏
  const addFavorite = (product: Product) => {
    if (!favoriteList.value.some(item => item.id === product.id)) {
      favoriteList.value.push({ ...product, isFavorite: true })
    }
  }

  // 移除收藏
  const removeFavorite = (productId: number) => {
    const index = favoriteList.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      favoriteList.value.splice(index, 1)
    }
  }

  // 切换收藏状态
  const toggleFavorite = (product: Product): boolean => {
    const index = favoriteList.value.findIndex(item => item.id === product.id)
    if (index !== -1) {
      // 已收藏，取消收藏
      favoriteList.value.splice(index, 1)
      return false
    } else {
      // 未收藏，添加收藏
      favoriteList.value.push({ ...product, isFavorite: true })
      return true
    }
  }

  // 检查商品是否已收藏
  const isFavorite = (productId: number): boolean => {
    return favoriteList.value.some(item => item.id === productId)
  }

  // 获取收藏数量
  const getCount = (): number => {
    return favoriteList.value.length
  }

  // 清空所有收藏
  const clearAll = () => {
    favoriteList.value = []
  }

  return {
    favoriteList,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getCount,
    clearAll,
    loadUserFavorites
  }
})
