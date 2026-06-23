<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ArticleItem } from '@/api/article'

defineProps<{
  articles: ArticleItem[]
  loading?: boolean
}>()

const router = useRouter()

function goDetail(id: number) {
  router.push(`/atlas/articles/${id}`)
}

function excerpt(article: ArticleItem) {
  if (!article.content) return ''
  const text = article.content.replace(/<[^>]+>/g, '').trim()
  return text.length > 36 ? `${text.slice(0, 36)}…` : text
}
</script>

<template>
  <el-card class="rank-card" shadow="never" v-loading="loading">
    <template #header>
      <div class="section-title">
        <span class="title-icon">📰</span>
        <span>热门资讯排行榜</span>
      </div>
    </template>
    <el-empty v-if="!loading && articles.length === 0" description="暂无资讯" />
    <div
      v-for="(article, index) in articles"
      :key="article.id"
      class="rank-item"
      @click="goDetail(article.id)"
    >
      <span class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</span>
      <div class="rank-body">
        <div class="rank-name">{{ article.title }}</div>
        <div v-if="excerpt(article)" class="rank-meta">{{ excerpt(article) }}</div>
      </div>
      <span class="view-tag">{{ article.viewCount ?? 0 }} 阅</span>
    </div>
  </el-card>
</template>

<style scoped>
.rank-card {
  border-radius: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a5f3f;
}

.title-icon {
  font-size: 18px;
}

.rank-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s, transform 0.2s;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  background: #faf8f4;
  transform: translateX(3px);
}

.rank-num {
  width: 22px;
  text-align: center;
  font-weight: 700;
  color: #909399;
  flex-shrink: 0;
  line-height: 1.4;
}

.rank-num.top {
  color: #c45c26;
}

.rank-body {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.rank-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.view-tag {
  font-size: 11px;
  color: #909399;
  flex-shrink: 0;
}
</style>
