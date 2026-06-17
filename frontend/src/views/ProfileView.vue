<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  ChatDotRound,
  Document,
  EditPen,
  Lock,
  ShoppingCart,
  ShoppingBag,
  Sunny,
} from '@element-plus/icons-vue'
import ProfilePageShell from '@/components/profile/ProfilePageShell.vue'
import {
  AVATAR_PRESETS,
  GENDER_OPTIONS,
  avatarDisplay,
  avatarImageUrl,
  changeMyPassword,
  fetchMyProfile,
  maskPhone,
  updateMyProfile,
  type UserProfile,
} from '@/api/profile'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { useOrderStore } from '@/store/order'
import {
  calcRecordStreak,
  listHistoryLogs,
  loadCheckinPlans,
  loadDailyLogs,
} from '@/utils/wellnessStorage'

type ProfileTab = 'profile' | 'security' | 'overview'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const loading = ref(false)
const saving = ref(false)
const pwdSaving = ref(false)
const profile = ref<UserProfile | null>(null)

const form = reactive({
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: '' as string | null,
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const activeTab = computed<ProfileTab>(() => {
  const tab = route.query.tab
  if (tab === 'security' || tab === 'overview') return tab
  return 'profile'
})

const userId = computed(() => userStore.userBrief?.userId)

const wellnessStats = computed(() => {
  const plans = loadCheckinPlans(userId.value)
  const logs = loadDailyLogs(userId.value)
  const history = listHistoryLogs(logs, plans.length)
  return {
    recordDays: history.length,
    streak: calcRecordStreak(logs),
    planCount: plans.length,
  }
})

const quickLinks = computed(() => [
  { label: '本草市集', desc: '选购养生好物', path: '/market', icon: ShoppingBag, tone: 'green' },
  { label: '购物车', desc: `${cartStore.totalCount} 件商品`, path: '/market/cart', icon: ShoppingCart, tone: 'gold' },
  { label: '我的订单', desc: `${orderStore.orderCount} 笔订单`, path: '/market/orders', icon: Document, tone: 'green' },
  { label: '养生打卡', desc: '记录每日起居', path: '/wellness', icon: Sunny, tone: 'gold' },
  { label: '打卡历史', desc: `${wellnessStats.value.recordDays} 天有记录`, path: '/wellness/history', icon: Calendar, tone: 'green' },
  { label: '萌智伴学', desc: 'AI 中医问答', path: '/study', icon: ChatDotRound, tone: 'gold' },
])

function avatarPreviewText() {
  if (form.avatar.startsWith('emoji:')) return form.avatar.slice(6)
  return avatarDisplay(form.avatar, form.nickname)
}

function avatarPreviewImage() {
  return avatarImageUrl(form.avatar)
}

function syncForm(data: UserProfile) {
  form.nickname = data.nickname || ''
  form.avatar = data.avatar || ''
  form.gender = data.gender ?? 0
  form.birthday = data.birthday || null
}

async function loadProfile() {
  loading.value = true
  try {
    const data = await fetchMyProfile()
    profile.value = data
    syncForm(data)
    userStore.setUserBrief({
      userId: data.id,
      nickname: data.nickname,
      avatar: data.avatar,
    })
  } catch {
    profile.value = null
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!form.nickname.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  saving.value = true
  try {
    const data = await updateMyProfile({
      nickname: form.nickname.trim(),
      avatar: form.avatar.trim(),
      gender: form.gender,
      birthday: form.birthday || null,
    })
    profile.value = data
    syncForm(data)
    userStore.setUserBrief({
      userId: data.id,
      nickname: data.nickname,
      avatar: data.avatar,
    })
    ElMessage.success('资料已保存')
  } catch {
    /* request 已提示 */
  } finally {
    saving.value = false
  }
}

async function submitPassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    ElMessage.warning('请完整填写密码信息')
    return
  }
  if (pwdForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  pwdSaving.value = true
  try {
    await changeMyPassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    })
    ElMessage.success('密码已更新，请重新登录')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    userStore.logout()
    router.replace('/login?redirect=/profile')
  } catch {
    /* request 已提示 */
  } finally {
    pwdSaving.value = false
  }
}

function selectAvatar(value: string) {
  form.avatar = value
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

watch(
  () => route.query.tab,
  (tab) => {
    if (tab !== 'profile' && tab !== 'security' && tab !== 'overview' && route.path === '/profile') {
      router.replace({ path: '/profile', query: { tab: 'profile' } })
    }
  },
)

onMounted(loadProfile)
</script>

<template>
  <ProfilePageShell>
    <div v-loading="loading" class="profile-page">
      <header class="hero-card">
        <div class="hero-user">
          <el-avatar :size="72" class="hero-avatar" :src="avatarPreviewImage() || undefined">
            <span v-if="!avatarPreviewImage()" class="avatar-fallback">{{ avatarPreviewText() }}</span>
          </el-avatar>
          <div>
            <h1>{{ profile?.nickname || '个人中心' }}</h1>
            <p class="hero-phone">{{ maskPhone(profile?.phone) }}</p>
            <p class="hero-meta">
              注册于 {{ formatDateTime(profile?.createTime) }}
              <span v-if="profile?.lastLoginTime"> · 上次登录 {{ formatDateTime(profile.lastLoginTime) }}</span>
            </p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <strong>{{ orderStore.orderCount }}</strong>
            <span>市集订单</span>
          </div>
          <div class="stat">
            <strong>{{ wellnessStats.recordDays }}</strong>
            <span>打卡天数</span>
          </div>
          <div class="stat">
            <strong>{{ wellnessStats.streak }}</strong>
            <span>连续记录</span>
          </div>
        </div>
      </header>

      <section v-if="activeTab === 'profile'" class="panel">
        <div class="panel-head">
          <h2><el-icon><EditPen /></el-icon> 编辑资料</h2>
          <p>完善昵称与头像，让本草萌智更懂你</p>
        </div>

        <el-form label-width="88px" class="profile-form" @submit.prevent="saveProfile">
          <el-form-item label="头像">
            <div class="avatar-editor">
              <el-avatar :size="64" :src="avatarPreviewImage() || undefined">
                <span v-if="!avatarPreviewImage()" class="avatar-fallback">{{ avatarPreviewText() }}</span>
              </el-avatar>
              <div class="avatar-presets">
                <button
                  v-for="item in AVATAR_PRESETS"
                  :key="item.value || 'default'"
                  type="button"
                  class="preset-btn"
                  :class="{ active: form.avatar === item.value }"
                  @click="selectAvatar(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
              <el-input v-model="form.avatar" placeholder="或粘贴图片 URL（选填）" clearable />
            </div>
          </el-form-item>

          <el-form-item label="昵称" required>
            <el-input v-model="form.nickname" maxlength="64" show-word-limit placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="手机号">
            <el-input :model-value="maskPhone(profile?.phone)" disabled />
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio v-for="opt in GENDER_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="生日">
            <el-date-picker
              v-model="form.birthday"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择生日（选填）"
              style="width: 100%"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="saving">保存资料</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section v-else-if="activeTab === 'security'" class="panel">
        <div class="panel-head">
          <h2><el-icon><Lock /></el-icon> 修改密码</h2>
          <p>定期更换密码，保障账号安全</p>
        </div>

        <el-form label-width="96px" class="profile-form" @submit.prevent="submitPassword">
          <el-form-item label="原密码" required>
            <el-input v-model="pwdForm.oldPassword" type="password" show-password autocomplete="current-password" />
          </el-form-item>
          <el-form-item label="新密码" required>
            <el-input v-model="pwdForm.newPassword" type="password" show-password autocomplete="new-password" />
          </el-form-item>
          <el-form-item label="确认新密码" required>
            <el-input v-model="pwdForm.confirmPassword" type="password" show-password autocomplete="new-password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="pwdSaving">更新密码</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section v-else class="panel">
        <div class="panel-head">
          <h2><el-icon><Sunny /></el-icon> 我的概览</h2>
          <p>汇总你在本草萌智的学习与养生足迹</p>
        </div>

        <div class="overview-grid">
          <div class="overview-card">
            <span class="overview-label">养生打卡</span>
            <strong>{{ wellnessStats.recordDays }}</strong>
            <span class="overview-sub">累计有记录 {{ wellnessStats.recordDays }} 天 · 连续 {{ wellnessStats.streak }} 天</span>
          </div>
          <div class="overview-card">
            <span class="overview-label">市集订单</span>
            <strong>{{ orderStore.orderCount }}</strong>
            <span class="overview-sub">购物车 {{ cartStore.totalCount }} 件商品待结算</span>
          </div>
          <div class="overview-card">
            <span class="overview-label">打卡计划</span>
            <strong>{{ wellnessStats.planCount }}</strong>
            <span class="overview-sub">可在智趣养生中自定义</span>
          </div>
        </div>

        <h3 class="links-title">快捷入口</h3>
        <div class="quick-grid">
          <RouterLink
            v-for="item in quickLinks"
            :key="item.path"
            :to="item.path"
            class="quick-card"
            :class="`quick-card--${item.tone}`"
          >
            <el-icon class="quick-icon"><component :is="item.icon" /></el-icon>
            <div>
              <strong>{{ item.label }}</strong>
              <span>{{ item.desc }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
  </ProfilePageShell>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, var(--bc-primary) 0%, #2d8a5e 100%);
  border-radius: var(--bc-radius-lg);
  color: #fff;
  box-shadow: 0 8px 24px rgba(26, 95, 63, 0.18);
}

.hero-user {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.hero-avatar {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  font-size: 28px;
}

.avatar-fallback {
  font-size: 24px;
  font-weight: 700;
}

.hero-user h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
}

.hero-phone {
  margin: 0 0 4px;
  font-size: 15px;
  opacity: 0.95;
}

.hero-meta {
  margin: 0;
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.5;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.stat {
  min-width: 88px;
  padding: 12px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--bc-radius);
}

.stat strong {
  display: block;
  font-size: 22px;
  line-height: 1.2;
}

.stat span {
  font-size: 12px;
  opacity: 0.88;
}

.panel {
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius-lg);
  padding: 24px 28px 28px;
  box-shadow: var(--bc-shadow);
}

.panel-head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--bc-primary);
}

.panel-head p {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--bc-text-muted);
}

.profile-form {
  max-width: 520px;
}

.avatar-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.avatar-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  min-width: 44px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--bc-border);
  border-radius: 18px;
  background: var(--bc-bg-muted);
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.2s, background 0.2s;
}

.preset-btn.active,
.preset-btn:hover {
  border-color: var(--bc-primary);
  background: var(--bc-primary-light);
  color: var(--bc-primary);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  padding: 18px;
  border-radius: var(--bc-radius);
  background: var(--bc-bg-muted);
  border: 1px solid var(--bc-border-light);
}

.overview-label {
  display: block;
  font-size: 13px;
  color: var(--bc-text-muted);
  margin-bottom: 8px;
}

.overview-card strong {
  display: block;
  font-size: 28px;
  color: var(--bc-primary);
  line-height: 1.1;
  margin-bottom: 6px;
}

.overview-sub {
  font-size: 12px;
  color: var(--bc-text-secondary);
  line-height: 1.5;
}

.links-title {
  margin: 0 0 14px;
  font-size: 16px;
  color: var(--bc-text);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--bc-radius);
  border: 1px solid var(--bc-border);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bc-shadow);
  border-color: var(--bc-primary);
}

.quick-card--green .quick-icon {
  color: var(--bc-primary);
  background: var(--bc-primary-light);
}

.quick-card--gold .quick-icon {
  color: var(--bc-accent);
  background: #f5f0e8;
}

.quick-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 20px;
  flex-shrink: 0;
}

.quick-card strong {
  display: block;
  font-size: 15px;
  margin-bottom: 4px;
  color: var(--bc-text);
}

.quick-card span {
  font-size: 12px;
  color: var(--bc-text-muted);
}

@media (max-width: 960px) {
  .hero-card {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats {
    justify-content: space-between;
  }

  .stat {
    flex: 1;
  }

  .overview-grid,
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
