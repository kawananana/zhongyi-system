<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HerbQuizGame from '@/components/games/HerbQuizGame.vue'
import HerbMatchGame from '@/components/games/HerbMatchGame.vue'
import HerbMemoryGame from '@/components/games/HerbMemoryGame.vue'
import FormulaGame from '@/components/games/FormulaGame.vue'
import SeasonQuizGame from '@/components/games/SeasonQuizGame.vue'
import MeridianGame from '@/components/games/MeridianGame.vue'

const route = useRoute()
const router = useRouter()

const gameId = computed(() => String(route.params.gameId || ''))

function goBack() {
  const from = route.query.from as string | undefined
  if (from === 'study') {
    router.push('/study?tab=games')
  } else {
    router.push('/wellness?tab=games')
  }
}
</script>

<template>
  <div class="game-play-page">
    <HomeHeader />
    <main class="game-play-main">
      <HerbQuizGame v-if="gameId === 'herb-quiz'" @back="goBack" />
      <HerbMatchGame v-else-if="gameId === 'herb-match'" @back="goBack" />
      <HerbMemoryGame v-else-if="gameId === 'memory'" @back="goBack" />
      <MeridianGame v-else-if="gameId === 'meridian'" @back="goBack" />
      <FormulaGame v-else-if="gameId === 'formula'" @back="goBack" />
      <SeasonQuizGame v-else-if="gameId === 'season'" @back="goBack" />
      <div v-else class="unknown">
        <p>未找到该小游戏</p>
        <el-button type="primary" @click="goBack">返回</el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.game-play-page {
  min-height: 100vh;
  background: var(--bc-bg, #f7f3eb);
  display: flex;
  flex-direction: column;
}

.game-play-main {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.unknown {
  text-align: center;
  padding: 48px;
  background: #fff;
  border-radius: 12px;
}
</style>
