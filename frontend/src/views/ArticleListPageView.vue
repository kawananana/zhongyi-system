<script setup lang="ts">
import { onActivated, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VideoPlay, Document, Reading, Picture, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { parseGalleryJson, parseVideosJson } from '@/utils/wikiMedia'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchArticlePage, type ArticleItem } from '@/api/article'
import { fetchArticleFavoriteStatus, toggleFavorite } from '@/api/favorite'
import { useUserStore } from '@/store/user'
import { requireUserLogin } from '@/utils/requireLogin'
import {
  WIKI_CONTENT_KINDS,
  WIKI_SIDEBAR_CATEGORIES,
  WIKI_DEFAULT_CATEGORY,
  categoryLabel,
  type WikiContentKind,
} from '@/utils/wikiCategories'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'
import { resolveArticleCover } from '@/utils/articleCover'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const list = ref<ArticleItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)
const collectedMap = ref<Record<number, boolean>>({})
const favoriteLoadingId = ref<number | null>(null)

const activeKind = ref<WikiContentKind>('article')
const initialCategory = typeof route.query.category === 'string' ? route.query.category : WIKI_DEFAULT_CATEGORY
const activeCategory = ref(
  WIKI_SIDEBAR_CATEGORIES.some((c) => c.key === initialCategory) ? initialCategory : WIKI_DEFAULT_CATEGORY,
)

async function loadFavoriteStatus(items: ArticleItem[]) {
  if (!userStore.isLoggedIn() || !items.length) {
    collectedMap.value = {}
    return
  }
  try {
    collectedMap.value = await fetchArticleFavoriteStatus(items.map((item) => item.id))
  } catch {
    collectedMap.value = {}
  }
}

async function load() {
  loading.value = true
  try {
    const data = await fetchArticlePage({
      page: page.value,
      pageSize: pageSize.value,
      category: activeCategory.value,
      contentKind: activeKind.value,
    })
    list.value = data.list ?? []
    total.value = data.total ?? 0
    await loadFavoriteStatus(list.value)
  } catch {
    list.value = []
    total.value = 0
    collectedMap.value = {}
  } finally {
    loading.value = false
  }
}

function favoriteType(item: ArticleItem): 'article' | 'course' {
  return item.contentKind === 'course' ? 'course' : 'article'
}

async function toggleCollect(item: ArticleItem, event: Event) {
  event.stopPropagation()
  if (!requireUserLogin(router, '登录后可收藏')) return
  favoriteLoadingId.value = item.id
  try {
    const type = favoriteType(item)
    const collected = collectedMap.value[item.id] ?? false
    const res = await toggleFavorite(type, item.id, collected ? 'remove' : 'add')
    collectedMap.value = { ...collectedMap.value, [item.id]: res.collected }
    ElMessage.success(res.collected ? '已加入收藏' : '已取消收藏')
  } finally {
    favoriteLoadingId.value = null
  }
}

function selectKind(key: WikiContentKind) {
  activeKind.value = key
  page.value = 1
  load()
}

function selectCategory(key: string) {
  activeCategory.value = key
  page.value = 1
  load()
}

function goDetail(id: number) {
  router.push(`/atlas/articles/${id}`)
}

watch(
  () => route.query.category,
  (category) => {
    if (typeof category !== 'string') return
    if (!WIKI_SIDEBAR_CATEGORIES.some((c) => c.key === category)) return
    activeCategory.value = category
    page.value = 1
    load()
  },
)

load()

onActivated(() => {
  load()
})
</script>

<template>
  <div class="wiki-page">
    <HomeHeader />

    <section class="wiki-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <span class="hero-badge">📚 知识宝库</span>
          <h1>本草百科</h1>
          <p>针灸、热敏灸、药膳与养生起居，图文课程一站式学习</p>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <strong>{{ total }}</strong>
            <span>当前内容</span>
          </div>
          <div class="stat-item">
            <strong>{{ WIKI_SIDEBAR_CATEGORIES.length }}</strong>
            <span>专题分类</span>
          </div>
        </div>
      </div>
    </section>

    <main class="wiki-main">
      <div class="kind-bar">
        <button
          v-for="k in WIKI_CONTENT_KINDS"
          :key="k.key"
          type="button"
          class="kind-tab"
          :class="{ active: activeKind === k.key }"
          @click="selectKind(k.key)"
        >
          <el-icon v-if="k.key === 'course'"><VideoPlay /></el-icon>
          <el-icon v-else><Document /></el-icon>
          {{ k.label }}
        </button>
      </div>

      <div class="wiki-layout">
        <aside class="wiki-sidebar">
          <div class="sidebar-head">
            <el-icon><Reading /></el-icon>
            <h3>分类导航</h3>
          </div>
          <ul class="side-menu">
            <li
              v-for="cat in WIKI_SIDEBAR_CATEGORIES"
              :key="cat.key"
              class="side-item"
              :class="{ active: activeCategory === cat.key }"
              @click="selectCategory(cat.key)"
            >
              <span class="side-dot" />
              {{ cat.label }}
            </li>
          </ul>
        </aside>

        <section class="wiki-content" v-loading="loading">
          <div class="content-head">
            <h2>{{ categoryLabel(activeCategory) }}</h2>
            <span class="content-count">共 {{ total }} 篇</span>
          </div>

          <el-empty v-if="!loading && list.length === 0" description="暂无内容，换个分类试试" />
          <div v-else class="card-grid">
            <article
              v-for="item in list"
              :key="item.id"
              class="wiki-card"
              @click="goDetail(item.id)"
            >
              <div class="card-cover">
                <el-image :src="resolveArticleCover(item)" fit="cover" class="cover-img" lazy>
                  <template #error>
                    <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
                  </template>
                </el-image>
                <div class="cover-shade" />
                <span class="kind-badge">
                  <el-icon v-if="item.contentKind === 'course'"><VideoPlay /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                  {{ item.contentKind === 'course' ? '视频' : '文章' }}
                </span>
                <button
                  type="button"
                  class="card-collect-btn"
                  :class="{ collected: collectedMap[item.id] }"
                  :disabled="favoriteLoadingId === item.id"
                  :title="collectedMap[item.id] ? '取消收藏' : '收藏'"
                  @click="toggleCollect(item, $event)"
                >
                  <el-icon><Star /></el-icon>
                </button>
              </div>
              <div class="card-body">
                <span class="cat-tag">{{ categoryLabel(item.category || '') }}</span>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-meta">
                  <span class="author">{{ item.author || '本草萌智' }}</span>
                  <span class="media-hints">
                    <span v-if="item.contentKind === 'course' && parseVideosJson(item.videosJson).length" class="hint hint-video">
                      <el-icon><VideoPlay /></el-icon>
                    </span>
                    <span v-if="parseGalleryJson(item.galleryJson).length" class="hint hint-img">
                      <el-icon><Picture /></el-icon>
                    </span>
                  </span>
                  <span class="views">{{ item.viewCount ?? 0 }} 站内阅读</span>
                </p>
              </div>
            </article>
          </div>

          <div v-if="total > pageSize" class="pager">
            <el-pagination
              v-model:current-page="page"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              background
              @current-change="load"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.wiki-page {
  min-height: 100vh;
  background: #f7f3eb;
  display: flex;
  flex-direction: column;
}

.wiki-hero {
  flex-shrink: 0;
  background: linear-gradient(120deg, #1a5f3f 0%, #2d8a5e 55%, #3d9e6e 100%);
  color: #fff;
  padding: 28px 24px 32px;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-block;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  margin-bottom: 10px;
}

.hero-text h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.92;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 88px;
}

.stat-item strong {
  display: block;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-item span {
  font-size: 12px;
  opacity: 0.85;
}

.wiki-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: -16px auto 0;
  padding: 0 24px 48px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}

.kind-bar {
  flex-shrink: 0;
  display: inline-flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 6px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(26, 95, 63, 0.08);
  border: 1px solid #ebe6dc;
}

.kind-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}

.kind-tab:hover {
  color: #1a5f3f;
  background: #f0f7f2;
}

.kind-tab.active {
  background: linear-gradient(135deg, #1a5f3f 0%, #2d8a5e 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(26, 95, 63, 0.25);
}

.wiki-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  align-items: start;
  min-height: 0;
}

.wiki-sidebar {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 80px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebe6dc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 16px 0;
  box-sizing: border-box;
}

.sidebar-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px 14px;
  margin-bottom: 4px;
  border-bottom: 1px solid #f0ebe3;
  color: #1a5f3f;
}

.sidebar-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.side-menu {
  list-style: none;
  margin: 0;
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.side-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4ddd8;
  flex-shrink: 0;
  transition: background 0.2s;
}

.side-item:hover {
  color: #1a5f3f;
  background: #f5faf7;
}

.side-item:hover .side-dot {
  background: #67c23a;
}

.side-item.active {
  color: #1a5f3f;
  font-weight: 400;
  background: linear-gradient(90deg, #e8f5ee 0%, #f5faf7 100%);
  box-shadow: inset 3px 0 0 #1a5f3f;
}

.side-item.active .side-dot {
  background: #1a5f3f;
  box-shadow: 0 0 0 3px rgba(26, 95, 63, 0.15);
}

.wiki-content {
  min-height: 320px;
}

.content-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(26, 95, 63, 0.12);
}

.content-head h2 {
  margin: 0;
  font-size: 18px;
  color: #1a5f3f;
  font-weight: 500;
}

.content-count {
  font-size: 13px;
  color: #909399;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 20px;
}

.wiki-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebe6dc;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.wiki-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(26, 95, 63, 0.14);
}

.card-cover--text {
  display: flex;
  align-items: flex-end;
  padding: 10px;
}

.kind-badge--solo {
  position: static;
}

.card-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(145deg, #e8f5ee 0%, #f0ebe3 100%);
  overflow: hidden;
}

.cover-img,
.error-img {
  width: 100%;
  height: 100%;
  transition: transform 0.35s ease;
}

.wiki-card:hover .cover-img :deep(img),
.wiki-card:hover .error-img {
  transform: scale(1.05);
}

.error-img {
  object-fit: cover;
}

.cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 50%);
  pointer-events: none;
}

.card-collect-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #909399;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: color 0.2s, background 0.2s, transform 0.2s;
}

.card-collect-btn:hover,
.card-collect-btn.collected {
  color: #1a5f3f;
  background: #fff;
  transform: scale(1.05);
}

.card-collect-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.kind-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(26, 95, 63, 0.88);
  color: #fff;
  font-size: 11px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.card-body {
  padding: 16px 18px 18px;
}

.cat-tag {
  display: inline-block;
  font-size: 11px;
  color: #1a5f3f;
  background: #e8f5ee;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.9em;
}

.card-meta {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  padding-top: 10px;
  border-top: 1px dashed #ebe6dc;
}

.author {
  color: #606266;
}

.media-hints {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  margin-right: 10px;
}

.hint {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.hint-video {
  background: #e8f5ee;
  color: #1a5f3f;
}

.hint-img {
  background: #f5f0e8;
  color: #8b6914;
}

.views {
  color: #8b6914;
  font-weight: 500;
}

.pager {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

.pager :deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #1a5f3f;
}

@media (max-width: 768px) {
  .wiki-layout {
    grid-template-columns: 1fr;
    flex: none;
  }

  .wiki-sidebar {
    position: static;
    top: auto;
  }

  .side-menu {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px 12px;
  }

  .side-item {
    flex: none;
    min-height: auto;
    margin: 0;
    padding: 8px 14px;
    background: #f5faf7;
  }

  .side-dot {
    display: none;
  }

  .hero-stats {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
