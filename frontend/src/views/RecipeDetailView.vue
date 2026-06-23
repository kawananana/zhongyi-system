<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchRecipeDetail, type RecipeItem } from '@/api/recipe'
import { fetchFavoriteCheck, toggleFavorite } from '@/api/favorite'
import { parseRecipeTags, recipeCategoryLabel } from '@/utils/recipeCategories'
import CareTextWithHerbLinks from '@/components/wellness/CareTextWithHerbLinks.vue'
import { loadHerbLinkIndex } from '@/utils/constitutionHerbLinks'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'
import { requireUserLogin } from '@/utils/requireLogin'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const recipe = ref<RecipeItem | null>(null)
const herbLinkIndex = ref(new Map<string, number>())
const favoriteLoading = ref(false)
const collected = ref(false)

const tagList = computed(() => parseRecipeTags(recipe.value?.tags))

async function loadFavoriteStatus(id: number) {
  try {
    collected.value = await fetchFavoriteCheck('recipe', id)
  } catch {
    collected.value = false
  }
}

async function toggleCollect() {
  if (!recipe.value) return
  if (!requireUserLogin(router, '登录后可收藏')) return
  favoriteLoading.value = true
  try {
    const res = await toggleFavorite('recipe', recipe.value.id, collected.value ? 'remove' : 'add')
    collected.value = res.collected
    ElMessage.success(res.collected ? '已加入收藏' : '已取消收藏')
  } finally {
    favoriteLoading.value = false
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    const [detail, index] = await Promise.all([fetchRecipeDetail(id), loadHerbLinkIndex()])
    recipe.value = detail
    herbLinkIndex.value = index
    await loadFavoriteStatus(id)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main" v-loading="loading">
      <template v-if="recipe">
        <button type="button" class="back" @click="router.push('/guide')">← 返回药膳食疗</button>
        <article class="detail">
          <el-image class="cover" :src="recipe.coverImage" fit="cover">
            <template #error>
              <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
            </template>
          </el-image>
          <div class="meta">
            <span class="tag">{{ recipeCategoryLabel(recipe.category || '') }}</span>
            <span>烹饪时间：{{ recipe.cookingTime }}</span>
            <span>难度：{{ recipe.difficulty }}</span>
          </div>
          <div class="title-row">
            <h1>{{ recipe.recipeName }}</h1>
            <button
              type="button"
              class="collect-btn"
              :class="{ collected }"
              :disabled="favoriteLoading"
              @click="toggleCollect"
            >
              <el-icon><Star /></el-icon>
              {{ collected ? '已收藏' : '收藏' }}
            </button>
          </div>
          <p class="summary">
            <CareTextWithHerbLinks
              :text="recipe.summary"
              :herb-link-index="herbLinkIndex"
              link-from="guide"
            />
          </p>
          <div v-if="tagList.length" class="tags">
            <span v-for="t in tagList" :key="t" class="hash">#{{ t }}</span>
          </div>
          <section v-if="recipe.efficacy">
            <h3>功效</h3>
            <p>
              <CareTextWithHerbLinks
                :text="recipe.efficacy"
                :herb-link-index="herbLinkIndex"
                link-from="guide"
              />
            </p>
          </section>
          <section v-if="recipe.cookingSteps">
            <h3>相关配伍</h3>
            <p class="steps">
              <CareTextWithHerbLinks
                :text="recipe.cookingSteps"
                :herb-link-index="herbLinkIndex"
                link-from="guide"
              />
            </p>
          </section>
          <section v-if="recipe.constitutionTags">
            <h3>适宜人群</h3>
            <p class="steps">
              <CareTextWithHerbLinks
                :text="recipe.constitutionTags"
                :herb-link-index="herbLinkIndex"
                link-from="guide"
              />
            </p>
          </section>
          <section v-if="recipe.tags">
            <h3>关键词</h3>
            <p class="steps">{{ recipe.tags }}</p>
          </section>
        </article>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}
.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px 24px 48px;
}
.back {
  border: none;
  background: none;
  color: #4a7fb5;
  cursor: pointer;
  margin-bottom: 16px;
}
.detail {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e8e0d4;
}
.cover,
.error-img {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.error-img {
  object-fit: cover;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.tag {
  background: #e8f5ee;
  color: #1a5f3f;
  padding: 2px 10px;
  border-radius: 4px;
}
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
h1 {
  margin: 0;
  font-size: 28px;
  color: #3d3028;
  flex: 1;
}
.collect-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d4c9b8;
  border-radius: 20px;
  background: #fff;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.collect-btn:hover,
.collect-btn.collected {
  color: #1a5f3f;
  border-color: #1a5f3f;
  background: #f0f7f2;
}
.collect-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.summary {
  line-height: 1.75;
  color: #606266;
  margin-bottom: 16px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.hash {
  background: #f5f0e8;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
}
section h3 {
  font-size: 16px;
  color: #1a5f3f;
  margin: 0 0 8px;
}
section p {
  line-height: 1.8;
  color: #606266;
  margin: 0 0 20px;
}
.steps {
  white-space: pre-wrap;
}
</style>
