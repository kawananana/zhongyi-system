<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import TreasureMapBoard from '@/components/wellness/TreasureMapBoard.vue'
import { ADVENTURE_LEVELS } from '@/data/wellnessGames'
import { useGameScoreStore } from '@/store/gameScore'
import { requireUserLogin } from '@/utils/requireLogin'

const props = withDefaults(
  defineProps<{ backTarget?: 'wellness' | 'study' }>(),
  { backTarget: 'wellness' },
)

const router = useRouter()
const scoreStore = useGameScoreStore()

function onPlay(levelId: string) {
  const level = ADVENTURE_LEVELS.find((l) => l.id === levelId)
  if (!level) return

  if (level.status === 'soon') {
    ElMessage.info('该关卡正在设计中，敬请期待')
    return
  }

  if (!requireUserLogin(router, '登录后可参与闯关并累计积分')) return

  router.push({
    path: `/games/${level.id}`,
    query: { from: props.backTarget },
  })
}
</script>

<template>
  <div class="games-panel">
    <div class="score-bar">
      <div class="score-main">
        <span>我的积分</span>
        <strong>{{ scoreStore.totalPoints }}</strong>
      </div>
      <div class="score-breakdown">
        <span>问答 {{ scoreStore.stats.quizBest }}</span>
        <span>配对 {{ scoreStore.stats.matchBest }}</span>
        <span>翻牌 {{ scoreStore.stats.memoryBest }}</span>
        <span>经络 {{ scoreStore.stats.meridianBest }}</span>
        <span>方剂 {{ scoreStore.stats.formulaBest }}</span>
        <span>节气 {{ scoreStore.stats.seasonBest }}</span>
      </div>
    </div>

    <TreasureMapBoard @play="onPlay" />
  </div>
</template>

<style scoped>
.games-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid var(--bc-border);
  border-radius: 12px;
}

.score-main span {
  display: block;
  font-size: 12px;
  color: var(--bc-text-muted);
}

.score-main strong {
  font-size: 24px;
  color: var(--bc-primary);
}

.score-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  font-size: 12px;
  color: var(--bc-text-secondary);
}
</style>
