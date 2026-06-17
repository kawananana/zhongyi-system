<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchRecipeDetail, type RecipeItem } from '@/api/recipe'
import { parseRecipeTags, recipeCategoryLabel } from '@/utils/recipeCategories'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const recipe = ref<RecipeItem | null>(null)

const tagList = computed(() => parseRecipeTags(recipe.value?.tags))

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    recipe.value = await fetchRecipeDetail(id)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main" v-loading="loading">
      <template v-if="recipe">
        <button type="button" class="back" @click="router.push('/guide')">← 返回药膳食疗</button>
        <article class="detail">
          <el-image class="cover" :src="recipe.coverImage" fit="cover">
            <template #error>
              <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
            </template>
          </el-image>
          <div class="meta">
            <span class="tag">{{ recipeCategoryLabel(recipe.category || '') }}</span>
            <span>烹饪时间：{{ recipe.cookingTime }}</span>
            <span>难度：{{ recipe.difficulty }}</span>
          </div>
          <h1>{{ recipe.recipeName }}</h1>
          <p class="summary">{{ recipe.summary }}</p>
          <div v-if="tagList.length" class="tags">
            <span v-for="t in tagList" :key="t" class="hash">#{{ t }}</span>
          </div>
          <section v-if="recipe.efficacy">
            <h3>功效</h3>
            <p>{{ recipe.efficacy }}</p>
          </section>
          <section v-if="recipe.cookingSteps">
            <h3>做法</h3>
            <p class="steps">{{ recipe.cookingSteps }}</p>
          </section>
        </article>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}
.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px 24px 48px;
}
.back {
  border: none;
  background: none;
  color: #4a7fb5;
  cursor: pointer;
  margin-bottom: 16px;
}
.detail {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e8e0d4;
}
.cover,
.error-img {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.error-img {
  object-fit: cover;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.tag {
  background: #e8f5ee;
  color: #1a5f3f;
  padding: 2px 10px;
  border-radius: 4px;
}
h1 {
  margin: 0 0 12px;
  font-size: 28px;
  color: #3d3028;
}
.summary {
  line-height: 1.75;
  color: #606266;
  margin-bottom: 16px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.hash {
  background: #f5f0e8;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
}
section h3 {
  font-size: 16px;
  color: #1a5f3f;
  margin: 0 0 8px;
}
section p {
  line-height: 1.8;
  color: #606266;
  margin: 0 0 20px;
}
.steps {
  white-space: pre-wrap;
}
</style>
