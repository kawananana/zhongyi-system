<script setup lang="ts">
import { TCM_DISCLAIMER } from '@/constants/tcmDisclaimer'
</script>

<template>
  <p class="tcm-disclaimer">{{ TCM_DISCLAIMER }}</p>
</template>

<style scoped>
.tcm-disclaimer {
  margin: 0;
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  background: #faf8f4;
  border: 1px solid #ebe6dc;
  border-radius: 8px;
}
</style>
