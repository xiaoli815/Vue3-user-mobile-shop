<template>
  <div class="refund-page">
    <van-nav-bar title="申请退款" left-arrow @click-left="$router.back()" fixed placeholder />

    <div class="refund-content">
      <!-- 订单信息 -->
      <div class="card">
        <div class="order-summary">
          <div class="order-img-placeholder">商品图</div>
          <div class="order-info">
            <p class="order-name">商品名称占位符商品名称占位符</p>
            <p class="order-specs">颜色: 黑色 / 尺码: M</p>
            <p class="order-price">
              <span class="price">¥99.00</span>
              <span>等1件商品</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 退款原因 -->
      <div class="card">
        <h3>退款原因</h3>
        <van-radio-group v-model="refundReason" class="reason-group">
          <van-radio
            v-for="reason in reasons"
            :key="reason"
            :name="reason"
            class="reason-item"
          >{{ reason }}</van-radio>
        </van-radio-group>
      </div>

      <!-- 退款金额 -->
      <div class="card">
        <div class="amount-row">
          <span>退款金额</span>
          <span class="price" style="font-size:18px">¥99.00</span>
        </div>
      </div>

      <!-- 补充说明 -->
      <div class="card">
        <van-field
          v-model="refundDesc"
          type="textarea"
          rows="3"
          placeholder="补充说明（选填）"
          maxlength="200"
          show-word-limit
        />
      </div>

      <!-- 上传凭证 -->
      <div class="card">
        <h3>上传凭证</h3>
        <van-uploader
          v-model="uploadFiles"
          :max-count="3"
          :max-size="5 * 1024 * 1024"
        />
      </div>

      <!-- 提交按钮 -->
      <div class="submit-area">
        <van-button type="danger" block round @click="submitRefund">
          提交申请
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const refundReason = ref('')
const refundDesc = ref('')
const uploadFiles = ref<any[]>([])

const reasons = [
  '商品与描述不符',
  '商品质量问题',
  '发错货/漏发',
  '不喜欢/不想要了',
  '卖家发错货',
  '其他原因'
]

function submitRefund() {
  if (!refundReason.value) {
    showToast('请选择退款原因')
    return
  }
  showToast('退款申请已提交')
  setTimeout(() => router.back(), 1000)
}
</script>

<style scoped>
.refund-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.refund-content {
  padding: 8px 12px;
}

.card {
  margin-bottom: 8px;
}

.card h3 {
  font-size: 14px;
  margin-bottom: 10px;
}

.order-summary {
  display: flex;
  gap: 10px;
}

.order-img-placeholder {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
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

.order-price {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.reason-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reason-item {
  font-size: 14px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.submit-area {
  padding: 20px 0 40px;
}
</style>
