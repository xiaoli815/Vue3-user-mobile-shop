<template>
  <div class="seckill-page">
    <!-- 顶部倒计时区域 -->
    <div class="seckill-header">
      <div class="header-left">
        <span @click="router.back()">&lt;</span>
        <span class="seckill-title">限时秒杀</span>
        <van-count-down :time="remainingTime" format="HH:mm:ss" class="countdown">
          <template #default="timeData">
            <span class="time-block">{{ timeData.hours }}</span>
            <span class="time-colon">:</span>
            <span class="time-block">{{ timeData.minutes }}</span>
            <span class="time-colon">:</span>
            <span class="time-block">{{ timeData.seconds }}</span>
          </template>
        </van-count-down>
      </div>
      <div class="header-right">
        <span class="tips">距离结束</span>
      </div>
    </div>

    <!-- 时间段选择 -->
    <div class="time-slots">
      <div
        v-for="(slot, index) in timeSlots"
        :key="slot.label"
        class="slot-item"
        :class="{
          active: activeSlotIndex === index,
          ongoing: slot.status === 'ongoing'
        }"
        @click="selectSlot(index)"
      >
        <span class="slot-label">{{ slot.label }}</span>
        <span class="slot-status">
          <template v-if="activeSlotIndex === index">抢购中</template>
          <template v-else-if="index < activeSlotIndex">已结束</template>
          <template v-else>即将开始</template>
        </span>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-list">
      <div v-for="i in SeckillList" :key="i.seckillId" class="product-item">
        <div class="product-img-placeholder">
          <img :src="i.image" alt="" />
        </div>
        <div class="product-info">
          <p class="product-name">{{ i.title }}</p>
          <div class="price-row">
            <span class="current-price"> <span class="unit">¥</span>{{ i.seckillPrice }} </span>
            <span class="original-price">￥{{ i.originalPrice }}</span>
          </div>
          <!-- 进度条 -->
          <div class="progress-wrap">
            <van-progress
              :percentage="getProgress(i)"
              :stroke-width="2"
              color="linear-gradient(90deg, #ff4d4f, #ff7875)"
            />
            <span class="progress-text">已抢{{ getProgress(i) }}%</span>
          </div>
          <van-button
            type="danger"
            size="small"
            round
            class="buy-btn"
            @click="goSeckillDetail(i.seckillId)"
          >
            立即抢购
          </van-button>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="bottom-tips">
      <p>—— 更多秒杀场次即将开始，敬请期待 ——</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TimeSlot } from '@/types/seckill'
import { getSeckillList } from '@/api/seckill'
import { SeckillItem } from '@/types/seckill'

const router = useRouter()

const timeSlots = ref<TimeSlot[]>([
  { label: '08:00', hour: 8, status: 'ended' },
  { label: '12:00', hour: 12, status: 'ended' },
  { label: '16:00', hour: 16, status: 'ongoing' },
  { label: '20:00', hour: 20, status: 'upcoming' }
])
const activeSlotIndex = ref(2)

// 剩余时间（毫秒）
const remainingTime = ref(3600000)

function selectSlot(index: number) {
  if (index <= activeSlotIndex.value) {
    activeSlotIndex.value = index
  }
}

// 计算进度百分比
function getProgress(item: SeckillItem): number {
  const total = item.totalStock || 1
  const sold = (item.totalStock || 0) - (item.remainStock || 0)
  return Math.round((sold / total) * 100)
}
// 秒杀列表
const SeckillList = ref<SeckillItem[]>([])
const fetchSeckillList = async () => {
  try {
    const res: any = await getSeckillList()
    // console.log('秒杀接口返回:', res)
    if (res && Array.isArray(res.data)) {
      SeckillList.value = res.data || []
      // console.log('秒杀列表数据:', SeckillList.value)
    }
  } catch (e) {
    console.error('获取秒杀列表失败:', e)
  }
}

onMounted(() => {
  fetchSeckillList()
})
const goSeckillDetail = (id: number) => {
  router.push({
    path: '/product/detail',
    query: {
      id: id,
      type: 'seckill'
    }
  })
}
</script>

<style scoped>
.seckill-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

/* 顶部倒计时 */
.seckill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seckill-title {
  font-size: 18px;
  font-weight: bold;
}

.countdown {
  display: flex;
  align-items: center;
}

.time-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
}

.time-colon {
  font-size: 13px;
  margin: 0 2px;
}

.header-right .tips {
  font-size: 12px;
  opacity: 0.8;
}

/* 时间段选择 */
.time-slots {
  display: flex;
  background: #fff;
  padding: 8px 12px;
  overflow-x: auto;
  gap: 0;
  border-bottom: 1px solid #f0f0f0;
}

.slot-item {
  flex: 1;
  min-width: 60px;
  text-align: center;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.slot-item.active {
  background: #fff1f0;
  color: #ff4d4f;
}

.slot-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.slot-status {
  display: block;
  font-size: 10px;
  color: #999;
}

.slot-item.active .slot-status {
  color: #ff4d4f;
}

.slot-item.ongoing .slot-status {
  color: #ff4d4f;
}

/* 商品列表 */
.product-list {
  padding: 8px 12px;
}

.product-item {
  display: flex;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 10px;
  gap: 10px;
  cursor: pointer;
}

.product-img-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 6px;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #999;
  font-size: 12px;
}

.product-img-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-img-placeholder span {
  display: none;
}

.product-img-placeholder:hover span {
  display: block;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff4d4f;
}

.unit {
  font-size: 12px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

/* 进度条 */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-wrap :deep(.van-progress) {
  flex: 1;
}

.progress-text {
  font-size: 11px;
  color: #ff4d4f;
  white-space: nowrap;
}

.buy-btn {
  align-self: flex-end;
  font-size: 12px;
}

/* 底部提示 */
.bottom-tips {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}
</style>
