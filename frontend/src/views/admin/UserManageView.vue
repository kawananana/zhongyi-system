<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAdminUsers, updateUserStatus, type UserAdmin } from '@/api/admin'

const loading = ref(false)
const list = ref<UserAdmin[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined })

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminUsers({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row: UserAdmin) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 0 ? '冻结' : '解冻'
  await ElMessageBox.confirm(`确认${action}账号 ${row.nickname}？`, action)
  await updateUserStatus(row.id, next)
  ElMessage.success(`已${action}`)
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>学员管理</template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input v-model="query.keyword" clearable placeholder="昵称/手机号" style="width: 180px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable style="width: 100px">
          <el-option label="正常" :value="1" />
          <el-option label="冻结" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query.page = 1; load()">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="favoriteCount" label="药匣收藏" width="100" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '冻结' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录" width="170" />
      <el-table-column prop="createTime" label="注册时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link :type="row.status === 1 ? 'danger' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '冻结' : '解冻' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="query.page"
      v-model:page-size="query.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 16px"
      @current-change="load"
    />
  </el-card>
</template>

<style scoped>
.filter-form { margin-bottom: 12px; }
</style>
