<template>
  <div class="order-list-page">
    <van-nav-bar title="我的订单" left-arrow fixed placeholder @click-left="$router.push('/home')" />

    <!-- 订单状态Tab -->
    <van-tabs sticky>
      <van-tab title="全部" />
      <van-tab title="待付款" />
      <van-tab title="待发货" />
      <van-tab title="待收货" />
      <van-tab title="已完成" />
    </van-tabs>

    <!-- 订单列表 -->
    <div class="order-list" v-if="orders.length > 0">
      <div class="order-card" v-for="order in orders" :key="order.orderId">
        <!-- 订单头部 -->
        <div class="order-header">
          <span>订单号: {{ order.orderId }}</span>
          <span class="order-status">{{ order.status }}</span>
        </div>

        <!-- 订单商品 -->
        <div class="order-goods" v-for="item in order.goods" :key="item.goodsId">
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
          <span>共{{ getTotalCount(order.goods) }}件 实付: <span class="price">{{ formatPrice(order.totalAmount) }}</span></span>
          <div class="order-actions">
            <van-button size="small" plain>取消订单</van-button>
            <van-button size="small" type="danger">立即付款</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="order-list" v-else>
      <van-empty description="暂无订单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { OrderGoods } from '@/types/order'
import { Address } from '@/types/address'
import { useOrderStore } from '@/stores/order'
import { formatPrice } from '@/utils/price'
import { getSessionStorage, removeSessionStorage } from '@/utils/storage'

const orderStore = useOrderStore()

interface Order {
  orderId: string
  createTime: string
  status: string
  goods: OrderGoods[]
  totalAmount: number
  address: Address | null
}

// 从 store 获取订单列表
const orders = computed(() => orderStore.orders)

// 计算订单商品总数
const getTotalCount = (goods: OrderGoods[]): number => {
  return goods.reduce((sum, item) => sum + item.count, 0)
}

onMounted(() => {
  // 从 sessionStorage 获取最近提交的订单（如果存在）
  const recentOrder = getSessionStorage<Order>('recentOrder')
  if (recentOrder) {
    // 检查是否已经添加到 store 中（避免重复添加）
    const exists = orderStore.orders.some(o => o.orderId === recentOrder.orderId)
    if (!exists) {
      orderStore.addOrder(recentOrder)
    }
    // 清除临时存储的数据
    removeSessionStorage('recentOrder')
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