<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarketPageShell from '@/components/market/MarketPageShell.vue'
import MarketProductImage from '@/components/market/MarketProductImage.vue'
import { useCartStore } from '@/store/cart'
import { useOrderStore } from '@/store/order'
import { useUserStore } from '@/store/user'
import { requireUserLogin } from '@/utils/requireLogin'
import { productCategoryLabel } from '@/utils/productDisplay'
import {
  buildFullAddress,
  CHINA_PROVINCES,
  clearCheckoutLines,
  emptyShippingAddress,
  loadCheckoutLines,
  loadShippingAddress,
  saveShippingAddress,
  type ShippingAddress,
} from '@/utils/checkoutStorage'

const router = useRouter()
const orderStore = useOrderStore()
const cart = useCartStore()
const userStore = useUserStore()

const lines = ref(loadCheckoutLines())
const submitting = ref(false)
const saveAddress = ref(true)
const address = ref<ShippingAddress>(emptyShippingAddress())

const totalAmount = computed(() =>
  lines.value.reduce((sum, line) => sum + line.price * line.quantity, 0),
)

const totalCount = computed(() =>
  lines.value.reduce((sum, line) => sum + line.quantity, 0),
)

function formatPrice(n: number) {
  return n.toFixed(2)
}

function lineTag(line: { tag?: string; category: string }) {
  return line.tag || productCategoryLabel(line.category)
}

function initAddress() {
  const saved = loadShippingAddress()
  if (saved) {
    address.value = { ...saved }
    return
  }
  const brief = userStore.userBrief
  if (brief?.nickname) {
    address.value.receiverName = brief.nickname
  }
}

function validateAddress() {
  const a = address.value
  if (!a.receiverName.trim()) {
    ElMessage.warning('请填写收货人姓名')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(a.receiverPhone.trim())) {
    ElMessage.warning('请填写正确的11位手机号')
    return false
  }
  if (!a.province) {
    ElMessage.warning('请选择省份')
    return false
  }
  if (!a.city.trim()) {
    ElMessage.warning('请填写城市')
    return false
  }
  if (!a.district.trim()) {
    ElMessage.warning('请填写区/县')
    return false
  }
  if (!a.detail.trim()) {
    ElMessage.warning('请填写详细地址')
    return false
  }
  return true
}

async function submitOrder() {
  if (!requireUserLogin(router, '登录后可提交订单')) return
  if (!lines.value.length) {
    ElMessage.warning('没有待结算商品')
    router.push('/market/cart')
    return
  }
  if (!validateAddress()) return

  submitting.value = true
  try {
    if (saveAddress.value) {
      saveShippingAddress({ ...address.value })
    }
    const order = await orderStore.createFromCart(lines.value, {
      receiverName: address.value.receiverName.trim(),
      receiverPhone: address.value.receiverPhone.trim(),
      receiverAddr: buildFullAddress(address.value),
    })
    if (!order) return
    for (const line of lines.value) {
      cart.removeProduct(line.productId)
    }
    clearCheckoutLines()
    ElMessage.success(`订单 ${order.orderNo} 已提交`)
    router.push('/market/orders')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!requireUserLogin(router, '登录后可结算下单', '/market/checkout')) return
  if (!lines.value.length) {
    ElMessage.warning('请先选择要结算的商品')
    router.replace('/market/cart')
    return
  }
  initAddress()
})
</script>

<template>
  <MarketPageShell>
    <div class="checkout-page">
      <header class="page-head">
        <button type="button" class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <h1>确认订单</h1>
        <p>请填写收货信息，核对商品后提交</p>
      </header>

      <div class="checkout-grid">
        <section class="panel address-panel">
          <h2>收货信息</h2>
          <el-form label-width="88px" class="address-form">
            <el-form-item label="收货人" required>
              <el-input v-model="address.receiverName" placeholder="真实姓名" maxlength="32" />
            </el-form-item>
            <el-form-item label="手机号" required>
              <el-input v-model="address.receiverPhone" placeholder="11位手机号" maxlength="11" />
            </el-form-item>
            <el-form-item label="所在地区" required>
              <div class="region-row">
                <el-select v-model="address.province" placeholder="省" filterable class="region-province">
                  <el-option v-for="p in CHINA_PROVINCES" :key="p" :label="p" :value="p" />
                </el-select>
                <el-input v-model="address.city" placeholder="市" maxlength="32" />
                <el-input v-model="address.district" placeholder="区/县" maxlength="32" />
              </div>
            </el-form-item>
            <el-form-item label="详细地址" required>
              <el-input
                v-model="address.detail"
                type="textarea"
                :rows="3"
                placeholder="街道、门牌号、小区楼栋等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="saveAddress">保存为默认收货地址</el-checkbox>
            </el-form-item>
          </el-form>
        </section>

        <aside class="panel summary-panel">
          <h2>商品清单</h2>
          <ul class="goods-list">
            <li v-for="line in lines" :key="line.productId" class="goods-line">
              <div class="thumb">
                <MarketProductImage
                  :product-id="line.productId"
                  :product-name="line.productName"
                  :category="line.category || 'food_medicine'"
                  :cover-image="line.coverImage"
                  :alt="line.productName"
                  fit="cover"
                />
              </div>
              <div class="goods-info">
                <p class="goods-name">{{ line.productName }}</p>
                <p class="goods-meta">
                  <span>{{ lineTag(line) }}</span>
                  <span>× {{ line.quantity }}</span>
                </p>
                <p class="goods-price">¥{{ formatPrice(line.price) }}</p>
              </div>
            </li>
          </ul>

          <div class="summary-foot">
            <div class="summary-row">
              <span>共 {{ totalCount }} 件</span>
              <span>
                合计：
                <strong>¥ {{ formatPrice(totalAmount) }}</strong>
              </span>
            </div>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="submitting"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </aside>
      </div>
    </div>
  </MarketPageShell>
</template>

<style scoped>
.checkout-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  padding: 20px 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #1a5f3f;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  font-size: 14px;
}

.page-head h1 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #3d3028;
}

.page-head p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}

.panel {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  padding: 20px 24px;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #3d3028;
}

.region-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  width: 100%;
}

.region-province {
  min-width: 0;
}

.goods-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-line {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f0e8;
}

.goods-line:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e0d4;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #3d3028;
}

.goods-meta {
  margin: 0 0 4px;
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.goods-price {
  margin: 0;
  font-size: 14px;
  color: #c45c26;
  font-weight: 600;
}

.summary-foot {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0ebe3;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
  font-size: 14px;
  color: #5c5046;
}

.summary-row strong {
  font-size: 22px;
  color: #c45c26;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  --el-button-bg-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
}

@media (max-width: 900px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .region-row {
    grid-template-columns: 1fr;
  }
}
</style>
