<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginByPhone } from '@/api/auth'
import { useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('13800138000')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!phone.value.trim() || !password.value) {
    ElMessage.warning('请输入手机号和密码')
    return
  }
  loading.value = true
  try {
    const data = await loginByPhone(phone.value.trim(), password.value)
    userStore.setToken(data.accessToken)
    userStore.setUserBrief(data.userBrief)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch {
    /* 错误已由 request 提示 */
  } finally {
    loading.value = false
  }
}

function goAdminLogin() {
  router.push('/admin/login')
}
</script>

<template>
  <div class="login-page user-login">
    <el-card class="login-card" shadow="hover">
      <div class="login-brand">
        <span class="brand-icon">🌿</span>
        <h2>本草萌智 · 用户登录</h2>
        <p>游客可自由浏览全站；登录后可购买、发帖与互动</p>
      </div>
      <el-form label-width="80px" @submit.prevent="handleLogin">
        <el-form-item label="手机号">
          <el-input v-model="phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span class="hint">演示账号：13800138000 / password</span>
        <el-button type="primary" link @click="goAdminLogin">管理员登录 →</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7f3eb 0%, #e8f5ee 100%);
}

.login-card {
  width: 420px;
  border-radius: 12px;
}

.login-brand {
  text-align: center;
  margin-bottom: 24px;
}

.brand-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.login-brand h2 {
  margin: 0 0 8px;
  color: #1a5f3f;
  font-size: 20px;
}

.login-brand p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: #909399;
}
</style>
