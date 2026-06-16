<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ height: '70%' }"
  >
    <div class="coupon-popup-header">
      <h3 class="coupon-popup-title">优惠券</h3>
      <van-icon name="close" @click="handleClose" />
    </div>
    <div class="coupon-popup-content">
      <!-- 优惠券标签页 -->
      <div class="coupon-tabs">
        <span :class="['tab', { active: couponTab === 'available' }]" @click="couponTab = 'available'">
          可用 ({{ availableCoupons.length }})
        </span>
        <span :class="['tab', { active: couponTab === 'unavailable' }]" @click="couponTab = 'unavailable'">
          不可用 ({{ unavailableCoupons.length }})
        </span>
      </div>
      
      <!-- 优惠券列表 -->
      <div class="coupon-list">
        <div 
          v-for="(coupon, index) in (couponTab === 'available' ? availableCoupons : unavailableCoupons)" 
          :key="coupon.id"
          :class="['coupon-item', { chosen: selectedIndex === index && couponTab === 'available' }]"
          @click="handleCouponClick(coupon, index)"
        >
          <view class="coupon-left">
            <view class="coupon-amount">
              <!-- 根据优惠券类型显示不同内容 -->
              <text v-if="coupon.type === '折扣' && coupon.discount !== undefined" class="coupon-price">
                {{ (coupon.discount / 10).toFixed(1) }}折
              </text>
              <text v-else-if="coupon.discount !== undefined" class="coupon-price">
                <text class="coupon-currency">¥</text>
                {{ coupon.discount / 100 }}
              </text>
            </view>
            <view v-if="coupon.minOrderAmount !== undefined && coupon.minOrderAmount > 0" class="coupon-condition">
              满{{ coupon.minOrderAmount / 100 }}元可用
            </view>
          </view>
          <view class="coupon-right">
            <view class="coupon-name">
              {{ coupon.name }}
              <span class="coupon-tag" :class="tagClass(coupon.category)">{{ coupon.category }}</span>
            </view>
            <view class="coupon-desc">{{ coupon.description }}</view>
            <view class="coupon-apply" v-if="coupon.brandName">适用品牌：{{ coupon.brandName }}</view>
            <view class="coupon-valid-date">
              {{ formatDate(coupon.startAt) }} - {{ formatDate(coupon.endAt) }}
            </view>
          </view>
          <view v-if="couponTab === 'available'" class="coupon-select">
            <van-radio :value="index" v-model="selectedIndex" />
          </view>
        </div>
        
        <!-- 空状态 -->
        <van-empty 
          v-if="(couponTab === 'available' ? availableCoupons : unavailableCoupons).length === 0" 
          description="暂无优惠券" 
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

// Props 定义
interface Props {
  show: boolean           // 弹窗显示状态
  coupons: Coupon[]       // 优惠券列表
  selectedIndex: number   // 当前选中的优惠券索引
  orderAmount?: number    // 订单金额（用于筛选可用优惠券）
  productId?: number      // 当前商品ID（用于品牌券/店铺券的可用性判断）
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  coupons: () => [],
  selectedIndex: -1,
  orderAmount: 0,
  productId: 0
})

// Emits 定义
const emit = defineEmits<{
  'update:show': [value: boolean]           // 更新弹窗显示状态
  'select': [coupon: Coupon, index: number] // 选择优惠券
  'clear': []                               // 清除选择
  'close': []                               // 关闭弹窗
}>()

// 内部状态
const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const couponTab = ref<'available' | 'unavailable'>('available')
const selectedIndex = ref(props.selectedIndex)

// 监听外部 selectedIndex 变化
watch(() => props.selectedIndex, (val) => {
  selectedIndex.value = val
})

// 品牌/商品匹配判断（品牌券仅针对特定品牌商品可用）
const isBrandMatched = (coupon: Coupon): boolean => {
  if (!props.productId) return true
  if (!coupon.productIds || coupon.productIds.length === 0) return true
  return coupon.productIds.includes(props.productId)
}

// 可用优惠券列表
const availableCoupons = computed(() => {
  return props.coupons.filter((coupon) => {
    return coupon.valid === true && 
           (coupon.minOrderAmount === undefined || coupon.minOrderAmount <= props.orderAmount * 100) &&
           isBrandMatched(coupon)
  })
})

// 不可用优惠券列表
const unavailableCoupons = computed(() => {
  return props.coupons.filter((coupon) => {
    const isUnavailableByValidity = coupon.valid !== true ||
           (coupon.minOrderAmount !== undefined && coupon.minOrderAmount > props.orderAmount * 100)
    const isUnavailableByBrand = !isBrandMatched(coupon)
    return isUnavailableByValidity || isUnavailableByBrand
  })
})

// 格式化日期
const formatDate = (timestamp: number | undefined) => {
  if (timestamp === undefined) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  return map[category || ''] || ''
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
/* 优惠券弹窗样式 */
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

/* 优惠券标签页 */
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
}

.coupon-tabs .tab.active {
  color: #ee0a24;
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
}

/* 优惠券列表 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 优惠券项 */
.coupon-item {
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #ee0a24 0%, #ff4757 100%);
  border-radius: 8px;
  overflow: hidden;
}

.coupon-item.chosen {
  border: 2px solid #ee0a24;
}

.coupon-item::after {
  content: '';
  position: absolute;
  left: 120px;
  top: 0;
  bottom: 0;
  width: 12px;
  background: repeating-linear-gradient(
    0deg,
    #fff 0px,
    #fff 4px,
    transparent 4px,
    transparent 8px
  );
}

/* 优惠券左侧 */
.coupon-left {
  width: 120px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.coupon-currency {
  font-size: 14px;
}

.coupon-price {
  font-size: 28px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.9;
}

/* 优惠券右侧 */
.coupon-right {
  flex: 1;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coupon-tag {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 16px;
}

.tag-platform { background: #e8f4fd; color: #1989fa; }
.tag-category { background: #fff3e0; color: #ff9800; }
.tag-brand { background: #f3e5f5; color: #9c27b0; }
.tag-product { background: #e8f5e9; color: #4caf50; }
.tag-store { background: #fff8e1; color: #ff8f00; }

.coupon-apply {
  font-size: 11px;
  color: #ee0a24;
  margin-top: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.coupon-valid-date {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

/* 优惠券选择按钮 */
.coupon-select {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}
</style>