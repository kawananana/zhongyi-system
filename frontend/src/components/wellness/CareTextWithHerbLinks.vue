<script setup lang="ts">
import { computed } from 'vue'
import { parseCareTextSegments } from '@/utils/constitutionHerbLinks'

const props = withDefaults(
  defineProps<{
    text: string
    herbLinkIndex: Map<string, number>
    /** 跳转图鉴详情时的来源，用于返回导航 */
    linkFrom?: string
  }>(),
  { linkFrom: 'constitution' },
)

const segments = computed(() => parseCareTextSegments(props.text, props.herbLinkIndex))
</script>

<template>
  <span class="care-text">
    <template v-for="(seg, i) in segments" :key="i">
      <RouterLink
        v-if="seg.type === 'herb' && seg.herbId"
        :to="{ path: `/atlas/herbs/${seg.herbId}`, query: { from: linkFrom } }"
        class="herb-link"
        :title="`查看${seg.value}详情`"
        @click.stop
      >
        {{ seg.value }}
      </RouterLink>
      <template v-else>{{ seg.value }}</template>
    </template>
  </span>
</template>

<style scoped>
.care-text {
  line-height: inherit;
}

.herb-link {
  color: #1a5f3f;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px dashed rgba(26, 95, 63, 0.45);
  transition: color 0.2s, border-color 0.2s;
}

.herb-link:hover {
  color: #2d8a5e;
  border-bottom-color: #2d8a5e;
}
</style>
