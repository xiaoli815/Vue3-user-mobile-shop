import { defineStore } from 'pinia'
import {ref, computed } from 'vue'
import type { CartItem } from '@/types/cart'
import { useUserStore } from './user'
import { getCart, addToCart as apiAddToCart, clearCart as apiClearCart } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const userStore = useUserStore()
  const loading = ref(false)

  // 获取当前用户的购物车存储key
  function getStorageKey(): string {
    const userKey = userStore.getUserKey()
    return `cart_items_${userKey}`
  }

  // 从localStorage恢复
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(getStorageKey())
      if (data) {
        items.value = JSON.parse(data) as CartItem[]
      }
    } catch {
      /* ignore */
    }
  }

  // 保存到localStorage
  function saveToStorage() {
    localStorage.setItem(getStorageKey(), JSON.stringify(items.value))
  }

  // 加载购物车数据
  async function loadFromServer() {
    loading.value = true
    try {
      const data = await getCart()
      items.value = data || []
      saveToStorage()
    } catch (error) {
      console.error('加载购物车失败:', error)
      loadFromStorage()
    } finally {
      loading.value = false
    }
  }

  // 切换用户时重新加载购物车
  function reloadForUser() {
    loadFromServer()
  }

  // 初始化加载
  loadFromServer()

  // 计算属性
  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.count, 0))
  // 被选中的商品
  const checkedItems = computed(() => items.value.filter(item => item.checked))

  const totalPrice = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.price * item.count, 0)
  )
  // 是否全选
  const isAllChecked = computed(
    () => items.value.length > 0 && items.value.every(item => item.checked)
  )

  // 添加到购物车
  async function addToCart(item: CartItem) {
    loading.value = true
    try {
      // 调用 API
      await apiAddToCart({
        goodsId: item.goodsId,
        skuId: item.skuId,
        count: item.count,
        name: item.name,
        image: item.image,
        price: item.price,
        specText: item.specText
      })

      // 更新本地状态
      const exist = items.value.find(i => i.skuId === item.skuId && i.goodsId === item.goodsId)
      if (exist) {
        exist.count += item.count
      } else {
        items.value.push(item)
      }
      saveToStorage()
    } catch (error) {
      console.error('添加购物车失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新数量
  function updateCount(cartId: number, count: number) {
    const item = items.value.find(i => i.cartId === cartId)
    if (item) {
      item.count = count
      saveToStorage()
    }
  }

  // 删除商品
  function removeItem(cartId: number) {
    const idx = items.value.findIndex(i => i.cartId === cartId)
    if (idx > -1) {
      items.value.splice(idx, 1)
      saveToStorage()
    }
  }

  // 删除选中的商品
  function removeChecked() {
    items.value = items.value.filter(item => !item.checked)
    saveToStorage()
  }

  // 切换选中状态
  function toggleCheck(cartId: number) {
    const item = items.value.find(i => i.cartId === cartId)
    if (item) {
      item.checked = !item.checked
      saveToStorage()
    }
  }

  // 全选/取消全选 - 纯本地操作
  function toggleAllCheck(checked: boolean) {
    items.value.forEach(item => {
      item.checked = checked
    })
    saveToStorage()
  }

  // 获取选中的商品ID列表
  function getCheckedIds() {
    return checkedItems.value.map(item => item.cartId)
  }

  // 清空购物车（结算后调用）
  async function clearCart() {
    loading.value = true
    try {
      const ids = checkedItems.value.map(item => String(item.cartId))
      // 调用 API 清空已结算的商品
      await apiClearCart(ids)

      // 更新本地状态
      items.value = items.value.filter(item => !item.checked)
      saveToStorage()
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    totalCount,
    totalPrice,
    isAllChecked,
    checkedItems,
    addToCart,
    updateCount,
    removeItem,
    removeChecked,
    toggleCheck,
    toggleAllCheck,
    getCheckedIds,
    clearCart,
    reloadForUser,
    loadFromServer
  }
})
