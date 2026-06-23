import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { sendStudyChatMessage } from '@/api/studyChat'
import { buildConstitutionAiPrompt, type ConstitutionResult } from '@/utils/constitutionEvaluate'
import { buildStudyReply, tryConstitutionReply } from '@/utils/studyAssistant'
import {
  loadStudyChatSessions,
  saveStudyChatSessions,
  type ChatMessage,
  type ChatSession,
} from '@/utils/studyChatStorage'
import { useUserStore } from '@/store/user'

export type { ChatMessage, ChatSession }

const CONSTITUTION_PAYLOAD_KEY = 'bencao_constitution_payload'

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function titleFromText(text: string) {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > 18 ? `${t.slice(0, 18)}…` : t || '新对话'
}

export const useStudyChatStore = defineStore('studyChat', () => {
  const userStore = useUserStore()
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)
  const replying = ref(false)
  let persistEnabled = false

  function syncFromStorage(userId?: number | null) {
    persistEnabled = false
    if (userId == null) {
      sessions.value = []
      activeSessionId.value = null
      return
    }
    const loaded = loadStudyChatSessions(userId)
    sessions.value = loaded
    activeSessionId.value = loaded[0]?.id ?? null
    persistEnabled = true
  }

  watch(
    () => [userStore.token, userStore.userBrief?.userId] as const,
    ([token, userId]) => {
      if (!token || userId == null) {
        syncFromStorage(null)
      } else {
        syncFromStorage(userId)
      }
    },
    { immediate: true },
  )

  watch(
    sessions,
    (val) => {
      const userId = userStore.userBrief?.userId
      if (!persistEnabled || userId == null) return
      saveStudyChatSessions(userId, val)
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
    const history = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    let constitutionContext: string | undefined
    if (/九体质|体质测评|体质自测|体质解读/.test(text)) {
      try {
        const raw = sessionStorage.getItem(CONSTITUTION_PAYLOAD_KEY)
        if (raw) {
          const { answers, result } = JSON.parse(raw) as {
            answers: Record<number, number>
            result: ConstitutionResult
          }
          constitutionContext = buildConstitutionAiPrompt(answers, result)
          sessionStorage.removeItem(CONSTITUTION_PAYLOAD_KEY)
        }
      } catch {
        // ignore malformed payload
      }
    }

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
    let reply: string
    try {
      const result = await sendStudyChatMessage({
        message: text,
        history,
        constitutionContext,
      })
      reply = result.reply
    } catch {
      reply = tryConstitutionReply(text) ?? buildStudyReply(text)
    }

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
