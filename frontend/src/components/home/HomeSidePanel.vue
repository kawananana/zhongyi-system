<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { WELLNESS_GAMES } from '@/data/wellnessGames'

const router = useRouter()
const homeGames = WELLNESS_GAMES.slice(0, 4)

const acupointCover = '/images/home/acupoint-entry.svg'

function goAcupoint() {
  router.push('/atlas/acupoint')
}

function goStudy() {
  router.push('/study')
}

function goWellnessGames() {
  router.push('/wellness?tab=games')
}

function onGameClick(gameId: string, status: string) {
  if (status === 'beta') {
    router.push({ path: `/games/${gameId}`, query: { from: 'study' } })
    return
  }
  ElMessage.info('游戏即将上线，先去趣学小游戏看看～')
  router.push('/study?tab=games')
}
</script>

<template>
  <div class="side-panel">
    <section class="entry-block entry-3d" @click="goAcupoint">
      <div class="entry-cover-wrap">
        <img class="entry-cover" :src="acupointCover" alt="3D 针灸人体模型" />
        <span class="entry-badge">3D 互动</span>
      </div>
      <div class="entry-body">
        <h3>3D 经络针灸</h3>
        <p>真人模型 · 经络循行 · 穴位详解</p>
        <el-button type="primary" class="entry-btn" @click.stop="goAcupoint">进入 3D 模型</el-button>
      </div>
    </section>

    <section class="entry-block entry-study">
      <div class="study-icon-wrap">
        <span class="robot-icon" aria-hidden="true">🤖</span>
      </div>
      <div class="entry-body">
        <h3>萌智伴学</h3>
        <p>AI 小助手陪你学本草、记穴位</p>
        <el-button type="primary" class="entry-btn study-btn" @click="goStudy">
          开始伴学
        </el-button>
      </div>
    </section>

    <section class="entry-block entry-games">
      <div class="entry-body">
        <h3>智趣伴学 · 小游戏</h3>
        <p>答题、配对、闯关赚积分</p>
        <div class="game-grid">
          <button
            v-for="g in homeGames"
            :key="g.id"
            type="button"
            class="game-chip"
            :title="g.title"
            @click="onGameClick(g.id, g.status)"
          >
            <span class="game-icon">{{ g.icon }}</span>
            <span class="game-name">{{ g.title }}</span>
            <span v-if="g.status === 'beta'" class="game-tag">可玩</span>
          </button>
        </div>
        <el-button class="entry-btn outline-btn" @click="goWellnessGames">更多游戏</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.entry-block {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #ebe6dc;
}

.entry-3d {
  flex: 1.45 1 0;
  cursor: pointer;
  transition: box-shadow 0.25s;
}

.entry-3d:hover {
  box-shadow: 0 8px 20px rgba(26, 95, 63, 0.12);
}

.entry-cover-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 72px;
  overflow: hidden;
  background: #272b31;
}

.entry-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  opacity: 1;
}

.entry-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(26, 95, 63, 0.88);
  color: #fff;
  font-size: 11px;
}

.entry-body {
  flex-shrink: 0;
  padding: 14px 16px 16px;
}

.entry-body h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1a5f3f;
}

.entry-body p {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.entry-btn {
  width: 100%;
  --el-button-bg-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
}

.entry-study {
  flex: 0.65 1 0;
  flex-direction: row;
  gap: 10px;
  padding: 12px 14px;
  align-items: center;
  justify-content: center;
}

.study-icon-wrap {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, #e8f5ee 0%, #d4ebe0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(26, 95, 63, 0.15);
}

.robot-icon {
  font-size: 30px;
  line-height: 1;
}

.entry-study .entry-body {
  flex: 1;
  min-width: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.entry-study .entry-body h3 {
  font-size: 15px;
}

.entry-study .entry-body p {
  margin-bottom: 8px;
  font-size: 11px;
}

.study-btn {
  margin-top: 2px;
}

.entry-games {
  padding: 16px;
}

.entry-games .entry-body {
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.game-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
  align-content: center;
}

.game-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border: 1px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
}

.game-chip:hover {
  border-color: #1a5f3f;
  background: #f0f7f2;
}

.game-icon {
  font-size: 22px;
  line-height: 1;
}

.game-name {
  font-size: 11px;
  color: #606266;
  text-align: center;
  line-height: 1.2;
}

.game-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  background: #c45c26;
  color: #fff;
}

.outline-btn {
  flex-shrink: 0;
  margin-top: auto;
  --el-button-bg-color: transparent;
  --el-button-text-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
}

@media (max-width: 992px) {
  .side-panel {
    height: auto;
  }

  .entry-3d,
  .entry-study,
  .entry-games {
    flex: none;
    min-height: auto;
  }

  .entry-cover-wrap {
    height: 140px;
    flex: none;
  }
}
</style>
