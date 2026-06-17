import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { buildStudyReply, tryConstitutionReply } from '@/utils/studyAssistant'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createTime: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  updateTime: string
}

const STORAGE_KEY = 'bencao_study_chat'

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function titleFromText(text: string) {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > 18 ? `${t.slice(0, 18)}…` : t || '新对话'
}

export const useStudyChatStore = defineStore('studyChat', () => {
  const sessions = ref<ChatSession[]>(loadSessions())
  const activeSessionId = ref<string | null>(sessions.value[0]?.id ?? null)
  const replying = ref(false)

  watch(
    sessions,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
  )

  const hasMessages = computed(() => (activeSession.value?.messages.length ?? 0) > 0)

  function createSession() {
    const session: ChatSession = {
      id: genId('chat'),
      title: '新对话',
      messages: [],
      updateTime: new Date().toISOString(),
    }
    sessions.value = [session, ...sessions.value]
    activeSessionId.value = session.id
    return session
  }

  function selectSession(id: string) {
    if (sessions.value.some((s) => s.id === id)) {
      activeSessionId.value = id
    }
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id ?? null
    }
  }

  function ensureActiveSession() {
    if (!activeSessionId.value || !activeSession.value) {
      return createSession()
    }
    return activeSession.value
  }

  async function sendMessage(content: string) {
    const text = content.trim()
    if (!text || replying.value) return

    const session = ensureActiveSession()
    const userMsg: ChatMessage = {
      id: genId('msg'),
      role: 'user',
      content: text,
      createTime: new Date().toISOString(),
    }
    session.messages.push(userMsg)
    if (session.messages.length === 1) {
      session.title = titleFromText(text)
    }
    session.updateTime = userMsg.createTime
    sessions.value = [...sessions.value].sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(),
    )

    replying.value = true
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))

    const reply = tryConstitutionReply(text) ?? buildStudyReply(text)
    const assistantMsg: ChatMessage = {
      id: genId('msg'),
      role: 'assistant',
      content: reply,
      createTime: new Date().toISOString(),
    }
    session.messages.push(assistantMsg)
    session.updateTime = assistantMsg.createTime
    sessions.value = [...sessions.value].sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(),
    )
    replying.value = false
  }

  function startNewChat() {
    createSession()
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    hasMessages,
    replying,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    startNewChat,
    ensureActiveSession,
  }
})
