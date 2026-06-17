<script setup lang="ts">
import { computed } from 'vue'
import { DIET_TAG_OPTIONS } from '@/utils/solarTerm'
import {
  formatDisplayDate,
  type CheckinPlan,
  type DailyLog,
} from '@/utils/wellnessStorage'

const props = defineProps<{
  log: DailyLog
  plans: CheckinPlan[]
}>()

const emit = defineEmits<{ edit: [] }>()

const moodLabels = ['', '欠佳', '一般', '不错', '很好', '极佳']

const dietTagMap = computed(() =>
  Object.fromEntries(DIET_TAG_OPTIONS.map((t) => [t.id, t])),
)

const donePlans = computed(() =>
  props.plans.filter((p) => props.log.checkins?.[p.id]),
)

const missedPlans = computed(() =>
  props.plans.filter((p) => !props.log.checkins?.[p.id]),
)

const activeDietTags = computed(() =>
  (props.log.dietTags ?? [])
    .map((id) => dietTagMap.value[id])
    .filter(Boolean),
)
</script>

<template>
  <div class="day-detail">
    <div class="detail-head">
      <h3>{{ formatDisplayDate(log.date) }}</h3>
      <el-button type="primary" link @click="emit('edit')">编辑此日</el-button>
    </div>

    <section class="block">
      <h4>打卡计划</h4>
      <ul v-if="donePlans.length" class="check-list done">
        <li v-for="p in donePlans" :key="p.id">
          <span>{{ p.icon }}</span> {{ p.title }}
        </li>
      </ul>
      <ul v-if="missedPlans.length" class="check-list missed">
        <li v-for="p in missedPlans" :key="p.id">
          <span>○</span> {{ p.title }}
        </li>
      </ul>
      <p v-if="!donePlans.length && !missedPlans.length" class="empty">无打卡项</p>
    </section>

    <section v-if="log.wakeTime || log.sleepTime" class="block">
      <h4>作息</h4>
      <p class="text-line">
        <span v-if="log.wakeTime">起床 {{ log.wakeTime }}</span>
        <span v-if="log.sleepTime"> · 入睡 {{ log.sleepTime }}</span>
      </p>
    </section>

    <section v-if="activeDietTags.length" class="block">
      <h4>饮食标签</h4>
      <div class="tag-row">
        <span v-for="tag in activeDietTags" :key="tag.id" class="tag">{{ tag.icon }} {{ tag.label }}</span>
      </div>
    </section>

    <section v-if="log.diet?.trim()" class="block">
      <h4>饮食记录</h4>
      <p class="text-body">{{ log.diet }}</p>
    </section>

    <section v-if="log.lifestyle?.trim()" class="block">
      <h4>生活起居</h4>
      <p class="text-body">{{ log.lifestyle }}</p>
    </section>

    <section class="block">
      <h4>当日状态</h4>
      <p class="text-line">{{ moodLabels[log.mood] || '—' }}（{{ log.mood }} / 5）</p>
    </section>
  </div>
</template>

<style scoped>
.day-detail {
  padding: 4px 2px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e8e4dc;
}

.detail-head h3 {
  margin: 0;
  font-size: 18px;
  color: #1a5f3f;
}

.block {
  margin-bottom: 16px;
}

.block h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #909399;
  font-weight: 600;
}

.check-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.check-list li {
  font-size: 14px;
  color: #303133;
}

.check-list.done li {
  color: #529b2e;
}

.check-list.missed li {
  color: #909399;
}

.text-line,
.text-body {
  margin: 0;
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.text-body {
  white-space: pre-wrap;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  background: #e8f5ee;
  color: #1a5f3f;
  border-radius: 16px;
  font-size: 12px;
}

.empty {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
