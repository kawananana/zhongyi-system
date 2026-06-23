<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchAdminForumPosts,
  updateForumAuditStatus,
  updateForumPostStatus,
  deleteForumPost,
  type ForumPostAdmin,
} from '@/api/admin'

const loading = ref(false)
const list = ref<ForumPostAdmin[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  category: '',
  auditStatus: undefined as number | undefined,
  status: undefined as number | undefined,
})

const detailVisible = ref(false)
const detailPost = ref<ForumPostAdmin | null>(null)

const auditLabel: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已驳回',
}

const auditTagType: Record<number, 'warning' | 'success' | 'danger'> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}

function categoryLabel(cat?: string) {
  if (cat === 'share') return '学习心得'
  if (cat === 'question') return '提问互助'
  return cat || '—'
}

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminForumPosts({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      category: query.category || undefined,
      auditStatus: query.auditStatus,
      status: query.status,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openDetail(row: ForumPostAdmin) {
  detailPost.value = row
  detailVisible.value = true
}

async function audit(row: ForumPostAdmin, auditStatus: number) {
  const action = auditStatus === 1 ? '通过' : '驳回'
  await ElMessageBox.confirm(`确认${action}帖子「${row.title}」？`, action)
  await updateForumAuditStatus(row.id, auditStatus)
  ElMessage.success(`已${action}`)
  load()
}

async function toggleHide(row: ForumPostAdmin) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 0 ? '隐藏' : '恢复显示'
  await ElMessageBox.confirm(`确认${action}帖子「${row.title}」？`, action)
  await updateForumPostStatus(row.id, next)
  ElMessage.success(`已${action}`)
  load()
}

async function onDelete(row: ForumPostAdmin) {
  await ElMessageBox.confirm(
    `确认删除帖子「${row.title}」？删除后不可恢复，客户端将不再展示。`,
    '删除帖子',
    { type: 'warning' },
  )
  await deleteForumPost(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-head">
        <span>论坛管控</span>
        <span class="head-sub">审核通过后展示在客户端「趣学 · 社区」</span>
      </div>
    </template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input v-model="query.keyword" clearable placeholder="标题/正文" style="width: 160px" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="query.category" clearable placeholder="全部" style="width: 120px">
          <el-option label="提问互助" value="question" />
          <el-option label="学习心得" value="share" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核">
        <el-select v-model="query.auditStatus" clearable placeholder="全部" style="width: 110px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="显示">
        <el-select v-model="query.status" clearable placeholder="全部" style="width: 100px">
          <el-option label="正常" :value="1" />
          <el-option label="已隐藏" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query.page = 1; load()">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="作者" width="100">
        <template #default="{ row }">{{ row.authorNickname || '—' }}</template>
      </el-table-column>
      <el-table-column label="分类" width="96">
        <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
      </el-table-column>
      <el-table-column label="关联" width="100" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.refHerbName">{{ row.refHerbName }}</span>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="审核" width="88">
        <template #default="{ row }">
          <el-tag :type="auditTagType[row.auditStatus] ?? 'info'" size="small">
            {{ auditLabel[row.auditStatus] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="显示" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '正常' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="170" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          <el-button
            v-if="row.auditStatus === 0"
            link
            type="success"
            @click="audit(row, 1)"
          >
            通过
          </el-button>
          <el-button
            v-if="row.auditStatus === 0"
            link
            type="danger"
            @click="audit(row, 2)"
          >
            驳回
          </el-button>
          <el-button
            link
            :type="row.status === 1 ? 'warning' : 'success'"
            @click="toggleHide(row)"
          >
            {{ row.status === 1 ? '隐藏' : '恢复' }}
          </el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
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

  <el-dialog v-model="detailVisible" title="帖子详情" width="560px" destroy-on-close>
    <template v-if="detailPost">
      <p class="detail-row"><span class="label">标题</span>{{ detailPost.title }}</p>
      <p class="detail-row"><span class="label">作者</span>{{ detailPost.authorNickname }}（{{ detailPost.authorPhone || '—' }}）</p>
      <p class="detail-row"><span class="label">分类</span>{{ categoryLabel(detailPost.category) }}</p>
      <p v-if="detailPost.refHerbName" class="detail-row">
        <span class="label">药材</span>{{ detailPost.refHerbName }}
      </p>
      <div class="detail-content">{{ detailPost.content }}</div>
    </template>
  </el-dialog>
</template>

<style scoped>
.card-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.head-sub {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}
.filter-form {
  margin-bottom: 12px;
}
.muted {
  color: #c0c4cc;
}
.detail-row {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}
.detail-row .label {
  display: inline-block;
  width: 48px;
  color: #909399;
}
.detail-content {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 320px;
  overflow: auto;
}
</style>
