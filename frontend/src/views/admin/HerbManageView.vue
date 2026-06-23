<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteAdminHerb,
  fetchAdminHerbs,
  updateAdminHerb,
  updateAdminHerbStatus,
  type HerbAdmin,
} from '@/api/admin'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const NATURE_OPTIONS = ['寒', '热', '温', '凉', '平']

const loading = ref(false)
const list = ref<HerbAdmin[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  nature: '',
  status: undefined as number | undefined,
})

const dialogVisible = ref(false)
const saving = ref(false)
const editing = ref<HerbAdmin | null>(null)
const form = reactive({
  herbName: '',
  alias: '',
  originProvinceName: '',
  daoDiRegion: '',
  isDaoDi: 0,
  nature: '',
  taste: '',
  meridian: '',
  propertyDesc: '',
  efficacy: '',
  clinicalUsage: '',
  coverImage: '',
})

function resetForm() {
  form.herbName = ''
  form.alias = ''
  form.originProvinceName = ''
  form.daoDiRegion = ''
  form.isDaoDi = 0
  form.nature = ''
  form.taste = ''
  form.meridian = ''
  form.propertyDesc = ''
  form.efficacy = ''
  form.clinicalUsage = ''
  form.coverImage = ''
}

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminHerbs({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      nature: query.nature || undefined,
      status: query.status,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row: HerbAdmin) {
  editing.value = row
  form.herbName = row.herbName
  form.alias = row.alias || ''
  form.originProvinceName = row.originProvinceName || ''
  form.daoDiRegion = row.daoDiRegion || ''
  form.isDaoDi = row.isDaoDi ?? 0
  form.nature = row.nature || ''
  form.taste = row.taste || ''
  form.meridian = row.meridian || ''
  form.propertyDesc = row.propertyDesc || ''
  form.efficacy = row.efficacy || ''
  form.clinicalUsage = row.clinicalUsage || ''
  form.coverImage = row.coverImage || ''
  dialogVisible.value = true
}

async function saveEdit() {
  if (!editing.value) return
  if (!form.herbName.trim()) {
    ElMessage.warning('请填写药材名称')
    return
  }
  saving.value = true
  try {
    await updateAdminHerb(editing.value.id, {
      herbName: form.herbName.trim(),
      alias: form.alias.trim() || undefined,
      originProvinceName: form.originProvinceName.trim() || undefined,
      daoDiRegion: form.daoDiRegion.trim() || undefined,
      isDaoDi: form.isDaoDi,
      nature: form.nature || undefined,
      taste: form.taste.trim() || undefined,
      meridian: form.meridian.trim() || undefined,
      propertyDesc: form.propertyDesc.trim() || undefined,
      efficacy: form.efficacy.trim() || undefined,
      clinicalUsage: form.clinicalUsage.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
    })
    ElMessage.success('已保存')
    dialogVisible.value = false
    editing.value = null
    resetForm()
    load()
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row: HerbAdmin) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 1 ? '上架' : '下架'
  await ElMessageBox.confirm(`确认${action}「${row.herbName}」？`, action)
  await updateAdminHerbStatus(row.id, next)
  ElMessage.success(`已${action}`)
  load()
}

async function onDelete(row: HerbAdmin) {
  await ElMessageBox.confirm(
    `确认删除「${row.herbName}」？删除后 C 端将不再展示，关联收藏将一并清除。`,
    '删除药材',
    { type: 'warning' },
  )
  await deleteAdminHerb(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-head">
        <span>图鉴管理</span>
        <span class="head-sub">共 {{ total }} 味药材，与 C 端图鉴数据同步</span>
      </div>
    </template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input v-model="query.keyword" clearable placeholder="名称/别名/功效" style="width: 180px" />
      </el-form-item>
      <el-form-item label="药性">
        <el-select v-model="query.nature" clearable placeholder="全部" style="width: 100px">
          <el-option v-for="n in NATURE_OPTIONS" :key="n" :label="n" :value="n" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部" style="width: 100px">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query.page = 1; load()">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="封面" width="64">
        <template #default="{ row }">
          <el-image
            class="thumb"
            :src="row.coverImage"
            fit="cover"
            lazy
          >
            <template #error>
              <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="thumb" />
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="herbName" label="药材名称" min-width="110" show-overflow-tooltip />
      <el-table-column prop="alias" label="别名" min-width="100" show-overflow-tooltip />
      <el-table-column prop="nature" label="药性" width="72" />
      <el-table-column prop="originProvinceName" label="产地" min-width="100" show-overflow-tooltip />
      <el-table-column prop="viewCount" label="站内浏览" width="88" />
      <el-table-column prop="collectCount" label="收藏" width="72" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="query.page"
      v-model:page-size="query.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 16px"
      @current-change="load"
      @size-change="query.page = 1; load()"
    />
  </el-card>

  <el-dialog v-model="dialogVisible" title="编辑药材" width="640px" destroy-on-close @closed="resetForm">
    <el-form label-width="88px">
      <el-form-item label="药材名称" required>
        <el-input v-model="form.herbName" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="别名">
        <el-input v-model="form.alias" maxlength="128" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="药性">
            <el-select v-model="form.nature" clearable placeholder="选择" style="width: 100%">
              <el-option v-for="n in NATURE_OPTIONS" :key="n" :label="n" :value="n" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="味道">
            <el-input v-model="form.taste" placeholder="如：甘、苦" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="归经">
        <el-input v-model="form.meridian" placeholder="如：脾、肺" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="产地">
            <el-input v-model="form.originProvinceName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="道地产区">
            <el-input v-model="form.daoDiRegion" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="道地药材">
        <el-switch v-model="form.isDaoDi" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="封面图">
        <el-input v-model="form.coverImage" placeholder="/images/herbs/..." />
      </el-form-item>
      <el-form-item label="性状描述">
        <el-input v-model="form.propertyDesc" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="功效">
        <el-input v-model="form.efficacy" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="临床应用">
        <el-input v-model="form.clinicalUsage" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveEdit">保存</el-button>
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
.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}
</style>
