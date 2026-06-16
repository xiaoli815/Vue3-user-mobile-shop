<template>
  <div class="coupon-center">
    <van-nav-bar title="优惠券中心" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 分类 Tab -->
    <van-tabs v-model:active="activeTab" sticky offset-top="46" @change="onTabChange">
      <van-tab v-for="tab in tabs" :key="tab.key" :name="tab.key" :title="tab.label" />
    </van-tabs>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading" />

    <!-- 优惠券列表 -->
    <div class="coupon-list" v-else-if="filteredCoupons.length > 0">
      <div
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        :class="['coupon-card', { expired: !coupon.valid, collected: coupon.collected }]"
      >
        <!-- 左侧金额区 -->
        <div class="coupon-left">
          <div class="coupon-amount">
            <template v-if="coupon.type === '折扣'">
              <span class="coupon-price">{{ (coupon.discount! / 10).toFixed(1) }}</span>
              <span class="coupon-unit">折</span>
            </template>
            <template v-else>
              <span class="coupon-sign">¥</span>
              <span class="coupon-price">{{ Math.floor(coupon.discount! / 100) }}</span>
            </template>
          </div>
          <div class="coupon-condition" v-if="coupon.minOrderAmount && coupon.minOrderAmount > 0">
            满{{ coupon.minOrderAmount / 100 }}元可用
          </div>
          <div class="coupon-condition" v-else>无门槛</div>
        </div>

        <!-- 虚线分割 -->
        <div class="coupon-divider"></div>

        <!-- 右侧信息区 -->
        <div class="coupon-right">
          <div class="coupon-header">
            <span class="coupon-name">{{ coupon.name }}</span>
            <span class="coupon-tag" :class="categoryClass(coupon.category)">
              {{ coupon.category }}
            </span>
          </div>
          <div class="coupon-desc" v-if="coupon.description">{{ coupon.description }}</div>

          <!-- 适用商品信息 -->
          <div class="coupon-apply" v-if="coupon.brandName">
            <span class="apply-label">适用品牌：</span>
            <span class="apply-value">{{ coupon.brandName }}</span>
          </div>
          <div class="coupon-apply" v-if="coupon.productIds && coupon.productIds.length > 0 && !coupon.brandName">
            <span class="apply-label">适用商品：</span>
            <span class="apply-value">{{ coupon.productIds.length }}款指定商品</span>
          </div>

          <div class="coupon-footer">
            <span class="coupon-date">
              {{ formatDate(coupon.startAt) }} - {{ formatDate(coupon.endAt) }}
            </span>
            <!-- 操作按钮 -->
            <van-button
              v-if="coupon.collected"
              size="small"
              round
              plain
              disabled
              type="default"
            >
              已领取
            </van-button>
            <van-button
              v-else-if="!coupon.valid"
              size="small"
              round
              plain
              disabled
              type="default"
            >
              已过期
            </van-button>
            <van-button
              v-else
              size="small"
              round
              type="danger"
              @click.stop="handleCollect(coupon)"
            >
              立即领取
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="coupon-empty" v-else-if="!loading">
      <van-empty :description="emptyText" />
    </div>

    <Tabbar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import Tabbar from '@/components/tabbar.vue'
import { getCouponList, collectCoupon } from '@/api/coupon'
import type { Coupon, CouponCategory } from '@/types/coupon'

// Tab 定义
const tabs = [
  { key: 'all', label: '全部' },
  { key: '平台券', label: '平台券' },
  { key: '品类券', label: '品类券' },
  { key: '品牌券', label: '品牌券' },
  { key: '单品券', label: '单品券' },
  { key: '店铺券', label: '店铺券' },
  { key: 'collected', label: '已领取' }
]

const activeTab = ref('all')
const coupons = ref<Coupon[]>([])
const loading = ref(true)

// 筛选后的优惠券列表
const filteredCoupons = computed(() => {
  if (activeTab.value === 'all') {
    return coupons.value
  }
  if (activeTab.value === 'collected') {
    return coupons.value.filter(c => c.collected)
  }
  return coupons.value.filter(c => c.category === activeTab.value)
})

// 空状态文案
const emptyText = computed(() => {
  if (activeTab.value === 'collected') return '暂无已领取的优惠券'
  if (activeTab.value === 'all') return '暂无优惠券'
  return `暂无可用的${activeTab.value}`
})

// 优惠券分类样式
const categoryClass = (category?: CouponCategory) => {
  const map: Record<string, string> = {
    '平台券': 'tag-platform',
    '品类券': 'tag-category',
    '品牌券': 'tag-brand',
    '单品券': 'tag-product',
    '店铺券': 'tag-store'
  }
  return map[category || ''] || 'tag-platform'
}

// 格式化日期
const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Tab 切换
const onTabChange = () => {
  // 切换时滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 获取优惠券列表
const fetchCoupons = async () => {
  loading.value = true
  try {
    const res: any = await getCouponList()
    coupons.value = Array.isArray(res) ? res : (res?.data || [])
  } catch {
    showToast('获取优惠券失败')
  } finally {
    loading.value = false
  }
}

// 领取优惠券
const handleCollect = async (coupon: Coupon) => {
  showLoadingToast({ message: '领取中...', forbidClick: true })
  try {
    await collectCoupon(coupon.id)
    coupon.collected = true
    closeToast()
    showToast('领取成功')
  } catch {
    closeToast()
    showToast('领取失败')
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
.coupon-center {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.loading {
  padding: 40px 0;
}

/* 优惠券列表 */
.coupon-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 优惠券卡片 */
.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.coupon-card.expired {
  opacity: 0.55;
}

.coupon-card.collected {
  opacity: 0.75;
}

/* 左侧金额区 */
.coupon-left {
  width: 110px;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ee0a24 0%, #ff4757 100%);
  color: #fff;
  padding: 16px 8px;
}

.coupon-card.expired .coupon-left,
.coupon-card.collected .coupon-left {
  background: linear-gradient(135deg, #999 0%, #bbb 100%);
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.coupon-sign {
  font-size: 16px;
  font-weight: 500;
  margin-right: 2px;
}

.coupon-price {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.coupon-unit {
  font-size: 14px;
  margin-left: 2px;
}

.coupon-condition {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.9;
  white-space: nowrap;
}

/* 虚线分割 */
.coupon-divider {
  width: 0;
  border-left: 1.5px dashed #eee;
  margin: 10px 0;
}

/* 右侧信息区 */
.coupon-right {
  flex: 1;
  padding: 12px 12px 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.coupon-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-tag {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
  line-height: 16px;
}

.tag-platform {
  background: #e8f4fd;
  color: #1989fa;
}

.tag-category {
  background: #fff3e0;
  color: #ff9800;
}

.tag-brand {
  background: #f3e5f5;
  color: #9c27b0;
}

.tag-product {
  background: #e8f5e9;
  color: #4caf50;
}

.tag-store {
  background: #fff8e1;
  color: #ff8f00;
}

.coupon-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.coupon-apply {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.apply-label {
  color: #999;
  flex-shrink: 0;
}

.apply-value {
  color: #ee0a24;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.coupon-date {
  font-size: 11px;
  color: #bbb;
}

/* 空状态 */
.coupon-empty {
  padding: 80px 0;
}
</style>