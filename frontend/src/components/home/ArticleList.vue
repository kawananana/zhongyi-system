<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import type { ArticleItem } from '@/api/article'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const props = defineProps<{
  articles: ArticleItem[]
  loading?: boolean
}>()

const router = useRouter()

function excerpt(article: ArticleItem) {
  if (!article.content) return ''
  const text = article.content.replace(/<[^>]+>/g, '').trim()
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

function goDetail(id: number) {
  router.push(`/atlas/articles/${id}`)
}

const list = computed(() => props.articles)
</script>

<template>
  <el-card class="article-list-card" shadow="never" v-loading="loading">
    <template #header>
      <div class="section-title">
        <span class="title-icon">📖</span>
        <span>热门资讯</span>
      </div>
    </template>
    <el-empty v-if="!loading && list.length === 0" description="暂无资讯" />
    <div
      v-for="(article, index) in list"
      :key="article.id"
      class="article-item"
      @click="goDetail(article.id)"
    >
      <span class="rank-badge" :class="{ top: index < 3 }">{{ index + 1 }}</span>
      <el-image
        class="article-thumb"
        :src="article.coverImage"
        fit="cover"
        lazy
        :preview-src-list="article.coverImage ? [article.coverImage] : []"
      >
        <template #error>
          <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
        </template>
      </el-image>
      <div class="article-body">
        <h4 class="article-title">{{ article.title }}</h4>
        <p v-if="article.author" class="article-meta">作者：{{ article.author }}</p>
        <p class="article-desc">{{ excerpt(article) }}</p>
      </div>
      <el-button class="detail-btn" round size="small" :icon="Search" @click.stop="goDetail(article.id)">
        查看详情
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.article-list-card {
  border-radius: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  font-size: 20px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  margin: 0 -8px;
  padding-left: 8px;
  padding-right: 8px;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  background: #fafafa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.rank-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 6px;
  background: #ebeef5;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.rank-badge.top {
  background: linear-gradient(135deg, #e6a23c, #f5c06a);
  color: #fff;
}

.article-thumb {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
}

.error-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-body {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 4px;
  font-size: 15px;
  color: #303133;
}

.article-meta {
  margin: 0 0 4px;
  font-size: 12px;
  color: #909399;
}

.article-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-btn {
  flex-shrink: 0;
}
</style>
