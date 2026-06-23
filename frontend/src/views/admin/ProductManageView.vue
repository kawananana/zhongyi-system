<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
  type ProductAdmin,
} from '@/api/admin'
import { MARKET_CATEGORIES } from '@/utils/marketCategories'
import MarketProductImage from '@/components/market/MarketProductImage.vue'

const loading = ref(false)
const list = ref<ProductAdmin[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  category: '',
  status: undefined as number | undefined,
})

const dialogVisible = ref(false)
const saving = ref(false)
const editing = ref<ProductAdmin | null>(null)
const form = reactive({
  productName: '',
  category: 'food_medicine',
  price: 0,
  stock: 0,
  coverImage: '',
  detail: '',
})

function resetForm() {
  form.productName = ''
  form.category = 'food_medicine'
  form.price = 0
  form.stock = 0
  form.coverImage = ''
  form.detail = ''
}

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminProducts({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      category: query.category || undefined,
      status: query.status,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openEdit(row: ProductAdmin) {
  editing.value = row
  form.productName = row.productName
  form.category = row.category
  form.price = Number(row.price)
  form.stock = row.stock
  form.coverImage = row.coverImage || ''
  form.detail = row.detail || ''
  dialogVisible.value = true
}

async function saveEdit() {
  if (!editing.value) return
  if (!form.productName.trim()) {
    ElMessage.warning('请填写商品名称')
    return
  }
  saving.value = true
  try {
    await updateAdminProduct(editing.value.id, {
      productName: form.productName.trim(),
      category: form.category,
      price: form.price,
      stock: form.stock,
      coverImage: form.coverImage.trim() || undefined,
      detail: form.detail.trim() || undefined,
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

async function toggleStatus(row: ProductAdmin) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 1 ? '上架' : '下架'
  await ElMessageBox.confirm(`确认${action}「${row.productName}」？`, action)
  await updateAdminProductStatus(row.id, next)
  ElMessage.success(`已${action}`)
  load()
}

function formatPrice(n: number) {
  return Number(n).toFixed(2)
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-head">
        <span>市集商品管理</span>
        <span class="head-sub">共 {{ total }} 件商品，与 C 端市集数据同步</span>
      </div>
    </template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input v-model="query.keyword" clearable placeholder="名称/描述" style="width: 180px" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="query.category" clearable placeholder="全部" style="width: 140px">
          <el-option
            v-for="c in MARKET_CATEGORIES"
            :key="c.key"
            :label="c.label"
            :value="c.key"
          />
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
      <el-table-column label="封面" width="72">
        <template #default="{ row }">
          <div class="thumb-wrap">
            <MarketProductImage
              :product-id="row.id"
              :product-name="row.productName"
              :category="row.category"
              :cover-image="row.coverImage"
              fit="cover"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
      <el-table-column label="分类" width="110">
        <template #default="{ row }">{{ row.categoryLabel || row.category }}</template>
      </el-table-column>
      <el-table-column label="价格" width="90">
        <template #default="{ row }">¥{{ formatPrice(row.price) }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="salesCount" label="本站销量" width="90" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
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

  <el-dialog v-model="dialogVisible" title="编辑商品" width="560px" destroy-on-close @closed="resetForm">
    <el-form label-width="88px">
      <el-form-item label="商品名称" required>
        <el-input v-model="form.productName" maxlength="128" show-word-limit />
      </el-form-item>
      <el-form-item label="分类" required>
        <el-select v-model="form.category" style="width: 100%">
          <el-option
            v-for="c in MARKET_CATEGORIES"
            :key="c.key"
            :label="c.label"
            :value="c.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" required>
        <el-input-number v-model="form.price" :min="0.01" :precision="2" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="库存" required>
        <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="封面图">
        <el-input v-model="form.coverImage" placeholder="/images/market/..." />
      </el-form-item>
      <el-form-item label="详情">
        <el-input
          v-model="form.detail"
          type="textarea"
          :rows="4"
          placeholder="【标签】| 规格：… | 说明"
        />
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
.thumb-wrap {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}
</style>
