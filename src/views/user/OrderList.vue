<template>
  <div class="order-list-page">
    <van-nav-bar
      title="我的订单"
      left-arrow
      fixed
      placeholder
      @click-left="$router.push('/home')"
    />

    <!-- 订单状态Tab -->
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab v-for="tab in tabs" :key="tab.key" :title="tab.title" :name="tab.key" />
    </van-tabs>

    <!-- 订单列表 -->
    <div v-if="filteredOrders.length > 0" class="order-list">
      <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <!-- 订单头部 -->
        <div class="order-header">
          <span>订单号: {{ order.orderId }}</span>
          <span class="order-status">{{ STATUS_TEXT[order.status] || order.status }}</span>
        </div>

        <!-- 订单商品 -->
        <div v-for="item in order.goods" :key="item.goodsId" class="order-goods">
          <img v-if="item.image" :src="item.image" class="order-img" />
          <div v-else class="order-img-placeholder">商品图</div>
          <div class="order-info">
            <p class="order-name">{{ item.name }}</p>
            <p class="order-specs">{{ item.specText || '暂无规格' }}</p>
            <div class="order-bottom">
              <span class="price">{{ formatPrice(item.price) }}</span>
              <span>x{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <span
            >共{{ getTotalCount(order.goods) }}件 实付:
            <span class="price">{{ formatPrice(order.totalAmount) }}</span></span
          >
          <div class="order-actions">
            <van-button size="small" plain type="danger" @click="handleCancelOrder(order.orderId)">取消订单</van-button>
            <van-button size="small" type="danger">立即付款</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="order-list">
      <van-empty description="暂无订单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { OrderGoods } from '@/types/order'
import { Address } from '@/types/address'
import { useOrderStore } from '@/stores/order'
import { formatPrice } from '@/utils/price'
import { getSessionStorage, removeSessionStorage } from '@/utils/storage'
import { getOrderList, cancelOrder } from '@/api/order'

const route = useRoute()
const orderStore = useOrderStore()

// 取消订单
const handleCancelOrder = async (orderId: string) => {
  const res = await cancelOrder(parseInt(orderId))
  console.log(res)
  // API 成功后同步更新本地 store 和 localStorage
  if (res && res.code === 200) {
    orderStore.updateOrderStatus(orderId, 'cancelled')
    showToast('订单已取消')
  }
}


const STATUS_TEXT: Record<string, string> = {
  pending_pay: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
  refund: '已退款',
}


const tabs = [
  { key: 'all', title: '全部' },
  { key: 'pending_pay', title: '待付款' },
  { key: 'paid', title: '待发货' },
  { key: 'shipped', title: '待收货' },
  { key: 'completed', title: '已完成' },
]

const activeTab = ref<string>((route.query.status as string) || 'all')

const onTabChange = (tab: string | number) => {
  activeTab.value = String(tab)
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orderStore.orders
  }
  return orderStore.orders.filter(order => order.status === activeTab.value)
})

interface Order {
  orderId: string
  createTime: string
  status: string
  goods: OrderGoods[]
  totalAmount: number
  address: Address | null
}

// 计算订单商品总数
const getTotalCount = (goods: OrderGoods[]): number => {
  return goods.reduce((sum, item) => sum + item.count, 0)
}

onMounted(async () => {
  const recentOrder = getSessionStorage<Order>('recentOrder')
  if (recentOrder) {
    const exists = orderStore.orders.some(o => o.orderId === recentOrder.orderId)
    if (!exists) {
      orderStore.addOrder(recentOrder)
    }
    removeSessionStorage('recentOrder')
  }

  try {
    const res = await getOrderList()
    // console.log(res)
    if (res && res.list) {
      res.list.forEach(backendOrder => {
        const exists = orderStore.orders.some(o => o.orderId === String(backendOrder.orderId))
        if (!exists) {
          orderStore.addOrder({
            orderId: String(backendOrder.orderId),
            createTime: backendOrder.createTime,
            status: backendOrder.status as string || 'pending_pay',
            goods: backendOrder.goodsList || [],
            totalAmount: backendOrder.finalPrice || 0,
            address: null
          })
        }
      })
    }
  } catch (error) {
    console.error('同步后端订单失败:', error)
  }
})
</script>

<style scoped>
.order-list-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.order-list {
  padding: 8px 12px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}

.order-status {
  color: #ee0a24;
}

.order-goods {
  display: flex;
  padding: 10px 12px;
  gap: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-img-placeholder {
  width: 70px;
  height: 70px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #999;
}

.order-img {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-name {
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-specs {
  font-size: 11px;
  color: #999;
  margin: 4px 0;
}

.order-bottom {
  display: flex;
  justify-content: space-between;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  background: #fafafa;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
