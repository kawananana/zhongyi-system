<script setup lang="ts">
import CareTextWithHerbLinks from '@/components/wellness/CareTextWithHerbLinks.vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchRecipePage, type RecipeItem } from '@/api/recipe'
import { fetchRecipeFavoriteStatus, toggleFavorite } from '@/api/favorite'
import { CONSTITUTION_META } from '@/data/constitutionQuiz'
import { getDietTherapyForConstitution } from '@/data/constitutionDietTherapy'
import { hasCompletedConstitutionQuiz, loadSavedConstitution } from '@/utils/constitutionStorage'
import { isUserLoggedIn, requireUserLogin } from '@/utils/requireLogin'
import type { ConstitutionResult } from '@/utils/constitutionEvaluate'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'
import { Clock, Bowl, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { loadHerbLinkIndex } from '@/utils/constitutionHerbLinks'
import { RECIPE_CATEGORIES, parseRecipeTags, recipeCategoryLabel } from '@/utils/recipeCategories'

const router = useRouter()
const userStore = useUserStore()
const recipes = ref<RecipeItem[]>([])
const allRecipes = ref<RecipeItem[]>([])
const activeCategory = ref('all')
const constitutionResult = ref<ConstitutionResult | null>(null)
const herbLinkIndex = ref(new Map<string, number>())
const collectedMap = ref<Record<number, boolean>>({})
const favoriteLoadingId = ref<number | null>(null)

const isLoggedIn = computed(() => isUserLoggedIn())

const dietTherapy = computed(() => {
  if (!constitutionResult.value) return null
  return getDietTherapyForConstitution(constitutionResult.value.primary)
})

const hasCompletedQuiz = computed(() => {
  if (!isLoggedIn.value) return false
  const userId = userStore.userBrief?.userId
  if (!userId) return false
  return hasCompletedConstitutionQuiz(userId)
})

const showConstitutionRecommend = computed(
  () => hasCompletedQuiz.value && !!constitutionResult.value && !!dietTherapy.value,
)

const secondaryLabel = computed(() => {
  const secondary = constitutionResult.value?.secondary
  if (!secondary) return ''
  return CONSTITUTION_META[secondary].name
})

const matchedRecipe = computed(() => {
  const name = dietTherapy.value?.recipeName
  if (!name) return null
  return allRecipes.value.find((r) => r.recipeName === name) ?? null
})

const recommendTags = computed(() => {
  if (matchedRecipe.value) return parseRecipeTags(matchedRecipe.value.tags)
  return ['体质食疗', dietTherapy.value?.name].filter(Boolean) as string[]
})

async function loadAllRecipesForMatch() {
  try {
    const res = await fetchRecipePage({ page: 1, pageSize: 20, category: 'all' })
    allRecipes.value = res.list || []
  } catch {
    allRecipes.value = []
  }
}

async function loadRecipes() {
  try {
    const res = await fetchRecipePage({ page: 1, pageSize: 12, category: activeCategory.value })
    recipes.value = res.list || []
    await syncFavoriteStatus()
  } catch {
    recipes.value = []
    collectedMap.value = {}
  }
}

async function syncFavoriteStatus() {
  if (!isUserLoggedIn()) {
    collectedMap.value = {}
    return
  }
  const ids = recipes.value.map((item) => item.id)
  if (!ids.length) {
    collectedMap.value = {}
    return
  }
  try {
    collectedMap.value = await fetchRecipeFavoriteStatus(ids)
  } catch {
    collectedMap.value = {}
  }
}

async function toggleCollect(recipe: RecipeItem, event: Event) {
  event.stopPropagation()
  if (!requireUserLogin(router, '登录后可收藏')) return
  favoriteLoadingId.value = recipe.id
  try {
    const collected = collectedMap.value[recipe.id] ?? false
    const res = await toggleFavorite('recipe', recipe.id, collected ? 'remove' : 'add')
    collectedMap.value = { ...collectedMap.value, [recipe.id]: res.collected }
    ElMessage.success(res.collected ? '已加入收藏' : '已取消收藏')
  } finally {
    favoriteLoadingId.value = null
  }
}

function goDetail(id: number) {
  router.push(`/guide/${id}`)
}

function goConstitution() {
  if (!requireUserLogin(router, '请先登录后再进行体质测评', '/constitution?from=guide')) return
  router.push({ path: '/constitution', query: { from: 'guide' } })
}

async function selectCategory(key: string) {
  activeCategory.value = key
  await loadRecipes()
}

function loadConstitutionRecommend() {
  if (!isUserLoggedIn()) {
    constitutionResult.value = null
    return
  }
  const userId = userStore.userBrief?.userId
  if (!userId) {
    constitutionResult.value = null
    return
  }
  const saved = loadSavedConstitution(userId)
  constitutionResult.value = saved?.result ?? null
}

watch(() => [userStore.token, userStore.userBrief?.userId] as const, () => {
  loadConstitutionRecommend()
  void syncFavoriteStatus()
})

onMounted(async () => {
  loadConstitutionRecommend()
  const [, , index] = await Promise.all([
    loadAllRecipesForMatch(),
    loadRecipes(),
    loadHerbLinkIndex(),
  ])
  herbLinkIndex.value = index
})

onActivated(async () => {
  loadConstitutionRecommend()
  await Promise.all([loadAllRecipesForMatch(), loadRecipes()])
})
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main">
      <section
        v-if="showConstitutionRecommend"
        class="featured-card"
        @click="matchedRecipe ? goDetail(matchedRecipe.id) : undefined"
      >
        <div class="featured-img-wrap">
          <span class="daily-badge">体质食疗</span>
          <el-image
            class="featured-img"
            :src="matchedRecipe?.coverImage"
            fit="cover"
          >
            <template #error>
              <div class="constitution-cover">
                <span class="cover-icon">🍲</span>
                <span>{{ dietTherapy.name }}</span>
              </div>
            </template>
          </el-image>
        </div>
        <div class="featured-body">
          <div class="constitution-head">
            <span class="constitution-tag">{{ dietTherapy.name }} · 专属推荐</span>
            <span v-if="secondaryLabel" class="secondary-tag">兼 {{ secondaryLabel }}</span>
          </div>
          <p class="traits-line">{{ dietTherapy.traits }}</p>
          <h2 class="featured-title">
            {{ matchedRecipe ? matchedRecipe.recipeName : '药膳食疗方案' }}
          </h2>
          <p class="featured-desc" @click.stop>
            <CareTextWithHerbLinks
              :text="dietTherapy.dietPlan"
              :herb-link-index="herbLinkIndex"
              link-from="guide"
            />
          </p>
          <div v-if="recommendTags.length" class="hash-tags">
            <span v-for="t in recommendTags" :key="t" class="hash-tag">#{{ t }}</span>
          </div>
          <div v-if="matchedRecipe" class="meta-row">
            <span class="meta-item">
              <el-icon><Clock /></el-icon> 烹饪时间：{{ matchedRecipe.cookingTime || '—' }}
            </span>
            <span class="meta-item">
              <el-icon><Bowl /></el-icon> 难度：{{ matchedRecipe.difficulty || '—' }}
            </span>
          </div>
          <div class="action-row">
            <button
              v-if="matchedRecipe"
              type="button"
              class="featured-btn"
              @click.stop="goDetail(matchedRecipe.id)"
            >
              查看完整做法 →
            </button>
            <button type="button" class="ghost-btn" @click.stop="goConstitution">
              查看体质测评
            </button>
          </div>
        </div>
      </section>

      <section v-else class="featured-card cta-card" @click="goConstitution">
        <div class="featured-img-wrap cta-cover">
          <span class="daily-badge">体质食疗</span>
          <div class="constitution-cover">
            <span class="cover-icon">📋</span>
            <span>九体质自测</span>
          </div>
        </div>
        <div class="featured-body">
          <h2 class="featured-title">完成体质测试，获取专属药膳食疗</h2>
          <p class="featured-desc">
            登录后完成 20 道九体质标准自测题，系统将根据您的体质类型（如阳虚、阴虚、痰湿等）推荐对应的药膳食疗方案。
          </p>
          <button type="button" class="featured-btn" @click.stop="goConstitution">
            前往体质测试 →
          </button>
        </div>
      </section>

      <div class="category-bar">
        <button
          v-for="cat in RECIPE_CATEGORIES"
          :key="cat.key"
          type="button"
          class="cat-chip"
          :class="{ active: activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </div>

      <div v-if="recipes.length" class="recipe-grid">
        <article v-for="recipe in recipes" :key="recipe.id" class="recipe-card" @click="goDetail(recipe.id)">
          <div class="card-img-wrap">
            <el-image class="card-img" :src="recipe.coverImage" fit="cover">
              <template #error>
                <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
              </template>
            </el-image>
            <button
              type="button"
              class="card-collect-btn"
              :class="{ collected: collectedMap[recipe.id] }"
              :disabled="favoriteLoadingId === recipe.id"
              :title="collectedMap[recipe.id] ? '取消收藏' : '收藏'"
              @click="toggleCollect(recipe, $event)"
            >
              <el-icon><Star /></el-icon>
            </button>
          </div>
          <div class="card-tags">
            <span v-if="recipe.category" class="mini-tag">{{ recipeCategoryLabel(recipe.category) }}</span>
            <span v-if="recipe.difficulty" class="mini-tag alt">{{ recipe.difficulty }}</span>
          </div>
          <h3 class="card-title">{{ recipe.recipeName }}</h3>
          <p class="card-snippet" @click.stop>
            <CareTextWithHerbLinks
              :text="recipe.summary || recipe.efficacy || ''"
              :herb-link-index="herbLinkIndex"
              link-from="guide"
            />
          </p>
          <div class="card-foot">
            <span>{{ recipe.cookingTime || '—' }}</span>
            <span class="detail-link">查看详情</span>
          </div>
        </article>
      </div>

      <el-empty v-else description="暂无食谱" />
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}

.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.featured-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e0d4;
  margin-bottom: 24px;
  cursor: pointer;
  transition: box-shadow 0.25s;
}

.featured-card:hover {
  box-shadow: 0 12px 32px rgba(92, 64, 51, 0.12);
}

.cta-card {
  border-color: #d4ebe0;
}

@media (max-width: 768px) {
  .featured-card {
    grid-template-columns: 1fr;
  }
}

.featured-img-wrap {
  position: relative;
  min-height: 280px;
  background: #ebe3d6;
}

.featured-img,
.error-img {
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.error-img {
  object-fit: cover;
}

.constitution-cover {
  width: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(145deg, #f0f7f2, #e8f5ee);
  color: #1a5f3f;
  font-size: 18px;
  font-weight: 600;
}

.cover-icon {
  font-size: 48px;
}

.cta-cover .constitution-cover {
  background: linear-gradient(145deg, #fdf6ec, #f5efe3);
  color: #5c4033;
}

.daily-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  background: #1a5f3f;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
}

.featured-body {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
}

.constitution-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.constitution-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: #e8f5ee;
  color: #1a5f3f;
  font-size: 13px;
  font-weight: 600;
}

.secondary-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: #fdf6ec;
  color: #b88230;
  font-size: 12px;
}

.traits-line {
  margin: 0 0 10px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.featured-title {
  margin: 0 0 14px;
  font-size: 22px;
  font-weight: 600;
  color: #3d3028;
}

.featured-desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.75;
  color: #606266;
  flex: 1;
}

.hash-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.hash-tag {
  padding: 4px 12px;
  background: #f5f0e8;
  border-radius: 20px;
  font-size: 13px;
  color: #6b5c4f;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.featured-btn {
  align-self: flex-start;
  padding: 10px 24px;
  border: 1px solid #5c4033;
  border-radius: 24px;
  background: #fff;
  color: #5c4033;
  font-size: 14px;
  cursor: pointer;
}

.featured-btn:hover {
  background: #5c4033;
  color: #fff;
}

.ghost-btn {
  padding: 10px 20px;
  border: 1px solid #d4ebe0;
  border-radius: 24px;
  background: #fff;
  color: #1a5f3f;
  font-size: 14px;
  cursor: pointer;
}

.ghost-btn:hover {
  background: #f0f7f2;
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.cat-chip {
  padding: 10px 22px;
  border: 1px solid #d4c9b8;
  border-radius: 24px;
  background: #fff;
  color: #5c5046;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-chip.active {
  background: #5c4033;
  border-color: #5c4033;
  color: #fff;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }
}

.recipe-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e0d4;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(92, 64, 51, 0.1);
}

.card-img-wrap {
  position: relative;
}

.card-collect-btn {
  position: absolute;
  top: 10px;
  right: 10px;
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

.card-img {
  width: 100%;
  height: 160px;
  display: block;
}

.recipe-card .error-img {
  height: 160px;
  min-height: 160px;
}

.card-tags {
  display: flex;
  gap: 8px;
  padding: 12px 14px 0;
}

.mini-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e8f5ee;
  color: #1a5f3f;
}

.mini-tag.alt {
  background: #fdf6ec;
  color: #e6a23c;
}

.card-title {
  margin: 10px 14px 8px;
  font-size: 16px;
  font-weight: 600;
  color: #3d3028;
}

.card-snippet {
  margin: 0 14px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-foot {
  display: flex;
  justify-content: space-between;
  padding: 0 14px 14px;
  font-size: 12px;
  color: #909399;
}

.detail-link {
  color: #1a5f3f;
}
</style>
