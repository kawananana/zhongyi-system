<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Expand, Fold, Promotion } from '@element-plus/icons-vue'
import TcmDisclaimer from '@/components/common/TcmDisclaimer.vue'
import { useStudyChatStore } from '@/store/studyChat'
import { useUserStore } from '@/store/user'
import { requireUserLogin } from '@/utils/requireLogin'

const props = defineProps<{ sidebarCollapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const router = useRouter()
const userStore = useUserStore()
const chat = useStudyChatStore()
const inputText = ref('')
const listRef = ref<HTMLElement | null>(null)

const suggestions = [
  { label: '九体质自测解读', text: '请根据我的九体质20题自测结果，给出详细解读与调养建议' },
  { label: '解释黄芪的功效', text: '帮我解释「黄芪」的功效与主治' },
  { label: '四气五味入门', text: '四气五味是什么？怎么记？' },
  { label: '当归白芍对比', text: '如何区分当归与白芍？' },
  { label: '7天复习计划', text: '给我一个备考中药学的7天计划' },
  { label: '图鉴怎么用', text: '本草图鉴模块怎么用来学习？' },
  { label: '十八反十九畏', text: '简要说说十八反十九畏' },
]

const headerTitle = computed(() => chat.activeSession?.title ?? '新对话')

function scrollToBottom() {
  nextTick(() => {
    const el = listRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(
  () => chat.activeSession?.messages.length,
  () => scrollToBottom(),
)

watch(
  () => chat.activeSessionId,
  () => scrollToBottom(),
)

function goLogin() {
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}

async function send(text?: string) {
  if (!requireUserLogin(router, '登录后可向 AI 提问')) return
  const content = (text ?? inputText.value).trim()
  if (!content) return
  inputText.value = ''
  if (!chat.activeSession) chat.ensureActiveSession()
  await chat.sendMessage(content)
  scrollToBottom()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function renderMarkdownLite(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
</script>

<template>
  <div class="chat-panel">
    <header class="chat-header">
      <button type="button" class="toggle-sidebar" @click="emit('toggle-sidebar')">
        <el-icon><component :is="props.sidebarCollapsed ? Expand : Fold" /></el-icon>
      </button>
      <div class="header-center">
        <span class="chat-title">{{ headerTitle }}</span>
        <span class="chat-hint">内容由 AI 生成，仅供学习参考</span>
      </div>
    </header>

    <div ref="listRef" class="chat-body">
      <div v-if="!chat.hasMessages" class="welcome">
        <p class="welcome-badge">🌿 本草萌智 · 伴学助手</p>
        <h1>有什么我能帮你的吗？</h1>
        <p class="welcome-sub">亲民伴学小助手「小萌」· 精通中医药 · 药材、方剂、体质、养生都能聊</p>
        <div class="suggestions">
          <button
            v-for="item in suggestions"
            :key="item.label"
            type="button"
            class="chip"
            @click="send(item.text)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div v-else class="messages">
        <div
          v-for="msg in chat.activeSession?.messages"
          :key="msg.id"
          class="message"
          :class="msg.role"
        >
          <div class="avatar">
            {{ msg.role === 'user' ? '我' : '伴' }}
          </div>
          <div
            class="bubble"
            v-html="msg.role === 'assistant' ? renderMarkdownLite(msg.content) : msg.content"
          />
        </div>
        <div v-if="chat.replying" class="message assistant">
          <div class="avatar">伴</div>
          <div class="bubble typing">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>

    <footer class="chat-footer">
      <TcmDisclaimer class="footer-disclaimer" />
      <p v-if="!userStore.isLoggedIn()" class="guest-tip">
        游客可浏览伴学页面，
        <button type="button" class="guest-link" @click="goLogin">登录</button>
        后即可提问互动
      </p>
      <div class="input-wrap">
        <textarea
          v-model="inputText"
          class="chat-input"
          :placeholder="userStore.isLoggedIn() ? '发消息…  Enter 发送，Shift+Enter 换行' : '登录后可向 AI 提问'"
          rows="1"
          :disabled="chat.replying || !userStore.isLoggedIn()"
          @keydown="onKeydown"
        />
        <div class="input-tools">
          <button type="button" class="tool-chip" disabled>+ 附件</button>
          <button type="button" class="tool-chip" :disabled="!userStore.isLoggedIn()" @click="send('四气五味是什么？')">药性基础</button>
          <button type="button" class="tool-chip" :disabled="!userStore.isLoggedIn()" @click="send('帮我对比两味易混药材')">药材对比</button>
          <button type="button" class="tool-chip" :disabled="!userStore.isLoggedIn()" @click="send('制定本周本草学习计划')">学习计划</button>
        </div>
        <button
          type="button"
          class="send-btn"
          :disabled="!userStore.isLoggedIn() || !inputText.trim() || chat.replying"
          aria-label="发送"
          @click="send()"
        >
          <el-icon><Promotion /></el-icon>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bc-bg);
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--bc-border);
  background: var(--bc-bg-card);
  flex-shrink: 0;
}

.toggle-sidebar {
  border: 1px solid var(--bc-border);
  background: var(--bc-bg-muted);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bc-text-secondary);
}

.toggle-sidebar:hover {
  border-color: var(--bc-primary);
  color: var(--bc-primary);
  background: var(--bc-primary-light);
}

.header-center {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.chat-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--bc-text);
  font-family: 'Songti SC', 'SimSun', serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-hint {
  font-size: 11px;
  color: var(--bc-text-muted);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 16px;
}

.welcome {
  max-width: 720px;
  margin: 10vh auto 0;
  text-align: center;
}

.welcome-badge {
  display: inline-block;
  margin: 0 0 16px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--bc-accent);
  background: #ebe6dc;
  border: 1px solid var(--bc-border);
  border-radius: 20px;
}

.welcome h1 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--bc-text);
  font-family: 'Songti SC', 'SimSun', serif;
}

.welcome-sub {
  margin: 0 0 28px;
  font-size: 14px;
  color: var(--bc-text-secondary);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.chip {
  padding: 10px 16px;
  border: 1px solid var(--bc-border);
  border-radius: 20px;
  background: var(--bc-bg-card);
  font-size: 13px;
  color: var(--bc-text-secondary);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.chip:hover {
  background: var(--bc-primary-soft);
  border-color: var(--bc-primary);
  color: var(--bc-primary);
}

.messages {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.message.user .avatar {
  background: var(--bc-primary);
  color: #fff;
}

.message.assistant .avatar {
  background: var(--bc-primary-soft);
  color: var(--bc-primary);
  border: 1px solid var(--bc-border-light);
}

.bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: var(--bc-radius-lg);
  font-size: 14px;
  line-height: 1.65;
  color: var(--bc-text);
  word-break: break-word;
}

.message.user .bubble {
  background: var(--bc-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .bubble {
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-bottom-left-radius: 4px;
  box-shadow: var(--bc-shadow);
}

.bubble :deep(strong) {
  color: var(--bc-primary);
}

.message.user .bubble :deep(strong) {
  color: #fff;
}

.typing {
  display: flex;
  gap: 6px;
  padding: 16px 20px;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bc-accent);
  opacity: 0.5;
  animation: blink 1.2s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

.chat-footer {
  flex-shrink: 0;
  padding: 12px 20px 20px;
  border-top: 1px solid var(--bc-border);
  background: var(--bc-bg-card);
}

.footer-disclaimer {
  max-width: 800px;
  margin: 0 auto 10px;
}

.guest-tip {
  margin: 0 auto 10px;
  max-width: 800px;
  font-size: 13px;
  color: var(--bc-text-muted);
  text-align: center;
}

.guest-link {
  border: none;
  background: none;
  color: var(--bc-primary);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.guest-link:hover {
  text-decoration: underline;
}

.input-wrap {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-radius: 16px;
  box-shadow: var(--bc-shadow);
  padding: 12px 52px 12px 14px;
}

.input-wrap:focus-within {
  border-color: var(--bc-primary);
}

.chat-input {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
  color: var(--bc-text);
  background: transparent;
}

.chat-input::placeholder {
  color: var(--bc-text-muted);
}

.input-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tool-chip {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: var(--bc-bg-muted);
  font-size: 12px;
  color: var(--bc-text-secondary);
  cursor: pointer;
}

.tool-chip:hover:not(:disabled) {
  background: var(--bc-primary-light);
  color: var(--bc-primary);
}

.tool-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--bc-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled {
  background: var(--bc-border);
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: var(--bc-primary-hover);
}
</style>
