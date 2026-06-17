<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Share, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { toggleMedicineBox } from '@/api/medicineBox'
import { requireUserLogin } from '@/utils/requireLogin'

const props = withDefaults(
  defineProps<{
    herbId: number
    herbName: string
    collected?: boolean
  }>(),
  {
    collected: false,
  },
)

const emit = defineEmits<{
  'update:collected': [value: boolean]
}>()

const router = useRouter()
const isCollected = ref(props.collected)
const favoriteLoading = ref(false)

watch(
  () => props.collected,
  (v) => {
    isCollected.value = v
  },
)

async function onToggleFavorite() {
  if (!requireUserLogin(router, '登录后可收藏药材')) return
  favoriteLoading.value = true
  try {
    const action = isCollected.value ? 'remove' : 'add'
    const res = await toggleMedicineBox(props.herbId, action)
    isCollected.value = res.isCollected
    emit('update:collected', res.isCollected)
    ElMessage.success(res.isCollected ? '已加入药匣' : '已取消收藏')
  } finally {
    favoriteLoading.value = false
  }
}

function onShare() {
  if (!requireUserLogin(router, '登录后可分享到社区')) return
  router.push({
    path: '/wellness',
    query: {
      tab: 'community',
      compose: 'herb',
      herbId: String(props.herbId),
      herbName: props.herbName,
    },
  })
}
</script>

<template>
  <div class="herb-actions" @click.stop>
    <el-button
      :class="{ collected: isCollected }"
      :loading="favoriteLoading"
      @click="onToggleFavorite"
    >
      <el-icon>
        <StarFilled v-if="isCollected" />
        <Star v-else />
      </el-icon>
      {{ isCollected ? '已收藏' : '收藏' }}
    </el-button>
    <el-button @click="onShare">
      <el-icon><Share /></el-icon>
      分享到社区
    </el-button>
  </div>
</template>

<style scoped>
.herb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.herb-actions .collected {
  color: #8b6914;
  border-color: #d4c4a8;
  background: #faf6f0;
}
</style>
