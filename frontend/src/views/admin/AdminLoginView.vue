<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginByUsername } from '@/api/adminAuth'
import { useAdminStore } from '@/store'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const username = ref('admin')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value.trim() || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const data = await loginByUsername(username.value.trim(), password.value)
    adminStore.setToken(data.accessToken)
    adminStore.setAdminBrief(data.adminBrief)
    ElMessage.success('管理员登录成功')
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    router.replace(redirect)
  } catch {
    /* 错误已由 request 提示 */
  } finally {
    loading.value = false
  }
}

function goUserLogin() {
  router.push('/login')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="login-page admin-login">
    <el-card class="login-card" shadow="hover">
      <div class="login-brand">
        <span class="brand-icon">⚙️</span>
        <h2>运营管理后台</h2>
        <p>管理员登录 · 图鉴 / 商品 / 论坛管控</p>
      </div>
      <el-form label-width="80px" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入管理员用户名" />
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
            进入后台
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span class="hint">演示账号：admin / password</span>
        <div class="links">
          <el-button type="primary" link @click="goUserLogin">← 用户登录</el-button>
          <el-button type="info" link @click="goHome">返回首页</el-button>
        </div>
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
  background: linear-gradient(135deg, #e8ecef 0%, #f0f4f8 100%);
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
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.login-brand h2 {
  margin: 0 0 8px;
  color: #303133;
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

.links {
  display: flex;
  gap: 16px;
}
</style>
