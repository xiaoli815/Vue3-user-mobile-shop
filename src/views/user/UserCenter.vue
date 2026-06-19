<template>
  <div class="user-page">
    <!-- 用户头部 -->
    <div class="user-header" @click="toLogin">
      <van-image round width="60" height="60" :src="userInfo.avatar || ''" />
      <p class="user-name">{{ userInfo.nickname || '用户名' }}</p>
    </div>

    <!-- 订单入口 -->
    <div class="order-section card">
      <div class="section-title">
        <span>我的订单</span>
        <span class="all-orders" @click="toOrderList()">全部订单 <van-icon name="arrow" /></span>
      </div>
      <van-grid :column-num="5" :border="false">
        <van-grid-item icon="balance-o" text="待付款" @click="toOrderList('pending_pay')" />
        <van-grid-item icon="logistics" text="待发货" @click="toOrderList('paid')" />
        <van-grid-item icon="send-gift-o" text="待收货" @click="toOrderList('shipped')" />
        <van-grid-item icon="comment-o" text="待评价" @click="toOrderList('completed')" />
        <van-grid-item icon="after-sale" text="售后" @click="toOrderList('refund')" />
      </van-grid>
    </div>

    <!-- 常用功能 -->
    <div class="func-section card">
      <van-grid :column-num="3" :border="false">
        <van-grid-item icon="location-o" text="地址管理" />
        <van-grid-item icon="coupon-o" text="优惠券" @click="goCoupon" />
        <van-grid-item icon="like-o" text="我的收藏" @click="toFavorite" />
      </van-grid>
    </div>

    <!-- 功能列表 -->
    <div class="menu-section card">
      <van-cell-group>
        <van-cell title="设置" is-link icon="setting-o" @click="toSetting" />
        <van-cell title="关于我们" is-link icon="info-o" />
      </van-cell-group>
    </div>
  </div>
  <Tabbar></Tabbar>
</template>

<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/login'
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'

const router = useRouter()
const toSetting = () => {
  router.push('/setting')
}
// 优惠券中心
const goCoupon = () => {
  router.push('/coupon')
}
const toOrderList = (status?: string) => {
  if (status) {
    router.push({ path: '/orders', query: { status } })
  } else {
    router.push('/orders')
  }
}
const toLogin = () => {
  router.push('/login')
}
const toFavorite = () => {
  router.push('/favorite')
}
// 用户登录信息的获取
const userInfo = ref<{ id?: number; nickname?: string; avatar?: string; phone?: string }>({})
onMounted(async () => {
  const res = await getUserInfo()
  console.log(res)
  if (res.code === 200) {
    userInfo.value = res.data
  } else {
    showToast(res.msg || '获取用户信息失败')
  }
})
</script>

<style scoped>
.user-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.user-header {
  background: linear-gradient(135deg, #ee0a24, #ff4d4f);
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
}

.order-section,
.func-section,
.menu-section {
  margin-top: 8px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px 0;
  font-size: 15px;
  font-weight: bold;
}

.all-orders {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}
</style>
