<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import {
  fetchFavoriteArticles,
  fetchFavoriteCourses,
  fetchFavoriteHerbs,
  fetchFavoriteRecipes,
  toggleFavorite,
  type UserFavoriteItem,
} from '@/api/favorite'
import { categoryLabel } from '@/utils/wikiCategories'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'
import { resolveArticleCover } from '@/utils/articleCover'
import { recipeCategoryLabel } from '@/utils/recipeCategories'

type FavTab = 'herb' | 'article' | 'course' | 'recipe'

const route = useRoute()
const router = useRouter()

const activeKind = ref<FavTab>('herb')
const loading = ref(false)
const lists = ref<Record<FavTab, UserFavoriteItem[]>>({
  herb: [],
  article: [],
  course: [],
  recipe: [],
})

const tabLabels: Record<FavTab, string> = {
  herb: '草药',
  article: '文章',
  course: '视频',
  recipe: '药膳',
}

function initTabFromQuery() {
  const sub = route.query.sub
  if (sub === 'article' || sub === 'course' || sub === 'herb' || sub === 'recipe') {
    activeKind.value = sub
  }
}

function itemLink(item: UserFavoriteItem) {
  if (item.type === 'herb') return `/atlas/herbs/${item.id}`
  if (item.type === 'recipe') return `/guide/${item.id}`
  return `/atlas/articles/${item.id}`
}

function itemCover(item: UserFavoriteItem) {
  if (item.type === 'herb' || item.type === 'recipe') {
    return item.coverImage || IMAGE_ERROR_PLACEHOLDER
  }
  return resolveArticleCover({
    id: item.id,
    title: item.title,
    category: item.category,
    coverImage: item.coverImage,
    contentKind: item.type,
  })
}

function itemMeta(item: UserFavoriteItem) {
  if (item.type === 'herb') {
    return item.subtitle || item.category || '本草图鉴'
  }
  if (item.type === 'recipe') {
    const cat = item.category ? recipeCategoryLabel(item.category) : ''
    return [cat, item.subtitle].filter(Boolean).join(' · ') || '药膳食疗'
  }
  const cat = item.category ? categoryLabel(item.category) : ''
  return [cat, item.subtitle].filter(Boolean).join(' · ') || (item.type === 'course' ? '百科视频' : '百科文章')
}

function formatTime(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadAll() {
  loading.value = true
  try {
    const [herbs, articles, courses, recipes] = await Promise.all([
      fetchFavoriteHerbs(),
      fetchFavoriteArticles(),
      fetchFavoriteCourses(),
      fetchFavoriteRecipes(),
    ])
    lists.value = { herb: herbs, article: articles, course: courses, recipe: recipes }
  } finally {
    loading.value = false
  }
}

async function removeFavorite(item: UserFavoriteItem) {
  await ElMessageBox.confirm(`确认取消收藏「${item.title}」？`, '取消收藏')
  await toggleFavorite(item.type, item.id, 'remove')
  lists.value[item.type] = lists.value[item.type].filter((x) => x.id !== item.id)
  ElMessage.success('已取消收藏')
}

watch(activeKind, (kind) => {
  router.replace({ path: '/profile', query: { tab: 'favorites', sub: kind } })
})

onMounted(async () => {
  initTabFromQuery()
  await loadAll()
})
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2><el-icon><Star /></el-icon> 我的收藏</h2>
      <p>按草药、百科文章、百科视频、药膳食疗分类查看你收藏的内容</p>
    </div>

    <el-tabs v-model="activeKind" class="fav-tabs">
      <el-tab-pane
        v-for="kind in (['herb', 'article', 'course', 'recipe'] as FavTab[])"
        :key="kind"
        :name="kind"
        :label="`${tabLabels[kind]}（${lists[kind].length}）`"
      />
    </el-tabs>

    <div v-loading="loading" class="fav-body">
      <el-empty v-if="!lists[activeKind].length" :description="`暂无${tabLabels[activeKind]}收藏`">
        <el-button
          type="primary"
          @click="router.push(
            activeKind === 'herb'
              ? '/atlas/herbs'
              : activeKind === 'recipe'
                ? '/guide'
                : '/atlas/articles',
          )"
        >
          去逛逛
        </el-button>
      </el-empty>

      <ul v-else class="fav-list">
        <li v-for="item in lists[activeKind]" :key="`${item.type}-${item.id}`" class="fav-item">
          <RouterLink :to="itemLink(item)" class="fav-link">
            <img :src="itemCover(item)" :alt="item.title" class="fav-cover" />
            <div class="fav-info">
              <strong>{{ item.title }}</strong>
              <span class="fav-meta">{{ itemMeta(item) }}</span>
              <span class="fav-time">收藏于 {{ formatTime(item.favoriteTime) }}</span>
            </div>
          </RouterLink>
          <el-button link type="danger" @click="removeFavorite(item)">取消收藏</el-button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius-lg);
  padding: 24px 28px 28px;
  box-shadow: var(--bc-shadow);
}

.panel-head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--bc-primary);
}

.panel-head p {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--bc-text-muted);
}

.fav-tabs {
  margin-bottom: 8px;
}

.fav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--bc-border-light);
  border-radius: var(--bc-radius);
  background: var(--bc-bg-muted);
}

.fav-link {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: inherit;
}

.fav-cover {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--bc-border);
  flex-shrink: 0;
  background: #fff;
}

.fav-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fav-info strong {
  font-size: 15px;
  color: var(--bc-text);
  line-height: 1.4;
}

.fav-meta {
  font-size: 12px;
  color: var(--bc-text-secondary);
}

.fav-time {
  font-size: 11px;
  color: var(--bc-text-muted);
}

.fav-link:hover strong {
  color: var(--bc-primary);
}
</style>
