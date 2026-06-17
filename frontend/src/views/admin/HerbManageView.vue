<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchHerbPage, type HerbItem } from '@/api/herb'

const loading = ref(false)
const tableData = ref<HerbItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

async function loadData() {
  loading.value = true
  try {
    const data = await fetchHerbPage({ page: page.value, pageSize: pageSize.value })
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <span>图鉴管理</span>
    </template>
    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="herbName" label="药材名称" min-width="120" />
      <el-table-column prop="nature" label="药性" width="80" />
      <el-table-column prop="originProvinceName" label="产地" min-width="120" />
      <el-table-column prop="viewCount" label="浏览量" width="100" />
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </div>
  </el-card>
</template>

<style scoped>
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
