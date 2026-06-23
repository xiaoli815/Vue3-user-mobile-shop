import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OrderData } from '@/types/order'
import { useUserStore } from './user'

export const useOrderStore = defineStore('order', () => {
  // 订单列表
  const orders = ref<OrderData[]>([])
  const userStore = useUserStore()

  // 获取当前用户的订单存储key
  function getStorageKey(): string {
    const userKey = userStore.getUserKey()
    return `order_list_${userKey}`
  }

  // 从 localStorage 加载订单列表
  const loadOrdersFromStorage = () => {
    try {
      const storedOrders = localStorage.getItem(getStorageKey())
      if (storedOrders) {
        orders.value = JSON.parse(storedOrders)
      }
    } catch (error) {
      console.error('加载订单列表失败:', error)
    }
  }

  // 保存订单列表到 localStorage
  const saveOrdersToStorage = () => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(orders.value))
    } catch (error) {
      console.error('保存订单列表失败:', error)
    }
  }

  // 切换用户时重新加载订单
  const reloadForUser = () => {
    loadOrdersFromStorage()
  }

  // 添加订单
  const addOrder = (order: OrderData) => {
    orders.value.unshift(order)
    saveOrdersToStorage()
  }

  // 删除订单
  const removeOrder = (orderId: string) => {
    orders.value = orders.value.filter(order => order.orderId !== orderId)
    saveOrdersToStorage()
  }

  // 获取订单列表
  const getOrders = computed(() => orders.value)

  // 根据状态筛选订单
  const getOrdersByStatus = (status: string) => {
    if (status === '全部') {
      return orders.value
    }
    return orders.value.filter(order => order.status === status)
  }

  // 更新订单状态
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      order.status = newStatus
      saveOrdersToStorage()
    }
  }
  // 计算每个状态的订单数量
  const pendingPayCount = computed(() => getOrdersByStatus('pending_pay').length)
  const paidCount = computed(() => getOrdersByStatus('paid').length)
  const shippedCount = computed(() => getOrdersByStatus('shipped').length)
  const completedCount = computed(() => getOrdersByStatus('completed').length)
  const refundCount = computed(() => getOrdersByStatus('refund').length)

  // 初始化
  loadOrdersFromStorage()

  return {
    orders,
    addOrder,
    removeOrder,
    getOrders,
    getOrdersByStatus,
    updateOrderStatus,
    loadOrdersFromStorage,
    saveOrdersToStorage,
    reloadForUser,
    pendingPayCount,
    paidCount,
    shippedCount,
    completedCount,
    refundCount
  }
})
