<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { HerbItem } from '@/api/herb'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

defineProps<{
  herbs: HerbItem[]
  loading?: boolean
  /** 首页左栏：卡片拉高与右栏底边对齐 */
  fillHeight?: boolean
}>()

const router = useRouter()

function goDetail(id: number) {
  router.push(`/atlas/herbs/${id}`)
}

function metaLine(herb: HerbItem) {
  const parts: string[] = []
  if (herb.alias) parts.push(herb.alias)
  if (herb.originProvinceName) parts.push(herb.originProvinceName)
  return parts.join(' · ')
}
</script>

<template>
  <el-card
    class="rank-card"
    :class="{ 'rank-card--fill': fillHeight }"
    shadow="never"
    v-loading="loading"
  >
    <template #header>
      <div class="section-title">
        <span class="title-icon">🔥</span>
        <span>药材排行榜</span>
        <span class="rank-hint">按站内浏览</span>
      </div>
    </template>
    <el-empty v-if="!loading && herbs.length === 0" description="暂无药材" />
    <div v-else class="rank-list" :class="{ 'rank-list--fill': fillHeight }">
    <div
      v-for="(herb, index) in herbs"
      :key="herb.id"
      class="rank-item"
      @click="goDetail(herb.id)"
    >
      <span class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</span>
      <el-image class="rank-thumb" :src="herb.coverImage" fit="cover" lazy>
        <template #error>
          <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
        </template>
      </el-image>
      <div class="rank-body">
        <div class="rank-name">{{ herb.herbName }}</div>
        <div v-if="metaLine(herb)" class="rank-meta">{{ metaLine(herb) }}</div>
      </div>
      <el-button size="small" link type="primary" @click.stop="goDetail(herb.id)">详情</el-button>
    </div>
    </div>
  </el-card>
</template>

<style scoped>
.rank-card {
  border-radius: 12px;
}

.rank-card--fill {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rank-card--fill :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rank-list--fill {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a5f3f;
}

.rank-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

.title-icon {
  font-size: 18px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #fafafa;
}

.rank-num {
  width: 22px;
  text-align: center;
  font-weight: 700;
  color: #909399;
  flex-shrink: 0;
}

.rank-num.top {
  color: #e6a23c;
}

.rank-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  flex-shrink: 0;
}

.error-img {
  width: 100%;
  height: 100%;
}

.rank-body {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.rank-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
