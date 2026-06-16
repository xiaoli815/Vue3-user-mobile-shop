<template>
  <div class="setting-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="设置" left-arrow fixed placeholder @click-left="$router.back()" />

    <!-- 用户信息 -->
    <div class="user-card card" @click="toProfile">
      <van-image round width="50" height="50" src="" />
      <div class="user-info">
        <p class="nickname">用户名</p>
        <p class="desc">点击查看个人资料</p>
      </div>
      <van-icon name="arrow" color="#ccc" />
    </div>

    <!-- 账号安全 -->
    <div class="section-title">账号安全</div>
    <div class="card">
      <van-cell-group :border="false">
        <van-cell title="账号与安全" is-link icon="idcard" />
        <van-cell title="手机号" is-link icon="phone-o" value="138****8888" />
        <van-cell title="登录密码" is-link icon="lock" value="修改" />
        <van-cell title="支付密码" is-link icon="pay-collect-o" value="设置" />
      </van-cell-group>
    </div>

    <!-- 通用设置 -->
    <div class="section-title">通用设置</div>
    <div class="card">
      <van-cell-group :border="false">
        <van-cell title="收货地址" is-link icon="location-o" />
        <van-cell title="支付设置" is-link icon="balance-pay" />
        <van-cell title="免密支付/自动扣款" is-link icon="debit-pay" />
        <van-cell title="发票抬头管理" is-link icon="orders-o" />
      </van-cell-group>
    </div>

    <!-- 消息与隐私 -->
    <div class="section-title">消息与隐私</div>
    <div class="card">
      <van-cell-group :border="false">
        <van-cell title="新消息通知" is-link icon="chat-o" />
        <van-cell title="隐私设置" is-link icon="eye-o" />
        <van-cell title="个性化推荐" is-link icon="like-o" />
      </van-cell-group>
    </div>

    <!-- 其他 -->
    <div class="section-title">其他</div>
    <div class="card">
      <van-cell-group :border="false">
        <van-cell title="通用设置" is-link icon="setting-o" />
        <van-cell title="检查更新" is-link icon="upgrade" value="v1.0.0" />
        <van-cell title="清理缓存" is-link icon="delete-o" @click="clearCache" value="12.5MB" />
        <van-cell title="关于优选商城" is-link icon="info-o" />
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="logout-wrap">
      <van-button type="danger" block round @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast, showDialog } from 'vant'
import { useRouter } from 'vue-router'
import { goLogout } from '@/api/login'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const toProfile = () => {
  showToast('个人资料')
}

const clearCache = () => {
  showDialog({
    title: '提示',
    message: '确定要清理缓存吗？'
  }).then(() => {
    showToast('缓存已清理')
  })
}

const logout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(async () => {
    await goLogout()
    // 使用 userStore 清除登录状态
    userStore.logout()
    // 重新加载购物车和订单（切换到匿名用户）
    cartStore.reloadForUser()
    orderStore.reloadForUser()
    showToast('已退出登录')
    // 跳转登录页
    router.replace('/login')
  })
}
</script>

<style scoped>
.setting-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  margin-top: 0;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px;
}

.desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 13px;
  color: #999;
}

.card {
  background: #fff;
  margin-bottom: 0;
}

.logout-wrap {
  padding: 24px 16px;
}

:deep(.van-cell__title) {
  display: flex;
  align-items: center;
}

:deep(.van-cell__left-icon) {
  margin-right: 8px;
  font-size: 20px;
}
</style>