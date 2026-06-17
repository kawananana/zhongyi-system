<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Filter } from '@element-plus/icons-vue'
import { MERIDIAN_LIST, MERIDIAN_SHORT } from '@/data/meridianRoutes'

const props = defineProps<{
  active: string
}>()

const emit = defineEmits<{
  select: [meridian: string]
  search: []
}>()

const filterKw = ref('')

const list = computed(() => {
  const kw = filterKw.value.trim()
  return MERIDIAN_LIST.filter((m) => {
    if (!kw) return true
    const short = MERIDIAN_SHORT[m] ?? m
    return m.includes(kw) || short.includes(kw)
  })
})
</script>

<template>
  <aside class="meridian-rail">
    <button type="button" class="rail-action" @click="emit('search')">
      <el-icon><Search /></el-icon>
      <span>搜索</span>
    </button>
    <div class="filter-row">
      <el-icon><Filter /></el-icon>
      <input v-model="filterKw" type="text" placeholder="筛选经络" class="filter-input" />
    </div>
    <ul class="meridian-list">
      <li v-for="m in list" :key="m">
        <button
          type="button"
          class="meridian-btn"
          :class="{ active: props.active === m }"
          @click="emit('select', m)"
        >
          {{ MERIDIAN_SHORT[m] ?? m }}
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.meridian-rail {
  position: absolute;
  top: 16px;
  right: 16px;
  bottom: 200px;
  width: 88px;
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
}

.rail-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c5348;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rail-action:hover {
  background: #fff;
  color: #1a5f3f;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 8px;
  font-size: 12px;
  color: #888;
}

.filter-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 11px;
  outline: none;
  width: 100%;
  min-width: 0;
}

.meridian-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meridian-btn {
  width: 100%;
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  color: #5c5348;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.meridian-btn:hover {
  background: #fff;
}

.meridian-btn.active {
  background: #c9a66b;
  color: #fff;
  font-weight: 600;
}
</style>
