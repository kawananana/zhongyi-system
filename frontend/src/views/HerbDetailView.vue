<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HerbActions from '@/components/atlas/HerbActions.vue'
import { fetchHerbDetail, type HerbDetail } from '@/api/herb'
import { parseHerbDetailContent } from '@/types/herbDetail'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const herb = ref<HerbDetail | null>(null)
const collected = ref(false)

const detail = computed(() => {
  const parsed = parseHerbDetailContent(herb.value?.detailContent)
  if (parsed) return parsed
  const h = herb.value
  if (!h) return null
  return {
    intro: h.propertyDesc,
    aliasOrigin: [h.alias, h.originProvinceName || h.daoDiRegion].filter(Boolean).join('。'),
    property: [h.nature ? `性${h.nature}` : '', h.taste ? `味${h.taste}` : '', h.meridian ? `归${h.meridian}经` : '']
      .filter(Boolean)
      .join('，'),
    efficacy: h.efficacy,
    clinical: h.clinicalUsage,
  }
})

const mainImage = computed(() => herb.value?.images?.[0] || herb.value?.coverImage || '')

const backLabel = computed(() => {
  if (route.query.from === 'constitution') return '← 返回体质测评结果'
  if (route.query.from === 'guide') return '← 返回药膳食疗'
  if (route.query.from === 'dice-map') return '← 返回寻药地图'
  return '← 返回图鉴'
})

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    const data = await fetchHerbDetail(id)
    herb.value = data
    collected.value = !!data.isCollected
  } finally {
    loading.value = false
  }
})

function goBack() {
  if (route.query.from === 'constitution') {
    router.push('/constitution')
    return
  }
  if (route.query.from === 'guide') {
    router.push('/guide')
    return
  }
  if (route.query.from === 'dice-map') {
    router.push('/atlas/herbs/dice-map')
    return
  }
  router.push('/atlas/herbs')
}
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main" v-loading="loading">
      <template v-if="herb">
        <button type="button" class="back-link" @click="goBack">{{ backLabel }}</button>

        <header class="detail-header">
          <h1 class="herb-name">{{ herb.herbName }}</h1>
          <HerbActions
            :herb-id="herb.id"
            :herb-name="herb.herbName"
            v-model:collected="collected"
          />
        </header>

        <div class="content-layout">
          <div class="main-col">
            <div class="hero-image-wrap">
              <el-image class="hero-image" :src="mainImage" fit="contain">
                <template #error>
                  <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
                </template>
              </el-image>
            </div>

            <article v-if="detail" class="detail-article">
              <section v-if="detail.intro" class="detail-section">
                <p class="section-body">{{ detail.intro }}</p>
              </section>

              <section v-if="detail.aliasOrigin" class="detail-section">
                <h2>别名与产地</h2>
                <p class="section-body">{{ detail.aliasOrigin }}</p>
              </section>

              <section v-if="detail.property" class="detail-section">
                <h2>药性</h2>
                <p class="section-body">{{ detail.property }}</p>
              </section>

              <section v-if="detail.efficacy" class="detail-section">
                <h2>功效</h2>
                <p class="section-body">{{ detail.efficacy }}</p>
              </section>

              <section v-if="detail.clinical" class="detail-section">
                <h2>临床应用</h2>
                <p class="section-body pre-wrap">{{ detail.clinical }}</p>
              </section>

              <section v-if="detail.suitableCrowd" class="detail-section">
                <h2>适宜人群</h2>
                <p class="section-body pre-wrap">{{ detail.suitableCrowd }}</p>
              </section>

              <section v-if="detail.contraindication" class="detail-section">
                <h2>禁忌人群</h2>
                <p class="section-body pre-wrap">{{ detail.contraindication }}</p>
              </section>

              <section v-if="detail.applications?.length" class="detail-section">
                <h2>应用</h2>
                <ol class="formula-list">
                  <li v-for="(item, index) in detail.applications" :key="'app-' + index">{{ item }}</li>
                </ol>
              </section>

              <section v-if="detail.formulas?.length" class="detail-section">
                <h2>验方</h2>
                <ol class="formula-list">
                  <li v-for="(item, index) in detail.formulas" :key="'f-' + index">{{ item }}</li>
                </ol>
              </section>

              <section v-if="detail.precautions" class="detail-section">
                <h2>使用注意</h2>
                <p class="section-body pre-wrap">{{ detail.precautions }}</p>
              </section>

              <section v-if="detail.nutrition" class="detail-section">
                <h2>成分与营养</h2>
                <p class="section-body pre-wrap">{{ detail.nutrition }}</p>
              </section>

              <section v-if="detail.references?.length" class="detail-section">
                <h2>文献摘要</h2>
                <ol class="ref-list">
                  <li v-for="(ref, index) in detail.references" :key="index">{{ ref }}</li>
                </ol>
              </section>

              <section v-if="detail.commentary" class="detail-section">
                <h2>按语</h2>
                <p class="section-body">{{ detail.commentary }}</p>
              </section>

              <section v-if="detail.appendix" class="detail-section">
                <h2>附录</h2>
                <p class="section-body pre-wrap">{{ detail.appendix }}</p>
              </section>

              <section v-if="detail.modernResearch" class="detail-section">
                <h2>现代研究</h2>
                <p class="section-body pre-wrap">{{ detail.modernResearch }}</p>
              </section>
            </article>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f3eb;
}

.main {
  max-width: 880px;
  margin: 0 auto;
  padding: 20px 24px 56px;
}

.back-link {
  border: none;
  background: #fff;
  color: #1a5f3f;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ebe6dc;
  margin-bottom: 20px;
  transition: background 0.2s;
}

.back-link:hover {
  background: #f0f7f2;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.herb-name {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1a5f3f;
  flex: 1;
  min-width: 0;
}

.detail-header :deep(.herb-actions) {
  margin-top: 0;
  flex-shrink: 0;
  justify-content: flex-end;
}

.hero-image-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebe6dc;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(26, 95, 63, 0.06);
}

.hero-image {
  width: 100%;
  height: 360px;
  display: block;
  background: #fff;
}

.error-img {
  width: 100%;
  height: 360px;
  object-fit: contain;
}

.detail-article {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebe6dc;
  padding: 28px 32px 36px;
  box-shadow: 0 4px 16px rgba(26, 95, 63, 0.06);
}

.detail-section {
  margin-bottom: 28px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h2 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1a5f3f;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(26, 95, 63, 0.12);
}

.section-body {
  margin: 0;
  font-size: 15px;
  line-height: 1.9;
  color: #4a4a4a;
  text-align: justify;
}

.section-body.pre-wrap {
  white-space: pre-wrap;
}

.formula-list,
.ref-list {
  margin: 0;
  padding-left: 1.4em;
  font-size: 15px;
  line-height: 1.9;
  color: #4a4a4a;
}

.formula-list li,
.ref-list li {
  margin-bottom: 14px;
}

.formula-list li:last-child,
.ref-list li:last-child {
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-header :deep(.herb-actions) {
    justify-content: flex-end;
  }

  .detail-article {
    padding: 20px 18px 28px;
  }

  .herb-name {
    font-size: 26px;
  }

  .hero-image,
  .error-img {
    height: 260px;
  }
}
</style>
