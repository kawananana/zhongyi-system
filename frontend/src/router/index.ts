import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/atlas/herbs',
    name: 'HerbList',
    component: () => import('@/views/HerbListView.vue'),
    meta: { title: '本草图鉴' },
  },
  {
    path: '/atlas/herbs/:id',
    name: 'HerbDetail',
    component: () => import('@/views/HerbDetailView.vue'),
    meta: { title: '药材详情' },
  },
  {
    path: '/atlas/articles',
    name: 'ArticleList',
    component: () => import('@/views/ArticleListPageView.vue'),
    meta: { title: '本草百科' },
  },
  {
    path: '/atlas/articles/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetailView.vue'),
    meta: { title: '百科详情' },
  },
  {
    path: '/atlas/acupoint',
    name: 'Acupoint3D',
    component: () => import('@/views/Acupoint3DView.vue'),
    meta: { title: '3D针灸' },
  },
  {
    path: '/study',
    name: 'Study',
    component: () => import('@/views/StudyView.vue'),
    meta: { title: '萌智伴学' },
  },
  {
    path: '/games/:gameId',
    name: 'GamePlay',
    component: () => import('@/views/GamePlayView.vue'),
    meta: { title: '趣学闯关', requiresAuth: true },
  },
  {
    path: '/guide',
    name: 'RecipeList',
    component: () => import('@/views/RecipeListView.vue'),
    meta: { title: '药膳食疗' },
  },
  {
    path: '/guide/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetailView.vue'),
    meta: { title: '食谱详情' },
  },
  {
    path: '/constitution',
    name: 'Constitution',
    component: () => import('@/views/ConstitutionView.vue'),
    meta: { title: '体质自测' },
  },
  {
    path: '/wellness/constitution',
    redirect: '/constitution',
  },
  {
    path: '/wellness',
    name: 'Wellness',
    component: () => import('@/views/WellnessView.vue'),
    meta: { title: '智趣养生' },
  },
  {
    path: '/wellness/history',
    name: 'WellnessHistory',
    component: () => import('@/views/WellnessHistoryView.vue'),
    meta: { title: '历史打卡', requiresAuth: true },
  },
  {
    path: '/chat',
    redirect: '/wellness',
  },
  {
    path: '/market',
    name: 'Market',
    component: () => import('@/views/MarketView.vue'),
    meta: { title: '本草市集' },
  },
  {
    path: '/market/cart',
    name: 'MarketCart',
    component: () => import('@/views/MarketCartView.vue'),
    meta: { title: '购物车' },
  },
  {
    path: '/market/orders',
    name: 'MarketOrders',
    component: () => import('@/views/MarketOrdersView.vue'),
    meta: { title: '我的订单', requiresAuth: true },
  },
  {
    path: '/market/orders/:id',
    name: 'MarketOrderDetail',
    component: () => import('@/views/MarketOrderDetailView.vue'),
    meta: { title: '订单详情', requiresAuth: true },
  },
  {
    path: '/market/products/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('@/views/UserLoginView.vue'),
    meta: { title: '用户登录' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLoginView.vue'),
    meta: { title: '管理员登录' },
  },
  {
    path: '/admin',
    component: () => import('@/components/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'herbs',
        name: 'AdminHerbs',
        component: () => import('@/views/admin/HerbManageView.vue'),
        meta: { title: '图鉴管理' },
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/ProductManageView.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'forum',
        name: 'AdminForum',
        component: () => import('@/views/admin/ForumManageView.vue'),
        meta: { title: '论坛管控' },
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '数据看板' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || '本草萌智'
  document.title = `${title} · 本草萌智`
})

setupRouterGuards(router)

export default router
