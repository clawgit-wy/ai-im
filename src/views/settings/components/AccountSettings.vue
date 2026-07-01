<template>
  <div class="account-settings">
    <!-- 账户信息 -->
    <div class="settings-section">
      <div class="settings-title">账户信息</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">用户名</div>
            <div class="settings-desc">显示名称</div>
          </div>
          <n-input v-model:value="formData.name" placeholder="请输入用户名" class="settings-input" />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">邮箱</div>
            <div class="settings-desc">用于接收通知</div>
          </div>
          <n-input v-model:value="formData.email" placeholder="请输入邮箱" class="settings-input" />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">手机号</div>
            <div class="settings-desc">用于账号验证</div>
          </div>
          <n-input
            v-model:value="formData.phone"
            placeholder="未绑定"
            class="settings-input"
          />
        </div>
      </div>
    </div>

    <!-- 账号操作 -->
    <div class="settings-section">
      <div class="settings-title">账号操作</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-label">修改密码</div>
          <n-button size="small" type="primary" @click="showPasswordModal = true">修改</n-button>
        </div>
        <div class="settings-item">
          <div class="settings-label">退出登录</div>
          <n-button size="small" type="error" @click="handleLogout">退出</n-button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPasswordModal" preset="card" title="修改密码" class="account-modal">
      <n-form label-placement="top">
        <n-form-item label="当前密码">
          <n-input v-model:value="passwordForm.oldPassword" type="password" show-password-on="click" placeholder="请输入当前密码" />
        </n-form-item>
        <n-form-item label="新密码">
          <n-input v-model:value="passwordForm.newPassword" type="password" show-password-on="click" placeholder="请输入新密码" />
        </n-form-item>
        <n-form-item label="确认新密码">
          <n-input v-model:value="passwordForm.confirmPassword" type="password" show-password-on="click" placeholder="请再次输入新密码" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="primary" @click="handleChangePassword">修改</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 退出登录确认 -->
    <n-modal v-model:show="showLogoutModal" preset="card" title="确认退出" class="account-modal">
      <p class="logout-tip">确定要退出登录吗？退出后需要重新登录才能使用应用。</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showLogoutModal = false">取消</n-button>
          <n-button type="error" @click="confirmLogout">退出</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'AccountSettings' })

const userStore = useUserStore()

/** 账户信息表单 */
const formData = reactive({
  name: (userStore.userInfo?.name as string) || '用户1',
  email: (userStore.userInfo?.email as string) || 'user@example.com',
  phone: (userStore.userInfo?.phone as string) || ''
})

/** 修改密码弹窗 */
const showPasswordModal = ref(false)
/** 退出登录弹窗 */
const showLogoutModal = ref(false)

/** 密码表单 */
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

/** 修改密码 */
function handleChangePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    window.$message?.warning('请填写完整密码信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    window.$message?.error('两次输入的密码不一致')
    return
  }
  showPasswordModal.value = false
  window.$message?.success('密码已修改')
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

/** 点击退出登录 */
function handleLogout() {
  showLogoutModal.value = true
}

/** 确认退出登录 */
function confirmLogout() {
  showLogoutModal.value = false
  userStore.logout()
  window.$message?.info('已退出登录')
}
</script>

<style scoped>
.account-settings {
  --as-text-color: #18181c;
  --as-text-color-3: #5c6166;
  --as-base-color: #ffffff;
  --as-line-color: #e3e3e3;
}

:global(html[data-theme='dark']) .account-settings {
  --as-text-color: #ffffff;
  --as-text-color-3: #8b93a7;
  --as-base-color: #1b1b1b;
  --as-line-color: #404040;
}

.settings-section {
  margin-bottom: 16px;
}

.settings-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--as-text-color);
}

.settings-group {
  background: var(--as-base-color);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--as-line-color);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--as-line-color);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item-label {
  display: flex;
  flex-direction: column;
}

.settings-label {
  font-size: 13px;
  color: var(--as-text-color);
}

.settings-desc {
  font-size: 11px;
  color: var(--as-text-color-3);
  margin-top: 3px;
}

.settings-input {
  width: 200px;
}

.account-modal {
  width: 420px;
}

.logout-tip {
  font-size: 14px;
  color: var(--as-text-color);
  line-height: 1.6;
}
</style>
