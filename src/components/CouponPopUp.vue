<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '70%' }">
    <div class="coupon-popup-header">
      <h3 class="coupon-popup-title">选择优惠券</h3>
      <van-icon name="close" @click="handleClose" />
    </div>

    <div class="coupon-popup-content">
      <!-- 已选优惠券提示 -->
      <div v-if="autoSelectedDesc" class="auto-select-tip">
        <van-icon name="discount" />
        已自动选择最优优惠：{{ autoSelectedDesc }}
      </div>

      <!-- 优惠券标签页 -->
      <div class="coupon-tabs">
        <span
          :class="['tab', { active: couponTab === 'available' }]"
          @click="couponTab = 'available'"
        >
          可用 ({{ availableCoupons.length }})
        </span>
        <span
          :class="['tab', { active: couponTab === 'unavailable' }]"
          @click="couponTab = 'unavailable'"
        >
          不可用 ({{ unavailableCoupons.length }})
        </span>
      </div>

      <!-- 优惠券列表 -->
      <div class="coupon-list">
        <div
          v-for="(coupon, index) in displayCoupons"
          :key="coupon.id"
          :class="[
            'coupon-item',
            { chosen: isSelected(coupon, index), disabled: couponTab === 'unavailable' }
          ]"
          @click="handleCouponClick(coupon, index)"
        >
          <!-- 左侧金额区 -->
          <div class="coupon-left">
            <div class="coupon-amount">
              <template v-if="coupon.type === '折扣'">
                <span class="coupon-price">{{ (coupon.value / 10).toFixed(1) }}</span>
                <span class="coupon-unit">折</span>
              </template>
              <template v-else>
                <span class="coupon-sign">¥</span>
                <span class="coupon-price">{{ coupon.value }}</span>
              </template>
            </div>
            <div v-if="coupon.minUseAmount > 0" class="coupon-condition">
              满{{ coupon.minUseAmount }}元可用
            </div>
            <div v-else class="coupon-condition">无门槛</div>
          </div>

          <!-- 虚线分割 -->
          <div class="coupon-divider"></div>

          <!-- 右侧信息区 -->
          <div class="coupon-right">
            <div class="coupon-header">
              <span class="coupon-name">{{ coupon.name }}</span>
              <span class="coupon-tag" :class="tagClass(coupon.category)">{{ coupon.category }}</span>
            </div>
            <div v-if="coupon.description" class="coupon-desc">{{ coupon.description }}</div>

            <!-- 适用品牌 -->
            <div v-if="coupon.brandName" class="coupon-apply">
              <span class="apply-label">适用品牌：</span>
              <span class="apply-value">{{ coupon.brandName }}</span>
            </div>

            <!-- 适用商品 -->
            <div
              v-if="coupon.productIds && coupon.productIds.length > 0 && !coupon.brandName"
              class="coupon-apply"
            >
              <span class="apply-label">适用商品：</span>
              <span class="apply-value">{{ coupon.productIds.length }}款指定商品</span>
            </div>

            <!-- 有效期 -->
            <div class="coupon-valid-date">
              {{ formatDate(coupon.startAt) }} - {{ formatDate(coupon.endAt) }}
            </div>

            <!-- 不可用原因 -->
            <div v-if="couponTab === 'unavailable'" class="coupon-unusable-reason">
              {{ coupon.reason || getUnavailableReason(coupon) }}
            </div>
          </div>

          <!-- 选择状态 -->
          <div v-if="couponTab === 'available'" class="coupon-select">
            <van-radio :model-value="isSelected(coupon, index)" />
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="displayCoupons.length === 0"
          :description="couponTab === 'available' ? '暂无可用的优惠券' : '暂无不可用的优惠券'"
        />
      </div>
    </div>

    <div class="coupon-popup-footer">
      <van-button type="primary" round block @click="handleClear">不使用优惠券</van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Coupon } from '@/types/coupon'
import { filterUsableCoupons, filterUnusableCoupons } from '@/utils/coupon'

// Props 定义
interface Props {
  show?: boolean
  coupons?: Coupon[]
  selectedIndex?: number
  orderAmount?: number
  /** 订单商品ID列表，用于校验品牌券/品类券/单品券的可用性 */
  goodsIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  coupons: () => [],
  selectedIndex: -1,
  orderAmount: 0,
  goodsIds: () => []
})

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
  select: [coupon: Coupon, index: number]
  clear: []
  close: []
}>()

// 内部状态
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
})

const couponTab = ref<'available' | 'unavailable'>('available')
const selectedIndex = ref(props.selectedIndex)

// 同步外部 selectedIndex
watch(() => props.selectedIndex, val => { selectedIndex.value = val })

// 可用优惠券（Vant 兼容字段兜底 + 业务逻辑校验）
const availableCoupons = computed(() => {
  return filterUsableCoupons(props.coupons, props.orderAmount, props.goodsIds)
})

// 不可用优惠券
const unavailableCoupons = computed(() => {
  return filterUnusableCoupons(props.coupons, props.orderAmount, props.goodsIds)
})

// 当前 tab 显示的券
const displayCoupons = computed(() => {
  return couponTab.value === 'available' ? availableCoupons.value : unavailableCoupons.value
})

// 自动选中描述
const autoSelectedDesc = computed(() => {
  const best = availableCoupons.value[0]
  if (!best) return ''

  if (best.type === '折扣') {
    return `${best.name}（${(best.value / 10).toFixed(1)}折）`
  }
  return `${best.name}（减${best.value}元）`
})

// 判断是否选中
const isSelected = (coupon: Coupon, index: number): boolean => {
  if (couponTab.value !== 'available') return false
  return selectedIndex.value === index
}

// 格式化日期
const formatDate = (timestamp: number | undefined) => {
  if (timestamp === undefined) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取不可用原因
const getUnavailableReason = (coupon: Coupon): string => {
  const now = Date.now()
  if (now > coupon.endAt) return '已过期'
  if (now < coupon.startAt) return '未生效'
  if (props.orderAmount < coupon.minUseAmount) {
    return `满${coupon.minUseAmount}元可用，还差${(coupon.minUseAmount - props.orderAmount).toFixed(2)}元`
  }
  return '当前商品不适用'
}

// 分类标签样式
const tagClass = (category?: string) => {
  const map: Record<string, string> = {
    '平台券': 'tag-platform',
    '品类券': 'tag-category',
    '品牌券': 'tag-brand',
    '单品券': 'tag-product',
    '店铺券': 'tag-store'
  }
  return map[category || ''] || 'tag-platform'
}

// 点击优惠券
const handleCouponClick = (coupon: Coupon, index: number) => {
  if (couponTab.value !== 'available') return
  selectedIndex.value = index
  emit('select', coupon, index)
}

// 清除选择
const handleClear = () => {
  selectedIndex.value = -1
  emit('clear')
  emit('update:show', false)
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
  emit('update:show', false)
}
</script>

<style scoped>
.coupon-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.coupon-popup-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.coupon-popup-content {
  padding: 16px;
  max-height: calc(100% - 120px);
  overflow-y: auto;
}

.coupon-popup-footer {
  padding: 16px;
  border-top: 1px solid #eee;
}

/* 自动选择提示 */
.auto-select-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 8px;
  font-size: 13px;
  color: #e65100;
}

/* 标签页 */
.coupon-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.coupon-tabs .tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #999;
  position: relative;
  cursor: pointer;
}

.coupon-tabs .tab.active {
  color: #ee0a24;
  font-weight: bold;
}

.coupon-tabs .tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: #ee0a24;
  border-radius: 1px;
}

/* 优惠券列表 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  display: flex;
  align-items: stretch;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-item.chosen {
  border-color: #ee0a24;
  background: #fff5f5;
}

.coupon-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 左侧 */
.coupon-left {
  width: 100px;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: #fff;
  border-right: 1px dashed #eee;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.coupon-sign {
  font-size: 14px;
  color: #ee0a24;
  font-weight: bold;
}

.coupon-price {
  font-size: 28px;
  color: #ee0a24;
  font-weight: bold;
  line-height: 1;
}

.coupon-unit {
  font-size: 14px;
  color: #ee0a24;
  font-weight: bold;
  margin-left: 2px;
}

.coupon-condition {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

/* 虚线分割 */
.coupon-divider {
  width: 0;
}

/* 右侧 */
.coupon-right {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.coupon-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.coupon-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
}

.tag-platform { background: #e3f2fd; color: #1565c0; }
.tag-category { background: #e8f5e9; color: #2e7d32; }
.tag-brand { background: #fce4ec; color: #c62828; }
.tag-product { background: #fff3e0; color: #e65100; }
.tag-store { background: #f3e5f5; color: #6a1b9a; }

.coupon-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.coupon-apply {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.apply-label {
  color: #999;
}

.apply-value {
  color: #ee0a24;
}

.coupon-valid-date {
  font-size: 11px;
  color: #bbb;
}

.coupon-unusable-reason {
  font-size: 11px;
  color: #ff6b6b;
  margin-top: 4px;
}

/* 选择按钮 */
.coupon-select {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
</style>