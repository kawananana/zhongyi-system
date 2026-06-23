<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  approveOrderReturn,
  fetchAdminOrderReturns,
  rejectOrderReturn,
  type OrderReturnAdmin,
} from '@/api/admin'

const loading = ref(false)
const list = ref<OrderReturnAdmin[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: undefined as number | undefined,
})

const detailVisible = ref(false)
const detailRow = ref<OrderReturnAdmin | null>(null)

const statusLabel: Record<number, string> = {
  0: '待审核',
  1: '已同意',
  2: '已拒绝',
}

const statusTag: Record<number, 'warning' | 'success' | 'danger'> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}

const orderStatusLabel: Record<number, string> = {
  0: '待发货',
  1: '待收货',
  2: '已完成',
  3: '已取消',
}

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminOrderReturns({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      status: query.status,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openDetail(row: OrderReturnAdmin) {
  detailRow.value = row
  detailVisible.value = true
}

async function onApprove(row: OrderReturnAdmin) {
  await ElMessageBox.confirm(`确认同意订单 ${row.orderNo} 的退货申请？`, '同意退货')
  await approveOrderReturn(row.id)
  ElMessage.success('已同意退货')
  load()
}

async function onReject(row: OrderReturnAdmin) {
  try {
    const { value } = await ElMessageBox.prompt('请填写拒绝原因', '拒绝退货', {
      inputPlaceholder: '如：已超过退货期限',
      inputValidator: (v) => !!(v && v.trim()) || '请填写拒绝原因',
    })
    await rejectOrderReturn(row.id, value.trim())
    ElMessage.success('已拒绝退货')
    load()
  } catch {
    /* cancelled */
  }
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-head">
        <span>退货审核</span>
        <span class="head-sub">处理用户市集订单退货申请</span>
      </div>
    </template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input v-model="query.keyword" clearable placeholder="订单号/用户/原因" style="width: 180px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
          <el-option label="待审核" :value="0" />
          <el-option label="已同意" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="orderNo" label="订单号" width="150" />
      <el-table-column label="用户" width="120">
        <template #default="{ row }">{{ row.userNickname || '—' }}</template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="金额" width="90">
        <template #default="{ row }">¥{{ Number(row.totalAmount).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="退货原因" min-width="180" show-overflow-tooltip />
      <el-table-column label="订单状态" width="90">
        <template #default="{ row }">{{ orderStatusLabel[row.orderStatus] ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag[row.status] ?? 'info'" size="small">
            {{ statusLabel[row.status] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="170" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          <el-button v-if="row.status === 0" link type="success" @click="onApprove(row)">同意</el-button>
          <el-button v-if="row.status === 0" link type="danger" @click="onReject(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="query.page"
      v-model:page-size="query.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      class="pager"
      @current-change="load"
      @size-change="load"
    />
  </el-card>

  <el-dialog v-model="detailVisible" title="退货申请详情" width="560px">
    <template v-if="detailRow">
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="订单号">{{ detailRow.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ detailRow.userNickname }}（{{ detailRow.userPhone }}）
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ Number(detailRow.totalAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detailRow.receiverName }} {{ detailRow.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ detailRow.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="退货原因">{{ detailRow.reason }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ statusLabel[detailRow.status] }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRow.adminRemark" label="审核说明">
          {{ detailRow.adminRemark }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detailRow.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRow.auditTime" label="审核时间">
          {{ detailRow.auditTime }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-dialog>
</template>

<style scoped>
.card-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.head-sub {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.filter-form {
  margin-bottom: 12px;
}

.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
