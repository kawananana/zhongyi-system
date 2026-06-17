<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { HerbItem } from '@/api/herb'
import {
  extractLatinName,
  formatPropertyLine,
  herbBadgeClass,
  herbCategoryLabel,
  herbSummaryText,
} from '@/utils/herbDisplay'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const props = defineProps<{
  herb: HerbItem
}>()

const router = useRouter()

const categoryLabel = computed(() => herbCategoryLabel(props.herb))
const badgeClass = computed(() => herbBadgeClass(props.herb))
const latinName = computed(() => extractLatinName(props.herb.alias))
const propertyLine = computed(() => formatPropertyLine(props.herb))
const summary = computed(() => herbSummaryText(props.herb))

function goDetail() {
  router.push(`/atlas/herbs/${props.herb.id}`)
}
</script>

<template>
  <article class="herb-card" @click="goDetail">
    <div class="card-cover">
      <span class="badge" :class="badgeClass">{{ categoryLabel }}</span>
      <el-image class="cover-img" :src="herb.coverImage" fit="cover" lazy>
        <template #error>
          <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
        </template>
      </el-image>
    </div>
    <div class="card-body">
      <div class="name-row">
        <h3 class="cn-name">{{ herb.herbName }}</h3>
        <span v-if="latinName" class="latin-name">{{ latinName }}</span>
      </div>
      <p v-if="propertyLine" class="property-line">{{ propertyLine }}</p>
      <p v-if="summary" class="summary">{{ summary }}</p>
      <button type="button" class="detail-btn" @click.stop="goDetail">查看详情</button>
    </div>
  </article>
</template>

<style scoped>
.herb-card {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.herb-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(92, 64, 51, 0.12);
}

.card-cover {
  position: relative;
  height: 200px;
  background: linear-gradient(180deg, #f5efe6 0%, #ebe3d6 100%);
}

.cover-img {
  width: 100%;
  height: 100%;
}

.error-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.badge-tonify {
  background: #c45c26;
}

.badge-clear {
  background: #5a8f5a;
}

.badge-release {
  background: #4a7fb5;
}

.badge-digest {
  background: #8b6914;
}

.badge-calm {
  background: #6b5b95;
}

.badge-default {
  background: #6b5344;
}

.card-body {
  padding: 16px 18px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.name-row {
  margin-bottom: 8px;
}

.cn-name {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #3d3028;
  font-family: 'Songti SC', 'SimSun', serif;
}

.latin-name {
  display: block;
  font-size: 13px;
  color: #8c7b6b;
  font-style: italic;
}

.property-line {
  margin: 0 0 10px;
  font-size: 13px;
  color: #6b5c4f;
}

.summary {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.75;
  color: #5c5046;
  flex: 1;
  text-align: left;
}

.detail-btn {
  align-self: center;
  padding: 8px 28px;
  border: 1px solid #c4b8a8;
  border-radius: 2px;
  background: #fff;
  color: #5c5046;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn:hover {
  border-color: #8b6914;
  color: #8b6914;
  background: #faf6f0;
}
</style>
