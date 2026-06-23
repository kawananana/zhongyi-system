<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HomeCarousel3D from '@/components/home/HomeCarousel3D.vue'
import CategoryCard from '@/components/home/CategoryCard.vue'
import HotHerbRank from '@/components/home/HotHerbRank.vue'
import HomeSidePanel from '@/components/home/HomeSidePanel.vue'
import { fetchHerbPage, type HerbItem } from '@/api/herb'
import { HERB_CATEGORIES } from '@/utils/herbDisplay'

const pageLoading = ref(true)
const hotHerbs = ref<HerbItem[]>([])
const herbsForCategory = ref<HerbItem[]>([])

const categoryList = HERB_CATEGORIES.filter((c) => c.key)

const categoryStats = computed(() =>
  categoryList.map((category) => ({
    category,
    count: herbsForCategory.value.filter((h) => category.match(h)).length,
  })),
)

async function loadHomeData() {
  pageLoading.value = true
  try {
    const [herbHotData, herbAllData] = await Promise.allSettled([
      fetchHerbPage({ page: 1, pageSize: 8, sort: 'hot' }),
      fetchHerbPage({ page: 1, pageSize: 50 }),
    ])
    if (herbHotData.status === 'fulfilled') {
      hotHerbs.value = herbHotData.value?.list ?? []
    }
    if (herbAllData.status === 'fulfilled') {
      herbsForCategory.value = herbAllData.value?.list ?? []
    }
  } finally {
    pageLoading.value = false
  }
}

onMounted(loadHomeData)

onActivated(loadHomeData)
</script>

<template>
  <div class="home-page">
    <HomeHeader />

    <main class="home-main" v-loading="pageLoading">
      <div class="content-wrap">
        <el-row :gutter="20" class="home-grid">
          <el-col :xs="24" :lg="5" class="col-left">
            <aside class="left-stack column-stack">
              <HotHerbRank :herbs="hotHerbs" :loading="pageLoading" fill-height />
            </aside>
          </el-col>

          <el-col :xs="24" :lg="14" class="col-center">
            <div class="center-stack column-stack">
            <section class="carousel-section">
              <HomeCarousel3D />
            </section>

            <section class="category-section">
              <div class="category-row">
                <CategoryCard
                  v-for="item in categoryStats"
                  :key="item.category.key"
                  :category="item.category"
                  :count="item.count"
                />
              </div>
            </section>
            </div>
          </el-col>

          <el-col :xs="24" :lg="5" class="col-right">
            <aside class="right-stack column-stack">
              <HomeSidePanel />
            </aside>
          </el-col>
        </el-row>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f3eb;
}

.home-main {
  padding: 24px 0 48px;
}

.content-wrap {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-grid {
  align-items: stretch;
}

.column-stack {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 88px - 24px);
  min-height: 480px;
  gap: 12px;
}

.col-left .left-stack {
  position: sticky;
  top: 88px;
}

.col-left .left-stack > :deep(.rank-card) {
  flex: 1;
  min-height: 0;
}

.col-right .right-stack {
  position: sticky;
  top: 88px;
}

.col-right .right-stack > :deep(*) {
  height: 100%;
}

.carousel-section {
  flex: 1 1 0;
  min-height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.carousel-section > :deep(*) {
  flex: 1;
  min-height: 0;
}

.category-section {
  flex-shrink: 0;
  margin-top: auto;
}

.category-row {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
}

.category-row > * {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 1200px) {
  .category-row > * {
    flex: 1 1 calc(33.333% - 8px);
  }
}

@media (max-width: 992px) {
  .column-stack {
    height: auto;
    min-height: 0;
    position: static;
  }

  .col-left .left-stack {
    position: static;
    height: auto;
    min-height: 0;
  }

  .col-left .left-stack > :deep(.rank-card) {
    flex: none;
  }

  .carousel-section {
    flex: none;
    height: 280px;
    min-height: 280px;
  }

  .category-section {
    margin-top: 0;
  }

  .category-row {
    flex-wrap: wrap;
  }

  .category-row > * {
    flex: 1 1 calc(50% - 6px);
    min-width: 100px;
  }

  .col-left,
  .col-right {
    margin-top: 20px;
  }
}
</style>
