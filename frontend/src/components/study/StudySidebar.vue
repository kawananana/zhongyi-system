<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChatDotRound,
  Plus,
  Reading,
  Calendar,
  Delete,
} from '@element-plus/icons-vue'
import { useStudyChatStore } from '@/store/studyChat'
import { useUserStore } from '@/store/user'

const props = withDefaults(
  defineProps<{
    collapsed?: boolean
    activeTab?: 'chat' | 'games'
  }>(),
  { activeTab: 'chat' },
)
const emit = defineEmits<{ toggle: [] }>()

const router = useRouter()
const chat = useStudyChatStore()
const userStore = useUserStore()

const displayName = computed(
  () => userStore.userBrief?.nickname || '本草学员',
)

function formatSessionTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function onNewChat() {
  chat.startNewChat()
  router.push('/study')
}

function onSelect(id: string) {
  chat.selectSession(id)
  router.push('/study')
}

function onDelete(e: Event, id: string) {
  e.stopPropagation()
  chat.deleteSession(id)
}

function goChat() {
  router.push('/study')
}

function goGames() {
  router.push('/study?tab=games')
}
</script>

<template>
  <aside class="study-sidebar" :class="{ collapsed }">
    <div class="sidebar-top">
      <RouterLink to="/" class="brand" title="返回首页">
        <span class="brand-icon">🌿</span>
        <span v-show="!collapsed" class="brand-text">萌智伴学</span>
      </RouterLink>
      <button
        v-show="!collapsed"
        type="button"
        class="collapse-btn"
        title="收起侧栏"
        @click="emit('toggle')"
      >
        ‹
      </button>

      <button v-show="!collapsed" type="button" class="new-chat-btn" @click="onNewChat">
        <el-icon><Plus /></el-icon>
        <span>新对话</span>
        <kbd class="kbd">Ctrl K</kbd>
      </button>

      <button v-show="collapsed" type="button" class="icon-only-btn" title="新对话" @click="onNewChat">
        <el-icon><Plus /></el-icon>
      </button>
    </div>

    <nav v-show="!collapsed" class="quick-nav">
      <button
        type="button"
        class="nav-item"
        :class="{ active: activeTab !== 'games' }"
        @click="goChat"
      >
        <el-icon><ChatDotRound /></el-icon>
        AI 伴学
      </button>
      <button
        type="button"
        class="nav-item"
        :class="{ active: activeTab === 'games' }"
        @click="goGames"
      >
        <el-icon><Reading /></el-icon>
        趣学小游戏
      </button>
      <button type="button" class="nav-item" disabled title="即将上线">
        <el-icon><Calendar /></el-icon>
        复习日历
      </button>
    </nav>

    <div v-show="!collapsed" class="history-block">
      <p class="history-label">历史对话</p>
      <ul v-if="chat.sessions.length" class="history-list">
        <li
          v-for="session in chat.sessions"
          :key="session.id"
          class="history-item"
          :class="{ active: chat.activeSessionId === session.id }"
          @click="onSelect(session.id)"
        >
          <el-icon class="item-icon"><ChatDotRound /></el-icon>
          <span class="item-title">{{ session.title }}</span>
          <span class="item-time">{{ formatSessionTime(session.updateTime) }}</span>
          <button
            type="button"
            class="item-del"
            aria-label="删除对话"
            @click="onDelete($event, session.id)"
          >
            <el-icon><Delete /></el-icon>
          </button>
        </li>
      </ul>
      <p v-else class="history-empty">暂无历史，点击「新对话」开始</p>
    </div>

    <div class="sidebar-foot">
      <div class="user-chip">
        <span class="user-avatar">{{ displayName.slice(0, 1) }}</span>
        <span v-show="!collapsed" class="user-name">{{ displayName }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.study-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bc-bg-sidebar);
  border-right: 1px solid var(--bc-border);
  height: 100%;
  transition: width 0.2s;
}

.study-sidebar.collapsed {
  width: 56px;
}

.sidebar-top {
  padding: 16px 12px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  text-decoration: none;
  flex: 1;
  min-width: 0;
}

.brand:hover {
  background: var(--bc-primary-light);
}

.collapse-btn {
  border: none;
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--bc-text-secondary);
  margin-bottom: 14px;
  flex-shrink: 0;
}

.collapse-btn:hover {
  border-color: var(--bc-primary);
  color: var(--bc-primary);
}

.brand-icon {
  font-size: 22px;
}

.brand-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--bc-primary);
  font-family: 'Songti SC', 'SimSun', serif;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius);
  background: var(--bc-bg-card);
  cursor: pointer;
  font-size: 14px;
  color: var(--bc-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.new-chat-btn:hover {
  border-color: var(--bc-primary);
  box-shadow: var(--bc-shadow);
  color: var(--bc-primary);
}

.kbd {
  margin-left: auto;
  font-size: 11px;
  color: var(--bc-text-muted);
  background: var(--bc-bg-muted);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: inherit;
}

.icon-only-btn {
  width: 100%;
  height: 40px;
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius);
  background: var(--bc-bg-card);
  cursor: pointer;
  color: var(--bc-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-only-btn:hover {
  border-color: var(--bc-primary);
  color: var(--bc-primary);
}

.quick-nav {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  color: var(--bc-text-secondary);
  cursor: pointer;
  text-align: left;
}

.nav-item:hover:not(:disabled) {
  background: var(--bc-primary-light);
}

.nav-item.active {
  background: var(--bc-primary-soft);
  color: var(--bc-primary);
  font-weight: 500;
}

.nav-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  overflow: hidden;
}

.history-label {
  margin: 0 8px 8px;
  font-size: 12px;
  color: var(--bc-text-muted);
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}

.history-item:hover {
  background: var(--bc-primary-light);
}

.history-item.active {
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  box-shadow: var(--bc-shadow);
}

.history-item.active .item-title {
  color: var(--bc-primary);
  font-weight: 500;
}

.item-icon {
  flex-shrink: 0;
  color: var(--bc-accent);
  font-size: 16px;
}

.item-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--bc-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 11px;
  color: var(--bc-text-muted);
  flex-shrink: 0;
}

.item-del {
  display: none;
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  color: var(--bc-text-muted);
  border-radius: 4px;
}

.history-item:hover .item-del {
  display: flex;
}

.history-item:hover .item-time {
  display: none;
}

.item-del:hover {
  color: var(--bc-price);
  background: #fdf2f0;
}

.history-empty {
  margin: 8px;
  font-size: 12px;
  color: var(--bc-text-muted);
}

.sidebar-foot {
  padding: 12px;
  border-top: 1px solid var(--bc-border);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border-light);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bc-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: var(--bc-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
