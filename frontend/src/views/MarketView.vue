<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import MarketNav from '@/components/market/MarketNav.vue'
import MarketCategoryGrid from '@/components/market/MarketCategoryGrid.vue'
import ProductCard from '@/components/market/ProductCard.vue'
import { fetchProductPage, type ProductItem } from '@/api/product'
import { marketCategoryLabel } from '@/utils/marketCategories'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const list = ref<ProductItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(30)
const keyword = ref('')
const activeCategory = ref('')

const sectionTitle = ref('全部商品')

async function loadList() {
  loading.value = true
  try {
    const data = await fetchProductPage({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      category: activeCategory.value || undefined,
    })
    list.value = data.list ?? []
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

function updateTitle() {
  if (keyword.value.trim()) {
    sectionTitle.value = `搜索「${keyword.value.trim()}」`
  } else if (activeCategory.value) {
    sectionTitle.value = marketCategoryLabel(activeCategory.value)
  } else {
    sectionTitle.value = '全部商品'
  }
}

function onSearch() {
  page.value = 1
  updateTitle()
  loadList()
}

function loadMore() {
  if (list.value.length >= total.value) return
  pageSize.value += 15
  loadList()
}

watch(activeCategory, () => {
  page.value = 1
  updateTitle()
  loadList()
})

watch(
  () => route.query.category,
  (cat) => {
    if (typeof cat === 'string') {
      activeCategory.value = cat
    }
  },
  { immediate: true },
)

watch(activeCategory, (cat) => {
  const q = { ...route.query }
  if (cat) q.category = cat
  else delete q.category
  router.replace({ query: q })
})

loadList()
updateTitle()
</script>

<template>
  <div class="page">
    <HomeHeader />
    <div class="market-layout">
      <MarketNav />
      <main class="market-main">
        <div class="search-bar">
          <el-input
            v-model="keyword"
            class="search-input"
            placeholder="搜索药材、养生茶、膏方…"
            clearable
            size="large"
            @keyup.enter="onSearch"
            @clear="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button class="search-btn" @click="onSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="promo-strip">
          <span class="promo-tag">上新</span>
          <span class="promo-text">精选茶饮、膏方、饮片与理疗用品，持续补充中</span>
        </div>

        <MarketCategoryGrid v-model:active="activeCategory" />

        <section v-loading="loading" class="products-section">
          <div class="section-head">
            <h2 class="section-title">{{ sectionTitle }}</h2>
            <p v-if="total > 0" class="section-meta">共 {{ total }} 件</p>
          </div>

          <el-empty v-if="!loading && list.length === 0" description="暂无相关商品" />

          <div v-else class="product-grid">
            <ProductCard v-for="item in list" :key="item.id" :product="item" />
          </div>

          <div v-if="list.length > 0 && list.length < total" class="load-more">
            <button type="button" class="load-more-btn" @click="loadMore">加载更多商品 ∨</button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}

.market-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px 48px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.market-main {
  flex: 1;
  min-width: 0;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px 0 0 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input :deep(.el-input-group__append) {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.search-btn {
  height: 40px;
  border-radius: 0 8px 8px 0 !important;
  background: #1a5f3f !important;
  border-color: #1a5f3f !important;
  color: #fff !important;
  padding: 0 24px;
  font-weight: 600;
}

.search-btn:hover {
  background: #2d7a5a !important;
  border-color: #2d7a5a !important;
}

.promo-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #ebe6dc;
  border-radius: 8px;
  font-size: 13px;
  color: #5c5046;
  border: 1px solid #e8e0d4;
}

.promo-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  background: #8b6914;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}

.promo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.products-section {
  min-height: 200px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #3d3028;
  font-family: 'Songti SC', 'SimSun', serif;
}

.section-meta {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.load-more {
  text-align: center;
  margin: 24px 0 8px;
}

.load-more-btn {
  border: none;
  background: none;
  color: #8b6914;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
}

.load-more-btn:hover {
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 960px) {
  .market-layout {
    flex-direction: column;
  }
}
</style>
