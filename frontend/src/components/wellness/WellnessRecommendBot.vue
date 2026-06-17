<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Close, Refresh } from '@element-plus/icons-vue'
import { useGameScoreStore } from '@/store/gameScore'
import { useUserStore } from '@/store/user'
import {
  buildWellnessRecommendations,
  pickHintText,
  type WellnessRecommendItem,
  type WellnessTabKey,
} from '@/utils/wellnessRecommendations'
import { requireUserLogin } from '@/utils/requireLogin'

const props = defineProps<{
  activeTab: WellnessTabKey
}>()

const emit = defineEmits<{
  'switch-tab': [tab: WellnessTabKey]
}>()

const router = useRouter()
const scoreStore = useGameScoreStore()
const userStore = useUserStore()

const open = ref(false)
const hintVisible = ref(false)
const rotate = ref(0)
let hintTimer: ReturnType<typeof setTimeout> | undefined

const recommendations = computed(() =>
  buildWellnessRecommendations({
    activeTab: props.activeTab,
    userId: userStore.userBrief?.userId,
    getLevelStars: scoreStore.getLevelStars,
    rotate: rotate.value,
  }),
)

const hintText = computed(() => pickHintText(recommendations.value))

function refreshHint() {
  hintVisible.value = false
  if (open.value) return
  hintTimer = setTimeout(() => {
    hintVisible.value = true
  }, 1200)
}

function shuffleRecommendations() {
  rotate.value += 1
}

function togglePanel() {
  open.value = !open.value
  if (open.value) hintVisible.value = false
}

function closePanel() {
  open.value = false
  refreshHint()
}

function onRecommend(item: WellnessRecommendItem) {
  const { action } = item
  if (action.type === 'tab') {
    emit('switch-tab', action.tab)
    closePanel()
    return
  }
  if (action.path.startsWith('/games/')) {
    if (!requireUserLogin(router, '登录后可参与闯关并累计积分')) return
  }
  router.push({ path: action.path, query: action.query })
  closePanel()
}

onMounted(refreshHint)
watch(() => props.activeTab, refreshHint)
watch(recommendations, refreshHint)

onUnmounted(() => {
  if (hintTimer) clearTimeout(hintTimer)
})
</script>

<template>
  <div class="recommend-bot" :class="{ open }">
    <Transition name="panel">
      <aside v-if="open" class="bot-panel" role="dialog" aria-label="养生推荐">
        <header class="panel-head">
          <div class="panel-title">
            <span class="bot-avatar sm" aria-hidden="true">🤖</span>
            <div>
              <strong>本草小萌</strong>
              <p>为你精选 {{ recommendations.length }} 条建议</p>
            </div>
          </div>
          <button type="button" class="icon-btn" aria-label="关闭" @click="closePanel">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <ul class="rec-list">
          <li v-for="item in recommendations" :key="item.id">
            <button type="button" class="rec-card" @click="onRecommend(item)">
              <span class="rec-icon">{{ item.icon }}</span>
              <span class="rec-body">
                <span class="rec-head">
                  <strong>{{ item.title }}</strong>
                  <span v-if="item.tag" class="rec-tag">{{ item.tag }}</span>
                </span>
                <span class="rec-desc">{{ item.desc }}</span>
              </span>
            </button>
          </li>
        </ul>

        <footer class="panel-foot">
          <button type="button" class="refresh-btn" @click="shuffleRecommendations">
            <el-icon><Refresh /></el-icon>
            换一批看看
          </button>
        </footer>
      </aside>
    </Transition>

    <Transition name="hint">
      <div v-if="!open && hintVisible" class="hint-bubble">
        {{ hintText }}
      </div>
    </Transition>

    <button
      type="button"
      class="fab"
      :aria-expanded="open"
      aria-label="打开养生推荐小助手"
      @click="togglePanel"
    >
      <span class="bot-avatar" aria-hidden="true">🤖</span>
      <span class="fab-ring" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.recommend-bot {
  position: fixed;
  right: 24px;
  bottom: 28px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.bot-panel {
  width: min(340px, calc(100vw - 32px));
  max-height: min(420px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(61, 48, 40, 0.18);
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 10px;
  background: linear-gradient(120deg, #1a5f3f 0%, #2d8a5e 100%);
  color: #fff;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-title strong {
  display: block;
  font-size: 15px;
}

.panel-title p {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.icon-btn {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-list {
  list-style: none;
  margin: 0;
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rec-card {
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #ebe6dc;
  border-radius: 12px;
  background: #faf8f4;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.rec-card:hover {
  border-color: #1a5f3f;
  background: #f0f7f2;
  transform: translateY(-1px);
}

.rec-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ebe6dc;
}

.rec-body {
  flex: 1;
  min-width: 0;
}

.rec-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.rec-head strong {
  font-size: 13px;
  color: #303133;
}

.rec-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  background: #e8f5ee;
  color: #1a5f3f;
}

.rec-desc {
  display: block;
  font-size: 12px;
  color: #606266;
  line-height: 1.45;
}

.panel-foot {
  padding: 8px 12px 12px;
  border-top: 1px solid #f0ebe3;
}

.refresh-btn {
  width: 100%;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
}

.refresh-btn:hover {
  color: #1a5f3f;
}

.hint-bubble {
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 14px 14px 4px 14px;
  background: #fff;
  border: 1px solid #d4ebe0;
  box-shadow: 0 4px 16px rgba(26, 95, 63, 0.12);
  font-size: 12px;
  color: #303133;
  line-height: 1.45;
}

.fab {
  position: relative;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: linear-gradient(145deg, #e8f5ee 0%, #d4ebe0 100%);
  box-shadow: 0 6px 20px rgba(26, 95, 63, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 24px rgba(26, 95, 63, 0.32);
}

.open .fab {
  box-shadow: 0 4px 14px rgba(26, 95, 63, 0.2);
}

.bot-avatar {
  font-size: 30px;
  line-height: 1;
}

.bot-avatar.sm {
  font-size: 24px;
}

.fab-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(26, 95, 63, 0.25);
  animation: pulse-ring 2.4s ease-in-out infinite;
  pointer-events: none;
}

.open .fab-ring {
  animation: none;
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.25;
  }
}

@media (max-width: 768px) {
  .recommend-bot {
    right: 16px;
    bottom: 16px;
  }

  .hint-bubble {
    max-width: 180px;
  }
}
</style>
