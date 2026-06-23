import { request } from '@/utils/request'

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ContentRank {
  id: number
  title: string
  viewCount: number
  extraCount?: number
}

export interface DashboardOverview {
  content: {
    herbCount: number
    articleCount: number
    courseCount: number
    recipeCount: number
    productCount: number
    forumPostCount: number
    forumPendingAudit: number
    acupointCount: number
    herbViews: number
    herbCollects: number
    articleViews: number
    courseViews: number
    recipeViews: number
    productSales: number
  }
  userBehavior: {
    totalUsers: number
    newUsers: number
    activeUsers: number
    lowFreqUsers: number
  }
  moduleMetrics: { module: string; viewCount: number; itemCount: number }[]
  learning: {
    quizCount: number
    favoriteCount: number
    favoriteUsers: number
  }
  topHerbs: ContentRank[]
  topArticles: ContentRank[]
  topCourses: ContentRank[]
  topRecipes: ContentRank[]
  topProducts: ContentRank[]
  wikiByCategory: { category: string; label: string; count: number }[]
  courseByCategory: { category: string; label: string; count: number }[]
  productByCategory: { category: string; label: string; count: number }[]
}

export interface UserAdmin {
  id: number
  nickname: string
  phone: string
  status: number
  favoriteCount: number
  lastLoginTime?: string
  createTime: string
}

export interface ProductAdmin {
  id: number
  productName: string
  herbId?: number
  category: string
  categoryLabel?: string
  price: number
  stock: number
  coverImage?: string
  detail?: string
  salesCount?: number
  status: number
  createTime?: string
  updateTime?: string
}

export function fetchAdminProducts(params: {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  status?: number
}) {
  return request<PageResult<ProductAdmin>>({ url: '/admin/products', method: 'get', params })
}

export function fetchAdminProductDetail(id: number) {
  return request<ProductAdmin>({ url: `/admin/products/${id}`, method: 'get' })
}

export function updateAdminProduct(id: number, data: {
  productName: string
  category: string
  price: number
  stock: number
  coverImage?: string
  detail?: string
}) {
  return request<ProductAdmin>({ url: `/admin/products/${id}`, method: 'put', data })
}

export function updateAdminProductStatus(id: number, status: number) {
  return request<void>({ url: `/admin/products/${id}/status`, method: 'put', params: { status } })
}

export interface HerbAdmin {
  id: number
  herbName: string
  alias?: string
  originProvinceName?: string
  daoDiRegion?: string
  isDaoDi?: number
  nature?: string
  taste?: string
  meridian?: string
  propertyDesc?: string
  efficacy?: string
  clinicalUsage?: string
  coverImage?: string
  viewCount?: number
  collectCount?: number
  status: number
  createTime?: string
  updateTime?: string
}

export function fetchAdminHerbs(params: {
  page?: number
  pageSize?: number
  keyword?: string
  nature?: string
  status?: number
}) {
  return request<PageResult<HerbAdmin>>({ url: '/admin/herbs', method: 'get', params })
}

export function updateAdminHerb(id: number, data: {
  herbName: string
  alias?: string
  originProvinceName?: string
  daoDiRegion?: string
  isDaoDi?: number
  nature?: string
  taste?: string
  meridian?: string
  propertyDesc?: string
  efficacy?: string
  clinicalUsage?: string
  coverImage?: string
}) {
  return request<HerbAdmin>({ url: `/admin/herbs/${id}`, method: 'put', data })
}

export function updateAdminHerbStatus(id: number, status: number) {
  return request<void>({ url: `/admin/herbs/${id}/status`, method: 'put', params: { status } })
}

export function deleteAdminHerb(id: number) {
  return request<void>({ url: `/admin/herbs/${id}`, method: 'delete' })
}

export function fetchDashboardOverview() {
  return request<DashboardOverview>({ url: '/admin/dashboard/overview', method: 'get' })
}

export function fetchAdminUsers(params: Record<string, unknown>) {
  return request<PageResult<UserAdmin>>({ url: '/admin/users', method: 'get', params })
}

export function updateUserStatus(id: number, status: number) {
  return request<void>({ url: `/admin/users/${id}/status`, method: 'put', params: { status } })
}

export interface ForumPostAdmin {
  id: number
  userId: number
  authorNickname?: string
  authorPhone?: string
  title: string
  content: string
  category?: string
  refType?: string
  refId?: number
  refHerbName?: string
  likeCount?: number
  commentCount?: number
  auditStatus: number
  status: number
  createTime?: string
}

export function fetchAdminForumPosts(params: {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  auditStatus?: number
  status?: number
}) {
  return request<PageResult<ForumPostAdmin>>({ url: '/admin/forum/posts', method: 'get', params })
}

export function updateForumAuditStatus(id: number, auditStatus: number) {
  return request<void>({ url: `/admin/forum/posts/${id}/audit`, method: 'put', params: { auditStatus } })
}

export function updateForumPostStatus(id: number, status: number) {
  return request<void>({ url: `/admin/forum/posts/${id}/status`, method: 'put', params: { status } })
}

export function deleteForumPost(id: number) {
  return request<void>({ url: `/admin/forum/posts/${id}`, method: 'delete' })
}

export interface ShopOrderAdmin {
  id: number
  orderNo: string
  userId: number
  userNickname?: string
  userPhone?: string
  items: {
    productId: number
    productName: string
    category?: string
    unitPrice: number
    quantity: number
  }[]
  totalAmount: number
  orderStatus: number
  payStatus: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  returnRequest?: {
    id: number
    status: number
    reason: string
    adminRemark?: string
    createTime: string
    auditTime?: string
  }
  createTime: string
  payTime?: string
}

export function fetchAdminOrders(params: {
  page?: number
  pageSize?: number
  keyword?: string
  orderStatus?: number
  payStatus?: number
}) {
  return request<PageResult<ShopOrderAdmin>>({ url: '/admin/orders', method: 'get', params })
}

export function fetchAdminOrderDetail(id: number) {
  return request<ShopOrderAdmin>({ url: `/admin/orders/${id}`, method: 'get' })
}

export function updateAdminOrderStatus(
  id: number,
  params: { orderStatus?: number; payStatus?: number },
) {
  return request<ShopOrderAdmin>({
    url: `/admin/orders/${id}/status`,
    method: 'put',
    params,
  })
}

export interface OrderReturnAdmin {
  id: number
  orderId: number
  orderNo: string
  userId: number
  userNickname: string
  userPhone: string
  totalAmount: number
  orderStatus: number
  payStatus: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  reason: string
  status: number
  adminRemark?: string
  createTime: string
  auditTime?: string
}

export function fetchAdminOrderReturns(params: {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}) {
  return request<PageResult<OrderReturnAdmin>>({ url: '/admin/order-returns', method: 'get', params })
}

export function approveOrderReturn(id: number, adminRemark?: string) {
  return request<void>({
    url: `/admin/order-returns/${id}/approve`,
    method: 'put',
    params: adminRemark ? { adminRemark } : undefined,
  })
}

export function rejectOrderReturn(id: number, adminRemark: string) {
  return request<void>({
    url: `/admin/order-returns/${id}/reject`,
    method: 'put',
    params: { adminRemark },
  })
}
