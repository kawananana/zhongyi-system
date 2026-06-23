<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { fetchAdminOrders, updateAdminOrderStatus, type ShopOrderAdmin } from '@/api/admin'

const loading = ref(false)
const list = ref<ShopOrderAdmin[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  orderStatus: undefined as number | undefined,
  payStatus: undefined as number | undefined,
})

const detailVisible = ref(false)
const detailRow = ref<ShopOrderAdmin | null>(null)

const orderStatusLabel: Record<number, string> = {
  0: '待发货',
  1: '待收货',
  2: '已完成',
  3: '已取消',
}

const payStatusLabel: Record<number, string> = {
  0: '待付款',
  1: '已付款',
  2: '已退款',
}

const returnStatusLabel: Record<number, string> = {
  0: '退货审核中',
  1: '退货已同意',
  2: '退货已拒绝',
}

const orderTagType: Record<number, 'warning' | 'primary' | 'success' | 'info'> = {
  0: 'warning',
  1: 'primary',
  2: 'success',
  3: 'info',
}

const statusActions = [
  { label: '待发货', orderStatus: 0, payStatus: 1 },
  { label: '待收货', orderStatus: 1, payStatus: 1 },
  { label: '已完成', orderStatus: 2, payStatus: 1 },
  { label: '已退款', orderStatus: 3, payStatus: 2 },
]

function displayOrderStatus(row: ShopOrderAdmin) {
  if (row.payStatus === 2) return '已退款'
  return orderStatusLabel[row.orderStatus] ?? '—'
}

function displayOrderTagType(row: ShopOrderAdmin) {
  if (row.payStatus === 2) return 'info'
  return orderTagType[row.orderStatus] ?? 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await fetchAdminOrders({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      orderStatus: query.orderStatus,
      payStatus: query.payStatus,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openDetail(row: ShopOrderAdmin) {
  detailRow.value = row
  detailVisible.value = true
}

function formatAmount(n: number) {
  return `¥${Number(n).toFixed(2)}`
}

async function changeStatus(row: ShopOrderAdmin, action: (typeof statusActions)[number]) {
  await ElMessageBox.confirm(`确认将订单 ${row.orderNo} 改为「${action.label}」？`, '修改状态')
  const updated = await updateAdminOrderStatus(row.id, {
    orderStatus: action.orderStatus,
    payStatus: action.payStatus,
  })
  const idx = list.value.findIndex((o) => o.id === row.id)
  if (idx >= 0) list.value[idx] = updated
  if (detailRow.value?.id === row.id) detailRow.value = updated
  ElMessage.success('状态已更新')
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-head">
        <span>订单管理</span>
        <span class="head-sub">查看市集全部订单与收货信息</span>
      </div>
    </template>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="搜索">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="订单号/用户/收货人"
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="query.orderStatus" clearable placeholder="全部" style="width: 110px">
          <el-option label="待发货" :value="0" />
          <el-option label="待收货" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态">
        <el-select v-model="query.payStatus" clearable placeholder="全部" style="width: 110px">
          <el-option label="待付款" :value="0" />
          <el-option label="已付款" :value="1" />
          <el-option label="已退款" :value="2" />
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
      <el-table-column label="商品" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.items?.map((i) => `${i.productName}×${i.quantity}`).join('；') || '—' }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">{{ formatAmount(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="订单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="displayOrderTagType(row)" size="small">
            {{ displayOrderStatus(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付" width="88">
        <template #default="{ row }">{{ payStatusLabel[row.payStatus] ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="退货" width="108">
        <template #default="{ row }">
          <span v-if="!row.returnRequest">—</span>
          <el-tag
            v-else
            size="small"
            :type="row.returnRequest.status === 1 ? 'success' : row.returnRequest.status === 2 ? 'danger' : 'warning'"
          >
            {{ returnStatusLabel[row.returnRequest.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-dropdown trigger="click" @command="(cmd: (typeof statusActions)[number]) => changeStatus(row, cmd)">
            <el-button link type="primary">
              改状态
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="action in statusActions"
                  :key="action.label"
                  :command="action"
                >
                  {{ action.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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

  <el-dialog v-model="detailVisible" title="订单详情" width="620px">
    <template v-if="detailRow">
      <el-descriptions :column="2" border size="small" class="detail-desc">
        <el-descriptions-item label="订单号" :span="2">{{ detailRow.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ detailRow.userNickname || '—' }}（{{ detailRow.userPhone || '—' }}）
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detailRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ displayOrderStatus(detailRow) }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">{{ payStatusLabel[detailRow.payStatus] }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detailRow.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailRow.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ detailRow.receiverAddress }}</el-descriptions-item>
      </el-descriptions>

      <h4 class="section-title">商品明细</h4>
      <el-table :data="detailRow.items" size="small" border>
        <el-table-column prop="productName" label="商品" min-width="140" />
        <el-table-column label="单价" width="90">
          <template #default="{ row }">{{ formatAmount(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="70" />
        <el-table-column label="小计" width="90">
          <template #default="{ row }">{{ formatAmount(row.unitPrice * row.quantity) }}</template>
        </el-table-column>
      </el-table>

      <p class="total-line">订单合计：<strong>{{ formatAmount(detailRow.totalAmount) }}</strong></p>

      <template v-if="detailRow.returnRequest">
        <h4 class="section-title">退货申请</h4>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="状态">
            {{ returnStatusLabel[detailRow.returnRequest.status] }}
          </el-descriptions-item>
          <el-descriptions-item label="原因">{{ detailRow.returnRequest.reason }}</el-descriptions-item>
          <el-descriptions-item v-if="detailRow.returnRequest.adminRemark" label="审核说明">
            {{ detailRow.returnRequest.adminRemark }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
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

.detail-desc {
  margin-bottom: 16px;
}

.section-title {
  margin: 16px 0 8px;
  font-size: 14px;
  color: #303133;
}

.total-line {
  margin: 12px 0 0;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.total-line strong {
  font-size: 18px;
  color: #c45c26;
}
</style>
