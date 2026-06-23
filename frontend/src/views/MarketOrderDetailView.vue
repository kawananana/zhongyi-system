<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarketPageShell from '@/components/market/MarketPageShell.vue'
import { applyOrderReturn } from '@/api/order'
import { useOrderStore, orderStatusLabel, returnStatusLabel } from '@/store/order'
import MarketProductImage from '@/components/market/MarketProductImage.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const loading = ref(false)
const returnReason = ref('')
const returnSubmitting = ref(false)
const returnDialogVisible = ref(false)

const order = computed(() =>
  orderStore.orders.find((o) => o.id === String(route.params.id)),
)

const canApplyReturn = computed(() => {
  const o = order.value
  if (!o) return false
  if (o.payStatus !== 1 || o.orderStatus === 3) return false
  if (!o.returnRequest) return true
  return o.returnRequest.status === 2
})

onMounted(async () => {
  const id = String(route.params.id)
  loading.value = true
  try {
    await orderStore.fetchOrderById(id)
  } finally {
    loading.value = false
  }
})

function formatPrice(n: number) {
  return n.toFixed(2)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function returnTagType(status: 0 | 1 | 2) {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

async function submitReturn() {
  if (!order.value) return
  const reason = returnReason.value.trim()
  if (!reason) {
    ElMessage.warning('请填写退货原因')
    return
  }
  returnSubmitting.value = true
  try {
    const result = await applyOrderReturn(Number(order.value.id), reason)
    orderStore.patchOrder({
      ...order.value,
      returnRequest: {
        id: result.id,
        status: result.status,
        reason: result.reason,
        adminRemark: result.adminRemark,
        createTime: result.createTime,
        auditTime: result.auditTime,
      },
    })
    returnDialogVisible.value = false
    returnReason.value = ''
    ElMessage.success('退货申请已提交')
  } finally {
    returnSubmitting.value = false
  }
}

function openReturnDialog() {
  returnReason.value = ''
  returnDialogVisible.value = true
}
</script>

<template>
  <MarketPageShell>
    <div v-loading="loading">
      <div v-if="order" class="panel-card">
        <header class="panel-head">
          <button type="button" class="back-btn" @click="router.push('/market/orders')">
            <el-icon><ArrowLeft /></el-icon>
            返回订单列表
          </button>
          <em class="status">{{ orderStatusLabel(order.orderStatus) }}</em>
        </header>

        <section class="order-meta-block">
          <p class="label">订单编号</p>
          <p class="value">{{ order.orderNo }}</p>
          <p class="label">下单时间</p>
          <p class="value">{{ formatTime(order.createTime) }}</p>
        </section>

        <section class="ship-section">
          <h2>收货信息</h2>
          <div class="ship-grid">
            <p><span>收货人</span>{{ order.receiverName || '—' }}</p>
            <p><span>手机号</span>{{ order.receiverPhone || '—' }}</p>
            <p class="ship-addr"><span>收货地址</span>{{ order.receiverAddress || '—' }}</p>
          </div>
        </section>

        <section class="items-section">
          <h2>商品明细</h2>
          <ul class="item-list">
            <li v-for="item in order.items" :key="item.productId" class="item-line">
              <RouterLink :to="`/market/products/${item.productId}`" class="line-thumb">
                <div class="thumb-inner">
                  <MarketProductImage
                    :product-id="item.productId"
                    :product-name="item.productName"
                    :category="item.category"
                    :alt="item.productName"
                    fit="cover"
                  />
                </div>
              </RouterLink>
              <div class="line-info">
                <RouterLink :to="`/market/products/${item.productId}`" class="line-name">
                  {{ item.productName }}
                </RouterLink>
                <p class="line-sub">¥{{ formatPrice(item.unitPrice) }} × {{ item.quantity }}</p>
              </div>
              <p class="line-total">¥{{ formatPrice(item.unitPrice * item.quantity) }}</p>
            </li>
          </ul>
        </section>

        <section v-if="order.returnRequest" class="return-section">
          <h2>退货申请</h2>
          <div class="return-card">
            <el-tag :type="returnTagType(order.returnRequest.status)" size="small">
              {{ returnStatusLabel(order.returnRequest.status) }}
            </el-tag>
            <p><strong>申请原因：</strong>{{ order.returnRequest.reason }}</p>
            <p v-if="order.returnRequest.adminRemark">
              <strong>审核说明：</strong>{{ order.returnRequest.adminRemark }}
            </p>
            <p class="return-time">申请时间：{{ formatTime(order.returnRequest.createTime) }}</p>
          </div>
        </section>

        <footer class="panel-footer">
          <div class="footer-left">
            <el-button
              v-if="canApplyReturn"
              type="warning"
              plain
              @click="openReturnDialog"
            >
              申请退货
            </el-button>
          </div>
          <div class="footer-right">
            <span>订单金额</span>
            <strong class="total-price">¥{{ formatPrice(order.totalAmount) }}</strong>
          </div>
        </footer>
      </div>

      <div v-else-if="!loading" class="panel-card empty-wrap">
        <el-empty description="订单不存在或已删除">
          <el-button type="primary" @click="router.push('/market/orders')">返回订单列表</el-button>
        </el-empty>
      </div>
    </div>

    <el-dialog v-model="returnDialogVisible" title="申请退货" width="480px">
      <el-input
        v-model="returnReason"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        placeholder="请说明退货原因，如：商品不符、质量问题等"
      />
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="returnSubmitting" @click="submitReturn">提交申请</el-button>
      </template>
    </el-dialog>
  </MarketPageShell>
</template>

<style scoped>
.panel-card {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  overflow: hidden;
}

.empty-wrap {
  padding: 48px 24px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0ebe3;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  font-size: 14px;
  color: #1a5f3f;
  cursor: pointer;
  padding: 0;
}

.status {
  font-style: normal;
  font-size: 13px;
  color: #1a5f3f;
  background: #f0f9f4;
  padding: 4px 10px;
  border-radius: 4px;
}

.order-meta-block {
  padding: 20px 24px;
  border-bottom: 1px solid #f5f0e8;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
}

.ship-section,
.items-section,
.return-section {
  padding: 20px 24px;
  border-bottom: 1px solid #f5f0e8;
}

.ship-section h2,
.items-section h2,
.return-section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #3d3028;
}

.ship-grid p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #3d3028;
}

.ship-grid span {
  display: inline-block;
  width: 72px;
  color: #909399;
}

.ship-addr {
  line-height: 1.5;
}

.return-card {
  background: #faf8f4;
  border: 1px solid #f0ebe3;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #3d3028;
}

.return-card p {
  margin: 0;
}

.return-time {
  font-size: 12px;
  color: #909399;
}

.label {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.value {
  margin: 0;
  font-size: 15px;
  color: #3d3028;
  font-weight: 500;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item-line {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f5f0e8;
}

.item-line:last-child {
  border-bottom: none;
}

.line-thumb {
  text-decoration: none;
  flex-shrink: 0;
}

.thumb-inner {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bc-border, #e8e0d4);
}

.line-info {
  flex: 1;
  min-width: 0;
}

.line-name {
  display: block;
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #3d3028;
  text-decoration: none;
}

.line-sub {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.line-total {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #c45c26;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid #f0ebe3;
}

.footer-right {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 15px;
  color: #5c5046;
}

.total-price {
  font-size: 26px;
  color: #c45c26;
}
</style>
