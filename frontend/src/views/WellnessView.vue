<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import WellnessJournalPanel from '@/components/wellness/WellnessJournalPanel.vue'
import WellnessCommunityPanel from '@/components/wellness/WellnessCommunityPanel.vue'
import WellnessGamesPanel from '@/components/wellness/WellnessGamesPanel.vue'

type TabKey = 'journal' | 'community' | 'games'

const route = useRoute()

function tabFromRoute(): TabKey {
  const tab = route.query.tab
  if (tab === 'community' || tab === 'journal' || tab === 'games') return tab
  return 'journal'
}

const activeTab = ref<TabKey>(tabFromRoute())

function syncTabFromRoute() {
  activeTab.value = tabFromRoute()
}

onMounted(syncTabFromRoute)
watch(() => route.query.tab, syncTabFromRoute)

const tabs: { key: TabKey; label: string; desc: string; icon: string }[] = [
  { key: 'journal', label: '生活记录', desc: '饮食起居 · 打卡计划 · 养生日历', icon: '📅' },
  { key: 'community', label: '社区论坛', desc: '提问互助 · 学习心得 · 互动交流', icon: '💬' },
  { key: 'games', label: '趣学闯关', desc: '本草寻宝图 · 逐关挑战赢积分', icon: '🗺️' },
]
</script>

<template>
  <div class="wellness-page">
    <HomeHeader />

    <main class="wellness-main">
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-desc">{{ tab.desc }}</span>
        </button>
      </nav>

      <section class="tab-content">
        <WellnessJournalPanel v-show="activeTab === 'journal'" />
        <WellnessCommunityPanel v-show="activeTab === 'community'" />
        <WellnessGamesPanel v-show="activeTab === 'games'" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.wellness-page {
  min-height: 100vh;
  background: #f7f3eb;
}

.wellness-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 24px 48px;
}

.tab-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .tab-nav {
    grid-template-columns: 1fr;
  }
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px 18px;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.tab-btn:hover {
  border-color: #b8d4c4;
}

.tab-btn.active {
  border-color: #1a5f3f;
  background: #e8f5ee;
  box-shadow: 0 4px 12px rgba(26, 95, 63, 0.1);
}

.tab-icon {
  font-size: 22px;
}

.tab-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tab-btn.active .tab-label {
  color: #1a5f3f;
}

.tab-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.tab-content {
  min-height: 320px;
}
</style>
