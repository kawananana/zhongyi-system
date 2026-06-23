<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { avatarDisplay, avatarImageUrl } from '@/api/profile'
import { useUserStore } from '@/store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navItems = [
  { label: '首页', path: '/' },
  { label: '本草图鉴', path: '/atlas/herbs' },
  { label: '本草百科', path: '/atlas/articles' },
  { label: '3D针灸', path: '/atlas/acupoint' },
  { label: '萌智伴学', path: '/study' },
  { label: '药膳食疗', path: '/guide' },
  { label: '智趣养生', path: '/wellness' },
  { label: '本草市集', path: '/market' },
]

const headerAvatarText = computed(() =>
  avatarDisplay(userStore.userBrief?.avatar, userStore.userBrief?.nickname),
)
const headerAvatarUrl = computed(() => avatarImageUrl(userStore.userBrief?.avatar))

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  if (path === '/market') {
    return route.path === '/market' || route.path.startsWith('/market/')
  }
  if (path === '/profile') {
    return route.path === '/profile'
  }
  if (path === '/study') {
    return route.path === '/study' || route.path.startsWith('/study/')
  }
  if (path === '/atlas/acupoint') {
    return route.path === '/atlas/acupoint'
  }
  return route.path === path || route.path.startsWith(path + '/')
}

function go(path: string) {
  router.push(path)
}

function goLogin() {
  router.push('/login')
}

function goRegister() {
  router.push('/register')
}

function goProfile() {
  router.push('/profile')
}

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="home-header">
    <div class="header-inner">
      <div class="logo-area" @click="go('/')">
        <span class="logo-icon">🌿</span>
        <span class="logo-text">本草萌智</span>
      </div>

      <nav class="nav-menu">
        <a
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click.prevent="go(item.path)"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="user-area">
        <template v-if="userStore.isLoggedIn()">
          <button type="button" class="profile-entry" @click="goProfile">
            <el-avatar :size="32" :src="headerAvatarUrl || undefined" class="header-avatar">
              <span v-if="!headerAvatarUrl" class="avatar-fallback">{{ headerAvatarText }}</span>
            </el-avatar>
            <span class="user-nick">{{ userStore.userBrief?.nickname || '用户' }}</span>
          </button>
          <el-button size="small" @click="logout">登出</el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="goRegister">注册</el-button>
          <el-button type="primary" size="small" @click="goLogin">登录</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.home-header {
  background: var(--bc-bg-card);
  border-bottom: 1px solid var(--bc-border);
  box-shadow: var(--bc-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 32px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bc-primary);
  border-radius: 50%;
  font-size: 18px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--bc-primary);
  font-family: 'Songti SC', 'SimSun', serif;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-item {
  padding: 8px 16px;
  font-size: 15px;
  color: var(--bc-text-secondary);
  text-decoration: none;
  border-radius: 20px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.nav-item:hover {
  color: var(--bc-primary);
  background: var(--bc-primary-soft);
}

.nav-item.active {
  color: var(--bc-primary);
  font-weight: 600;
  background: var(--bc-primary-light);
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.profile-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border: 1px solid var(--bc-border);
  border-radius: 999px;
  background: var(--bc-bg-muted);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.profile-entry:hover {
  border-color: var(--bc-primary);
  background: var(--bc-primary-soft);
}

.header-avatar {
  background: var(--bc-primary-light);
  color: var(--bc-primary);
  font-size: 14px;
  font-weight: 700;
}

.avatar-fallback {
  font-size: 14px;
}

.user-nick {
  font-size: 14px;
  color: var(--bc-text-secondary);
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
