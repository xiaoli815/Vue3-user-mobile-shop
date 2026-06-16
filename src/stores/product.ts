import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/product'

export const useProductStore = defineStore('product', () => {
  const favorites = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)

  // 设置当前商品
  function setCurrentProduct(product: Product | null) {
    currentProduct.value = product
  }

  // 切换收藏
  function toggleFavorite(product: Product) {
    const idx = favorites.value.findIndex(f => f.id === product.id)
    if (idx > -1) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(product)
    }
  }

  // 判断是否收藏
  const isFavorite = computed(() => (id: number) =>
    favorites.value.some(f => f.id === id)
  )

  return {
    favorites,
    currentProduct,
    setCurrentProduct,
    toggleFavorite,
    isFavorite
  }
})
