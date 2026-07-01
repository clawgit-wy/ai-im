<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">🤖</div>
          <h1 class="brand-title">AI-IM</h1>
          <p class="brand-subtitle">智能助手桌面应用</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span>智能对话</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📅</span>
              <span>日程管理</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>AI 工作流</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔌</span>
              <span>插件扩展</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-section">
        <div class="form-header">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-desc">请输入您的账号和密码</p>
        </div>
        <n-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-placement="top"
          size="large"
          @keyup.enter="handleLogin">
          <n-form-item label="账号" path="account">
            <n-input
              v-model:value="loginForm.account"
              placeholder="邮箱 / 手机号 / 用户名"
              clearable>
              <template #prefix>
                <span class="form-icon">👤</span>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="loginForm.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码">
              <template #prefix>
                <span class="form-icon">🔒</span>
              </template>
            </n-input>
          </n-form-item>
          <div class="form-options">
            <n-checkbox v-model:checked="loginForm.remember">记住我</n-checkbox>
          </div>
          <n-button
            type="primary"
            block
            size="large"
            :loading="loginLoading"
            class="submit-btn"
            @click="handleLogin">
            登 录
          </n-button>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { FormInst, FormRules } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInst | null>(null)
const loginLoading = ref(false)
const loginForm = reactive({
  account: 'user@example.com',
  password: '123456',
  remember: true
})
const loginRules: FormRules = {
  account: { required: true, message: '请输入账号', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' }
}

async function handleLogin() {
  try {
    await loginFormRef.value?.validate()
  } catch {
    return
  }
  loginLoading.value = true
  try {
    await userStore.login(loginForm.account, loginForm.password)
    window.$message?.success('登录成功')
    router.push('/home/chat')
  } catch (err) {
    console.error('登录失败:', err)
  } finally {
    loginLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #13987f 0%, #6c5ce7 100%);
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.bg-circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
}
.bg-circle-2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  right: -60px;
}
.bg-circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 60%;
  background: rgba(255, 255, 255, 0.05);
}

/* 登录卡片 */
.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 880px;
  max-width: 90vw;
  height: 480px;
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* 品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #13987f 0%, #0d7a66 100%);
  color: #fff;
  padding: 40px;
}
.brand-content {
  text-align: center;
}
.brand-logo {
  font-size: 64px;
  margin-bottom: 16px;
}
.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: 2px;
}
.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 40px;
}
.brand-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  text-align: left;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.95;
}
.feature-icon {
  font-size: 18px;
}

/* 表单区 */
.form-section {
  flex: 1;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 32px;
}
.form-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #18181c;
}
.form-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.form-icon {
  font-size: 16px;
  opacity: 0.6;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  margin-top: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: #13987f;
  border-color: #13987f;
  &:hover {
    background: #0d7a66;
    border-color: #0d7a66;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    width: 90vw;
    height: auto;
    min-height: 500px;
  }
  .brand-section {
    padding: 24px;
    min-height: 140px;
  }
  .brand-title {
    font-size: 24px;
  }
  .brand-subtitle {
    font-size: 14px;
    margin-bottom: 16px;
  }
  .brand-features {
    display: none;
  }
  .form-section {
    padding: 24px;
  }
}
</style>
