<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Bowl } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchRecipeFeatured, fetchRecipePage, type RecipeItem } from '@/api/recipe'
import { RECIPE_CATEGORIES, parseRecipeTags, recipeCategoryLabel } from '@/utils/recipeCategories'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const router = useRouter()
const loading = ref(false)
const featured = ref<RecipeItem | null>(null)
const list = ref<RecipeItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(9)
const activeCategory = ref('all')

const gridList = computed(() => {
  const fid = featured.value?.id
  return list.value.filter((r) => r.id !== fid)
})

const featuredTags = computed(() => parseRecipeTags(featured.value?.tags))

async function loadFeatured() {
  try {
    featured.value = await fetchRecipeFeatured()
  } catch {
    featured.value = null
  }
}

async function loadList() {
  loading.value = true
  try {
    const data = await fetchRecipePage({
      page: page.value,
      pageSize: pageSize.value,
      category: activeCategory.value === 'all' ? undefined : activeCategory.value,
    })
    list.value = data.list ?? []
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

function selectCategory(key: string) {
  activeCategory.value = key
  page.value = 1
  loadList()
}

function loadMore() {
  if (list.value.length >= total.value) return
  pageSize.value += 6
  loadList()
}

function goDetail(id: number) {
  router.push(`/guide/${id}`)
}

onMounted(async () => {
  await loadFeatured()
  await loadList()
})
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main">
      <section v-if="featured" class="featured-card" @click="goDetail(featured.id)">
        <div class="featured-img-wrap">
          <span class="daily-badge">每日一荐</span>
          <el-image class="featured-img" :src="featured.coverImage" fit="cover">
            <template #error>
              <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
            </template>
          </el-image>
        </div>
        <div class="featured-body">
          <div class="meta-row">
            <span class="meta-item"><el-icon><Clock /></el-icon> 烹饪时间：{{ featured.cookingTime || '—' }}</span>
            <span class="meta-item"><el-icon><Bowl /></el-icon> 难度：{{ featured.difficulty || '—' }}</span>
          </div>
          <h2 class="featured-title">{{ featured.recipeName }}</h2>
          <p class="featured-desc">{{ featured.summary || featured.efficacy }}</p>
          <div v-if="featuredTags.length" class="hash-tags">
            <span v-for="t in featuredTags" :key="t" class="hash-tag">#{{ t }}</span>
          </div>
          <button type="button" class="featured-btn" @click.stop="goDetail(featured.id)">
            查看完整做法 →
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

      <div v-loading="loading" class="grid-wrap">
        <el-empty v-if="!loading && gridList.length === 0" description="暂无食谱" />
        <div v-else class="recipe-grid">
          <article
            v-for="item in gridList"
            :key="item.id"
            class="recipe-card"
            @click="goDetail(item.id)"
          >
            <el-image class="card-img" :src="item.coverImage" fit="cover">
              <template #error>
                <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
              </template>
            </el-image>
            <div class="card-tags">
              <span class="mini-tag">{{ recipeCategoryLabel(item.category || '') }}</span>
              <span class="mini-tag alt">{{ item.difficulty || '简单' }}</span>
            </div>
            <h3 class="card-title">{{ item.recipeName }}</h3>
            <p class="card-snippet">{{ item.summary || item.efficacy }}</p>
            <div class="card-foot">
              <span>难度：{{ item.difficulty || '简单' }}</span>
              <span class="detail-link">详情 &gt;</span>
            </div>
          </article>
        </div>
      </div>

      <div v-if="list.length < total" class="load-more">
        <button type="button" @click="loadMore">加载更多食谱…</button>
      </div>

      <section class="bottom-section">
        <div class="tips-box">
          <h4>煎药与烹饪小贴士</h4>
          <ul>
            <li><strong>器具选择</strong>：药膳宜砂锅、陶瓷锅慢炖，忌用铁锅、铝锅，以免药性发生变化。</li>
            <li><strong>火候掌握</strong>：武火煮沸后改文火，所谓「文火慢炖」方能出味入膳。</li>
            <li><strong>食用禁忌</strong>：服药期间忌食生冷、油腻、辛辣；具体忌口请遵医嘱。</li>
          </ul>
        </div>
        <div class="cta-box">
          <p class="cta-title">定制您的专属食谱</p>
          <p class="cta-desc">不知道自己适合吃什么？</p>
          <el-button type="primary" round @click="router.push('/chat')">去社区咨询</el-button>
        </div>
      </section>
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

.daily-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  background: #e6a23c;
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
  margin-bottom: 20px;
}

.hash-tag {
  padding: 4px 12px;
  background: #f5f0e8;
  border-radius: 20px;
  font-size: 13px;
  color: #6b5c4f;
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

.load-more {
  text-align: center;
  margin: 24px 0;
}

.load-more button {
  border: none;
  background: none;
  color: #8b6914;
  font-size: 14px;
  cursor: pointer;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

.tips-box {
  background: #ebe6dc;
  border-radius: 12px;
  padding: 24px 28px;
}

.tips-box h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #3d3028;
}

.tips-box ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.tips-box li {
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.7;
  color: #5c5046;
}

.cta-box {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e0d4;
  padding: 28px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cta-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #3d3028;
}

.cta-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
}
</style>
