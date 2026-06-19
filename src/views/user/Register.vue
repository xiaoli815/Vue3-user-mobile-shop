<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    <div class="bg-circle bg-circle-3"></div>

    <!-- 注册卡片 -->
    <div class="register-card">
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
        <h1 class="app-name">创建账号</h1>
        <p class="app-slogan">注册优选商城，开启品质生活</p>
      </div>

      <!-- 表单区域 -->
      <div class="form-area">
        <!-- 手机号 -->
        <div class="input-group" :class="{ focused: activeField === 'phone' }">
          <span class="input-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </span>
          <input
            v-model="form.phone"
            type="tel"
            class="input-field"
            placeholder="请输入手机号"
            maxlength="11"
            @focus="activeField = 'phone'"
            @blur="activeField = ''"
          />
        </div>

        <!-- 验证码 -->
        <div class="input-group" :class="{ focused: activeField === 'code' }">
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
            v-model="form.code"
            type="text"
            class="input-field"
            placeholder="请输入验证码"
            maxlength="6"
            @focus="activeField = 'code'"
            @blur="activeField = ''"
          />
          <button class="code-btn" :disabled="codeCountdown > 0" @click="sendCode">
            {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
          </button>
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
            placeholder="请设置6-16位密码"
            maxlength="16"
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

        <!-- 确认密码 -->
        <div class="input-group" :class="{ focused: activeField === 'confirmPwd' }">
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
            v-model="form.confirmPwd"
            :type="showConfirmPwd ? 'text' : 'password'"
            class="input-field"
            placeholder="请再次输入密码"
            maxlength="16"
            @focus="activeField = 'confirmPwd'"
            @blur="activeField = ''"
          />
          <span class="eye-icon" @click="showConfirmPwd = !showConfirmPwd">
            <svg
              v-if="showConfirmPwd"
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

        <!-- 协议勾选 -->
        <div class="form-options">
          <label class="agree-label" @click="form.agree = !form.agree">
            <span class="checkbox" :class="{ checked: form.agree }">
              <svg v-if="form.agree" viewBox="0 0 24 24" width="14" height="14" fill="#165DFF">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </span>
            <span>
              我已阅读并同意
              <a href="javascript:;" class="link">《用户服务协议》</a>
              和
              <a href="javascript:;" class="link">《隐私政策》</a>
            </span>
          </label>
        </div>

        <!-- 注册按钮 -->
        <button class="register-btn" @click="handleRegister">
          <span>注 册</span>
        </button>

        <!-- 去登录 -->
        <div class="login-link">
          已有账号？<a href="javascript:;" @click="$router.push('/login')">立即登录</a>
        </div>
      </div>

      <!-- 第三方登录 -->
      <div class="third-party">
        <div class="divider">
          <span class="divider-text">其他方式注册</span>
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

// 当前聚焦的输入框
const activeField = ref('')

// 密码是否可见
const showPassword = ref(false)
const showConfirmPwd = ref(false)

// 验证码倒计时
const codeCountdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 表单数据
const form = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPwd: '',
  agree: false
})

// 发送验证码
const sendCode = () => {
  if (!form.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  codeCountdown.value = 60
  showToast('验证码已发送')
  timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// 注册处理
const handleRegister = () => {
  if (!form.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!form.code) {
    showToast('请输入验证码')
    return
  }
  if (!form.password) {
    showToast('请设置密码')
    return
  }
  if (form.password.length < 6) {
    showToast('密码至少6位')
    return
  }
  if (form.password !== form.confirmPwd) {
    showToast('两次密码输入不一致')
    return
  }
  if (!form.agree) {
    showToast('请先阅读并同意用户协议')
    return
  }
  showToast('注册成功')
}
</script>

<style scoped>
/* ===== 页面容器 ===== */
.register-page {
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

/* ===== 注册卡片（毛玻璃效果） ===== */
.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 8px 32px rgba(22, 93, 255, 0.12);
}

/* ===== Logo 区域 ===== */
.logo-area {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon {
  display: inline-flex;
  margin-bottom: 12px;
}

.app-name {
  font-size: 24px;
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
  margin-bottom: 14px;
  transition: all 0.3s ease;
  height: 48px;
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
  font-size: 14px;
  color: #1d2129;
  height: 100%;
}

.input-field::placeholder {
  color: #c9cdd4;
}

/* 验证码按钮 */
.code-btn {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #165dff;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.code-btn:disabled {
  background: #c9cdd4;
  cursor: not-allowed;
}

.code-btn:not(:disabled):hover {
  background: #3c7cff;
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

/* ===== 协议勾选 ===== */
.form-options {
  margin-bottom: 22px;
  padding: 0 4px;
}

.agree-label {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #86909c;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid #c9cdd4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.2s;
}

.checkbox.checked {
  border-color: #165dff;
  background: rgba(22, 93, 255, 0.08);
}

.link {
  color: #165dff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* ===== 注册按钮 ===== */
.register-btn {
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

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(22, 93, 255, 0.4);
}

.register-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
}

/* ===== 去登录 ===== */
.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #86909c;
}

.login-link a {
  color: #165dff;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

/* ===== 第三方登录 ===== */
.third-party {
  margin-top: 28px;
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
  margin-top: 20px;
  font-size: 12px;
  color: #a8a8a8;
}

/* ===== 响应式适配 ===== */
@media (max-width: 480px) {
  .register-card {
    padding: 28px 22px;
    border-radius: 16px;
  }

  .app-name {
    font-size: 20px;
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
  .register-page {
    padding: 40px;
  }
}
</style>
