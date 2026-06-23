<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import StudySidebar from '@/components/study/StudySidebar.vue'
import StudyChatPanel from '@/components/study/StudyChatPanel.vue'
import StudyReviewCalendarPanel from '@/components/study/StudyReviewCalendarPanel.vue'
import WellnessGamesPanel from '@/components/wellness/WellnessGamesPanel.vue'
import { useStudyChatStore } from '@/store/studyChat'
import { requireUserLogin } from '@/utils/requireLogin'

type StudyTab = 'chat' | 'games' | 'calendar'

const route = useRoute()
const router = useRouter()
const chat = useStudyChatStore()
const sidebarCollapsed = ref(false)
const constitutionHandled = ref(false)

function tabFromRoute(): StudyTab {
  if (route.query.tab === 'games') return 'games'
  if (route.query.tab === 'calendar') return 'calendar'
  return 'chat'
}

const activeTab = ref<StudyTab>(tabFromRoute())

watch(
  () => route.query.tab,
  () => {
    activeTab.value = tabFromRoute()
  },
)

async function handleConstitutionEntry() {
  if (route.query.from !== 'constitution' || constitutionHandled.value) return
  if (!sessionStorage.getItem('bencao_constitution_payload')) return
  constitutionHandled.value = true
  activeTab.value = 'chat'
  await nextTick()
  if (!requireUserLogin(router, '登录后可使用 AI 体质解读')) return
  await chat.sendMessage('请根据我的九体质20题自测结果，给出详细解读与调养建议')
}

watch(() => route.query.from, handleConstitutionEntry)

function onKeydown(e: KeyboardEvent) {
  if (activeTab.value !== 'chat') return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    chat.startNewChat()
  }
}

onMounted(() => {
  if (!chat.sessions.length) {
    chat.createSession()
  } else if (!chat.activeSessionId) {
    chat.selectSession(chat.sessions[0].id)
  }
  window.addEventListener('keydown', onKeydown)
  handleConstitutionEntry()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="study-page">
    <HomeHeader />
    <div class="study-body">
      <StudySidebar
        :collapsed="sidebarCollapsed"
        :active-tab="activeTab"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
      />
      <main class="study-main">
        <StudyChatPanel
          v-if="activeTab === 'chat'"
          :sidebar-collapsed="sidebarCollapsed"
          @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        />
        <StudyReviewCalendarPanel
          v-else-if="activeTab === 'calendar'"
          :sidebar-collapsed="sidebarCollapsed"
          @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        />
        <div v-else class="games-wrap">
          <WellnessGamesPanel back-target="study" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.study-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bc-bg);
}

.study-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  background: var(--bc-bg);
}

.study-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.games-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 32px;
}
</style>
