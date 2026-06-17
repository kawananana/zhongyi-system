<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HerbFilterPanel from '@/components/atlas/HerbFilterPanel.vue'
import HerbCard from '@/components/atlas/HerbCard.vue'
import { fetchHerbSearch, type HerbItem } from '@/api/herb'
import type { HerbFilterQuery } from '@/types/herb'

const route = useRoute()
const filterPanelRef = ref<InstanceType<typeof HerbFilterPanel> | null>(null)

const loading = ref(false)
const list = ref<HerbItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 24
const filterQuery = ref<HerbFilterQuery>({})
const keyword = ref('')
const activeCategory = ref('')

const initialFilterQuery = computed<HerbFilterQuery | undefined>(() => {
  const nature = route.query.nature as string | undefined
  return nature ? { natures: nature } : undefined
})

const displayList = computed(() => filterPanelRef.value?.filterByCategory(list.value, activeCategory.value) ?? list.value)

async function loadList(append = false) {
  loading.value = true
  try {
    const data = await fetchHerbSearch({
      ...filterQuery.value,
      keyword: keyword.value.trim() || undefined,
      page: page.value,
      pageSize,
    })
    const items = data.list ?? []
    list.value = append ? [...list.value, ...items] : items
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

function onFilterSearch(query: HerbFilterQuery) {
  filterQuery.value = { ...query }
  page.value = 1
  loadList()
}

function onCategoryChange(key: string) {
  activeCategory.value = key
}

function onSearch() {
  page.value = 1
  loadList()
}

function loadMore() {
  if (list.value.length >= total.value) return
  page.value += 1
  loadList(true)
}

watch(
  () => route.query.nature,
  (nature) => {
    if (nature) {
      const q = { natures: String(nature) }
      filterQuery.value = q
      filterPanelRef.value?.initFromQuery(q)
      page.value = 1
      loadList()
    }
  },
)

watch(
  () => route.query.category,
  (category) => {
    if (category) {
      const key = String(category)
      activeCategory.value = key
      filterPanelRef.value?.selectCategory(key)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main">
      <div class="search-bar">
        <el-input
          v-model="keyword"
          class="search-input"
          placeholder="搜索药材名称、别名、功效…"
          clearable
          size="large"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <HerbFilterPanel
        ref="filterPanelRef"
        :initial-query="initialFilterQuery"
        @search="onFilterSearch"
        @category-change="onCategoryChange"
      />

      <div v-loading="loading" class="grid-wrap">
        <el-empty v-if="!loading && displayList.length === 0" description="暂无匹配药材" />
        <el-row v-else :gutter="24">
          <el-col
            v-for="herb in displayList"
            :key="herb.id"
            :xs="24"
            :sm="12"
            :md="12"
            :lg="6"
            class="grid-col"
          >
            <HerbCard :herb="herb" />
          </el-col>
        </el-row>
      </div>

      <div v-if="list.length < total && displayList.length > 0" class="load-more">
        <button type="button" class="load-more-btn" @click="loadMore">加载更多药材 ∨</button>
      </div>

      <aside class="safety-tip">
        <h4>药材使用安全提示</h4>
        <p>
          是药三分毒。本图鉴内容仅供科普学习，不能替代医师诊断与处方。用药请遵医嘱，孕妇、儿童及慢病患者尤须谨慎。
        </p>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px 48px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.grid-wrap {
  min-height: 240px;
}

.grid-col {
  margin-bottom: 24px;
}

.load-more {
  text-align: center;
  margin: 8px 0 32px;
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

.safety-tip {
  background: #ebe6dc;
  border-radius: 8px;
  padding: 20px 24px;
  color: #5c5046;
}

.safety-tip h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #3d3028;
}

.safety-tip p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}
</style>
