<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import { requireUserLogin } from '@/utils/requireLogin'

const router = useRouter()
const route = useRoute()
const open = ref(false)

const isHerbAtlas = computed(() => {
  const path = route.path
  return path === '/atlas/herbs' || (path.startsWith('/atlas/herbs/') && path !== '/atlas/herbs/dice-map')
})

function togglePanel() {
  open.value = !open.value
}

function closePanel() {
  open.value = false
}

function startQuiz() {
  closePanel()
  if (!requireUserLogin(router, '请先登录后再进行体质测评', '/constitution')) return
  router.push('/constitution')
}

function goDiceMap() {
  closePanel()
  router.push({ path: '/atlas/herbs/dice-map', query: { _r: String(Date.now()) } })
}

function goStudy() {
  closePanel()
  router.push('/study')
}
</script>

<template>
  <Transition name="backdrop">
    <div v-if="open" class="bot-backdrop" aria-hidden="true" @click="closePanel" />
  </Transition>

  <div class="home-bot" :class="{ open }">
    <Transition name="panel">
      <aside v-if="open" class="bot-panel" role="dialog" aria-label="本草小萌助手">
        <header class="panel-head">
          <div class="panel-title">
            <span class="bot-avatar sm" aria-hidden="true">🤖</span>
            <div>
              <strong>本草小萌</strong>
              <p>{{ isHerbAtlas ? '边走边学，遇见本草' : '帮你了解自身体质，科学调养' }}</p>
            </div>
          </div>
          <button type="button" class="icon-btn" aria-label="关闭" @click="closePanel">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <div class="panel-body">
          <button v-if="isHerbAtlas" type="button" class="featured-card" @click="goDiceMap">
            <span class="featured-icon">🗺️</span>
            <span class="featured-text">
              <strong>本草寻药地图</strong>
              <span>掷骰子前进 · 落点学习一味草药 · 每次从头出发</span>
            </span>
            <span class="featured-arrow">→</span>
          </button>
          <button v-else type="button" class="featured-card" @click="startQuiz">
            <span class="featured-icon">📋</span>
            <span class="featured-text">
              <strong>九体质 20 题自测</strong>
              <span>3 分钟完成 · 自动判定体质 · 四维调养建议</span>
            </span>
            <span class="featured-arrow">→</span>
          </button>

          <button type="button" class="secondary-card" @click="goStudy">
            <span class="secondary-icon">💬</span>
            <span class="secondary-text">
              <strong>萌智伴学问答</strong>
              <span>测评后可 AI 深入解读</span>
            </span>
          </button>
        </div>
      </aside>
    </Transition>

    <button
      type="button"
      class="fab"
      :aria-expanded="open"
      aria-label="打开小萌助手"
      @click="togglePanel"
    >
      <span class="bot-avatar" aria-hidden="true">🤖</span>
      <span class="fab-ring" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.bot-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1199;
  background: rgba(20, 30, 25, 0.32);
  backdrop-filter: blur(2px);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.22s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.home-bot {
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
  width: min(320px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #c5ddcf;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(61, 48, 40, 0.18);
  overflow: hidden;
}

.open .bot-panel {
  border-color: #1a5f3f;
  box-shadow:
    0 20px 56px rgba(26, 95, 63, 0.28),
    0 0 0 1px rgba(26, 95, 63, 0.14),
    0 0 0 4px rgba(26, 95, 63, 0.06);
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

.panel-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.featured-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #1a5f3f;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0f7f2 0%, #e8f5ee 100%);
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s, box-shadow 0.2s;
}

.featured-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(26, 95, 63, 0.15);
}

.featured-icon {
  flex-shrink: 0;
  font-size: 28px;
}

.featured-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.featured-text strong {
  font-size: 15px;
  color: #1a5f3f;
}

.featured-text span {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.featured-arrow {
  flex-shrink: 0;
  font-size: 18px;
  color: #1a5f3f;
  font-weight: 700;
}

.secondary-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #ebe6dc;
  border-radius: 12px;
  background: #faf8f4;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
}

.secondary-card:hover {
  border-color: #1a5f3f;
  background: #f0f7f2;
}

.secondary-icon {
  font-size: 20px;
}

.secondary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.secondary-text strong {
  font-size: 13px;
  color: #303133;
}

.secondary-text span {
  font-size: 11px;
  color: #909399;
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
  .home-bot {
    right: 16px;
    bottom: 16px;
  }

  .bot-panel {
    width: min(300px, calc(100vw - 24px));
  }
}
</style>
