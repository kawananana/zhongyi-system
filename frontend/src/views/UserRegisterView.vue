<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerByPhone } from '@/api/auth'
import { useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  const p = phone.value.trim()
  if (!/^1[3-9]\d{9}$/.test(p)) {
    ElMessage.warning('请输入有效的11位手机号')
    return
  }
  if (!password.value || password.value.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }
  if (password.value !== confirmPassword.value) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    const data = await registerByPhone({
      phone: p,
      password: password.value,
      nickname: nickname.value.trim() || undefined,
    })
    userStore.setToken(data.accessToken)
    userStore.setUserBrief(data.userBrief)
    ElMessage.success('注册成功')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}

function goLogin() {
  router.push({ path: '/login', query: route.query })
}
</script>

<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="hover">
      <div class="auth-brand">
        <span class="brand-icon">🌿</span>
        <h2>本草萌智 · 用户注册</h2>
        <p>注册后可购买市集商品、发帖互动、收藏药匣</p>
      </div>
      <el-form label-width="88px" @submit.prevent="handleRegister">
        <el-form-item label="手机号" required>
          <el-input v-model="phone" placeholder="11位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="nickname" placeholder="选填，默认自动生成" maxlength="64" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input
            v-model="password"
            type="password"
            show-password
            placeholder="至少6位"
            maxlength="32"
          />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input
            v-model="confirmPassword"
            type="password"
            show-password
            placeholder="再次输入密码"
            maxlength="32"
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            注册并登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        <span>已有账号？</span>
        <el-button type="primary" link @click="goLogin">去登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7f3eb 0%, #e8f5ee 100%);
}

.auth-card {
  width: 440px;
  border-radius: 12px;
}

.auth-brand {
  text-align: center;
  margin-bottom: 24px;
}

.brand-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.auth-brand h2 {
  margin: 0 0 8px;
  color: #1a5f3f;
  font-size: 20px;
}

.auth-brand p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}
</style>
