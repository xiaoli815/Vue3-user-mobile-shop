<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    <div class="bg-circle bg-circle-3"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <rect x="4" y="12" width="40" height="28" rx="6" fill="#165DFF" />
            <path
              d="M16 22 L22 28 L32 18"
              stroke="#fff"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="app-name">优选商城</h1>
        <p class="app-slogan">品质生活，优选好物</p>
      </div>

      <!-- 表单区域 -->
      <div class="form-area">
        <!-- 账号/手机号 -->
        <div class="input-group" :class="{ focused: activeField === 'account' }">
          <span class="input-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </span>
          <input
            v-model="form.account"
            type="text"
            class="input-field"
            placeholder="请输入手机号/账号"
            @focus="activeField = 'account'"
            @blur="activeField = ''"
          />
        </div>

        <!-- 密码 -->
        <div class="input-group" :class="{ focused: activeField === 'password' }">
          <span class="input-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="请输入密码"
            @focus="activeField = 'password'"
            @blur="activeField = ''"
          />
          <span class="eye-icon" @click="showPassword = !showPassword">
            <svg
              v-if="showPassword"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
              />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </span>
        </div>

        <!-- 辅助选项 -->
        <div class="form-options">
          <label class="remember-label" @click="form.remember = !form.remember">
            <span class="checkbox" :class="{ checked: form.remember }">
              <svg v-if="form.remember" viewBox="0 0 24 24" width="14" height="14" fill="#165DFF">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </span>
            <span>记住密码</span>
          </label>
          <a class="forgot-link" href="javascript:;">忘记密码？</a>
        </div>

        <!-- 登录按钮 -->
        <button class="login-btn" :disabled="isLoading" @click="handleLogin">
          <span>登 录</span>
        </button>

        <!-- 注册入口 -->
        <div class="register-link">
          还没有账号？<a href="javascript:;" @click="$router.push('/register')">立即注册</a>
        </div>
      </div>

      <!-- 第三方登录 -->
      <div class="third-party">
        <div class="divider">
          <span class="divider-text">其他方式登录</span>
        </div>
        <div class="social-icons">
          <div class="social-item wechat">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#09BB07">
              <path
                d="M8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-7.97 3.17A7.5 7.5 0 0 1 12 6c3.7 0 6.8 2.61 7.43 6H22c0-5.52-4.48-10-10-10S2 6.48 2 12c0 1.8.47 3.5 1.3 4.97L2 22l5.5-1.5c.77.32 1.62.5 2.5.5 1.24 0 2.4-.3 3.47-.83A7.5 7.5 0 0 1 5.53 14.17z"
              />
            </svg>
            <span>微信</span>
          </div>
          <div class="social-item qq">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#12B7F5">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14c-1.5 0-2.5-1-3-2 0 0-1 .5-2 .5s-2-.5-2-.5c-.5 1-1.5 2-3 2-1.5 0-2.5-1-2.5-2.5 0-.5.5-1.5 1-2 0 0-.5-1.5.5-3 1-1.5 3-2 4-2s3 .5 4 2c1 1.5.5 3 .5 3 .5.5 1 1.5 1 2 0 1.5-1 2.5-2.5 2.5z"
              />
            </svg>
            <span>QQ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <p class="copyright">优选商城 &copy; 2026</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import { goLogin } from '@/api/login'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

// 登录按钮禁用
const isLoading = ref(false)

// 当前聚焦的输入框
const activeField = ref('')

// 密码是否可见
const showPassword = ref(false)

// 表单数据
const form = reactive({
  account: '',
  password: '',
  remember: false
})

// 登录处理
const handleLogin = async () => {
  // 防止重复提交
  if (isLoading.value) {
    return
  }
  if (!form.account) {
    showToast('请输入账号')
    return
  }
  if (!form.password) {
    showToast('请输入密码')
    return
  }
  // 开启登录按钮
  isLoading.value = true
  try {
    const res = await goLogin({
      username: form.account,
      password: form.password
    })
    if (res.code === 200) {
      showToast('登录成功')
      // 使用 userStore 保存 token 和 userId
      const userId = res.data.userInfo?.id || 0
      userStore.setToken(res.data.token, userId)

      // 重新加载购物车和订单（切换到当前用户）
      cartStore.reloadForUser()
      orderStore.reloadForUser()

      // 获取重定向地址
      const redirect = route.query.redirect as string
      try {
        if (redirect) {
          await router.replace(redirect)
        } else {
          await router.replace('/home')
        }
      } catch (error) {
        console.error('导航失败:', error)
        await router.replace('/home')
      }
    } else {
      showToast(res.msg || '账号密码错误')
    }
  } catch (error) {
    console.log(error)
    showToast('登录失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ===== 页面容器 ===== */
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 30%, #a8c8fa 70%, #8ab4f8 100%);
  overflow: hidden;
  padding: 20px;
}

/* ===== 背景装饰圆圈 ===== */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  background: #165dff;
  pointer-events: none;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -60px;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: -60px;
  opacity: 0.1;
}

.bg-circle-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: 10%;
  opacity: 0.08;
}

/* ===== 登录卡片（毛玻璃效果） ===== */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(22, 93, 255, 0.12);
}

/* ===== Logo 区域 ===== */
.logo-area {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  margin-bottom: 12px;
}

.app-name {
  font-size: 26px;
  font-weight: 700;
  color: #1d2129;
  margin: 0 0 6px;
  letter-spacing: 2px;
}

.app-slogan {
  font-size: 13px;
  color: #86909c;
  margin: 0;
}

/* ===== 输入框组 ===== */
.input-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  height: 50px;
}

.input-group.focused {
  border-color: #165dff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
}

.input-icon {
  color: #86909c;
  display: flex;
  align-items: center;
  margin-right: 10px;
  flex-shrink: 0;
  transition: color 0.3s;
}

.input-group.focused .input-icon {
  color: #165dff;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1d2129;
  height: 100%;
}

.input-field::placeholder {
  color: #c9cdd4;
}

/* 密码可见切换 */
.eye-icon {
  cursor: pointer;
  color: #86909c;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s;
}

.eye-icon:hover {
  color: #165dff;
}

/* ===== 辅助选项 ===== */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4e5969;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid #c9cdd4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  border-color: #165dff;
  background: rgba(22, 93, 255, 0.08);
}

.forgot-link {
  font-size: 13px;
  color: #165dff;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ===== 登录按钮 ===== */
.login-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #165dff 0%, #3c7cff 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(22, 93, 255, 0.3);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(22, 93, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
}

/* ===== 注册入口 ===== */
.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #86909c;
}

.register-link a {
  color: #165dff;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* ===== 第三方登录 ===== */
.third-party {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e6eb;
}

.divider-text {
  padding: 0 16px;
  font-size: 12px;
  color: #c9cdd4;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.social-item:hover {
  transform: scale(1.1);
}

.social-item span {
  font-size: 12px;
  color: #86909c;
}

/* ===== 版权 ===== */
.copyright {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  font-size: 12px;
  color: #a8a8a8;
}

/* ===== 响应式适配 ===== */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  .app-name {
    font-size: 22px;
  }

  .bg-circle-1 {
    width: 200px;
    height: 200px;
    top: -40px;
    right: -40px;
  }

  .bg-circle-2 {
    width: 140px;
    height: 140px;
  }
}

@media (min-width: 768px) {
  .login-page {
    padding: 40px;
  }
}
</style>
