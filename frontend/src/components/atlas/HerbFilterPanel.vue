<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchHerbFilterOptions, type HerbFilterOptions, type HerbItem } from '@/api/herb'
import type { FilterTagItem, HerbFilterQuery } from '@/types/herb'
import { HERB_CATEGORIES, filterHerbsByCategory } from '@/utils/herbDisplay'
import { iconForMeridian, iconForNature, iconForTaste } from '@/utils/filterTagIcons'

const props = defineProps<{
  initialQuery?: HerbFilterQuery
}>()

const emit = defineEmits<{
  search: [query: HerbFilterQuery]
  categoryChange: [key: string]
}>()

const loading = ref(true)
const options = ref<HerbFilterOptions | null>(null)
const activeCategory = ref('')

const selectedNatures = ref<string[]>([])
const selectedTastes = ref<string[]>([])
const selectedMeridians = ref<string[]>([])
const selectedProvinces = ref<string[]>([])

const propertyAllActive = computed(
  () =>
    selectedNatures.value.length === 0 &&
    selectedTastes.value.length === 0 &&
    selectedMeridians.value.length === 0,
)

const provinceAllActive = computed(() => selectedProvinces.value.length === 0)

const propertyTags = computed<FilterTagItem[]>(() => {
  if (!options.value) return []
  const list: FilterTagItem[] = []
  options.value.natures.forEach((n) => {
    list.push({
      type: 'nature',
      value: n.value,
      label: n.label,
      icon: iconForNature(n.value),
    })
  })
  options.value.tastes.forEach((t) => {
    const v = t.replace(/味$/, '')
    list.push({
      type: 'taste',
      value: v,
      label: t.endsWith('味') ? t : `${t}味`,
      icon: iconForTaste(v),
    })
  })
  options.value.meridians.forEach((m) => {
    const v = m.replace(/^归/, '').replace(/经$/, '')
    const label = m.includes('经') ? (m.startsWith('归') ? m : `归${m}`) : `归${m}经`
    list.push({
      type: 'meridian',
      value: v,
      label,
      icon: iconForMeridian(v),
    })
  })
  return list
})

/** 省份名 → 行政区划代码（与后端 COMMON_PROVINCES 对齐） */
const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  四川: '51',
  云南: '53',
  贵州: '52',
  广西: '45',
  广东: '44',
  福建: '35',
  江西: '36',
  浙江: '33',
  安徽: '34',
  河南: '41',
  河北: '13',
  山东: '37',
  山西: '14',
  陕西: '61',
  甘肃: '62',
  青海: '63',
  新疆: '65',
  西藏: '54',
  内蒙古: '15',
  吉林: '22',
  江苏: '32',
  湖北: '42',
  湖南: '43',
  重庆: '50',
}

function expandProvinceTags(
  provinces: { code: string; name: string }[],
): FilterTagItem[] {
  const seen = new Set<string>()
  const items: FilterTagItem[] = []
  for (const p of provinces) {
    const parts = p.name
      .split(/[,，、\s]+/)
      .map((s) => s.trim())
      .filter((s) => s && !s.includes('全国') && !s.includes('各地'))
  if (parts.length <= 1) {
      if (!seen.has(p.code)) {
        seen.add(p.code)
        items.push({ type: 'province', value: p.code, label: p.name })
      }
      continue
    }
    for (const name of parts) {
      const code = PROVINCE_NAME_TO_CODE[name] ?? p.code
      if (!seen.has(code)) {
        seen.add(code)
        items.push({ type: 'province', value: code, label: name })
      }
    }
  }
  return items
}

const provinceTags = computed<FilterTagItem[]>(() => {
  if (!options.value) return []
  return expandProvinceTags(options.value.provinces)
})

function buildQuery(): HerbFilterQuery {
  return {
    natures: selectedNatures.value.length ? selectedNatures.value.join(',') : undefined,
    tastes: selectedTastes.value.length ? selectedTastes.value.join(',') : undefined,
    meridians: selectedMeridians.value.length ? selectedMeridians.value.join(',') : undefined,
    provinceCodes: selectedProvinces.value.length ? selectedProvinces.value.join(',') : undefined,
  }
}

function emitSearch() {
  emit('search', buildQuery())
}

function clearProperty() {
  selectedNatures.value = []
  selectedTastes.value = []
  selectedMeridians.value = []
  emitSearch()
}

function clearProvince() {
  selectedProvinces.value = []
  emitSearch()
}

function isTagActive(tag: FilterTagItem) {
  if (tag.type === 'nature') return selectedNatures.value.includes(tag.value)
  if (tag.type === 'taste') return selectedTastes.value.includes(tag.value)
  if (tag.type === 'meridian') return selectedMeridians.value.includes(tag.value)
  return selectedProvinces.value.includes(tag.value)
}

function toggleTag(tag: FilterTagItem) {
  if (tag.type === 'nature') {
    toggleInList(selectedNatures, tag.value)
  } else if (tag.type === 'taste') {
    toggleInList(selectedTastes, tag.value)
  } else if (tag.type === 'meridian') {
    toggleInList(selectedMeridians, tag.value)
  } else {
    toggleInList(selectedProvinces, tag.value)
  }
  emitSearch()
}

function toggleInList(list: { value: string[] }, value: string) {
  const idx = list.value.indexOf(value)
  if (idx >= 0) {
    list.value.splice(idx, 1)
  } else {
    list.value.push(value)
  }
}

function selectCategory(key: string, options?: { silent?: boolean }) {
  activeCategory.value = key
  if (!options?.silent) {
    emit('categoryChange', key)
  }
}

function filterByCategory(herbs: HerbItem[], categoryKey: string) {
  return filterHerbsByCategory(herbs, categoryKey)
}

function initFromQuery(query: HerbFilterQuery) {
  selectedNatures.value = query.natures ? query.natures.split(',').filter(Boolean) : []
  selectedTastes.value = query.tastes ? query.tastes.split(',').filter(Boolean) : []
  selectedMeridians.value = query.meridians ? query.meridians.split(',').filter(Boolean) : []
  selectedProvinces.value = query.provinceCodes ? query.provinceCodes.split(',').filter(Boolean) : []
}

onMounted(async () => {
  loading.value = true
  try {
    options.value = await fetchHerbFilterOptions()
    if (props.initialQuery) {
      initFromQuery(props.initialQuery)
    }
    emitSearch()
  } finally {
    loading.value = false
  }
})

defineExpose({ initFromQuery, filterByCategory, selectCategory })
</script>

<template>
  <div class="filter-panel" v-loading="loading">
    <div class="filter-row">
      <div class="row-label">
        <span class="label-icon green">🌿</span>
        <span>性味归经</span>
      </div>
      <div class="tag-list">
        <button
          type="button"
          class="filter-tag"
          :class="{ active: propertyAllActive }"
          @click="clearProperty"
        >
          不限
        </button>
        <button
          v-for="tag in propertyTags"
          :key="`${tag.type}-${tag.value}`"
          type="button"
          class="filter-tag"
          :class="{ active: isTagActive(tag) }"
          @click="toggleTag(tag)"
        >
          <span v-if="tag.icon" class="tag-icon">{{ tag.icon }}</span>
          {{ tag.label }}
        </button>
      </div>
    </div>

    <div class="divider" />

    <div class="filter-row">
      <div class="row-label">
        <span class="label-icon blue">⛰</span>
        <span>产地分类</span>
      </div>
      <div class="tag-list">
        <button
          type="button"
          class="filter-tag"
          :class="{ active: provinceAllActive }"
          @click="clearProvince"
        >
          不限
        </button>
        <button
          v-for="tag in provinceTags"
          :key="tag.value"
          type="button"
          class="filter-tag"
          :class="{ active: isTagActive(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag.label }}
        </button>
      </div>
    </div>

    <div class="divider" />

    <div class="filter-row">
      <div class="row-label">
        <span class="label-icon amber">✦</span>
        <span>功效分类</span>
      </div>
      <div class="tag-list">
        <button
          v-for="cat in HERB_CATEGORIES"
          :key="cat.key || 'all'"
          type="button"
          class="filter-tag"
          :class="{ active: activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: #faf8f4;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.row-label {
  flex-shrink: 0;
  width: 88px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1a5f3f;
  padding-top: 6px;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.tag-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  border-color: #1a5f3f;
  color: #1a5f3f;
  box-shadow: 0 2px 8px rgba(26, 95, 63, 0.12);
}

.filter-tag.active {
  background: #1a5f3f;
  border-color: #1a5f3f;
  color: #fff;
}

.tag-icon {
  font-size: 14px;
}

.divider {
  height: 1px;
  background: #e8e4dc;
  margin: 16px 0;
}
</style>
