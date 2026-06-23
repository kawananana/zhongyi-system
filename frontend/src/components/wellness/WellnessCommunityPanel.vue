<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatDotRound, Pointer, Star, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchForumPosts, shareHerbToForum, createForumPost, type ForumPostItem } from '@/api/forum'
import { useUserStore } from '@/store'
import { requireUserLogin } from '@/utils/requireLogin'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

type PostCategory = 'all' | 'question' | 'share'

interface CommunityPost {
  id: number
  category: 'question' | 'share'
  author: string
  avatar: string
  title: string
  excerpt: string
  tags: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  timeAgo: string
  refType?: string
  refId?: number
  refHerbName?: string
}

const activeCategory = ref<PostCategory>('all')
const keyword = ref('')
const loading = ref(false)
const page = ref(1)
const total = ref(0)

const showCompose = ref(false)
const composeHerbId = ref<number | null>(null)
const composeHerbName = ref('')
const composeTitle = ref('')
const composeCategory = ref<'question' | 'share'>('question')
const composeContent = ref('')
const publishing = ref(false)

const categoryChips: { key: PostCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'question', label: '提问互助' },
  { key: 'share', label: '学习心得' },
]

const posts = ref<CommunityPost[]>([])

const filteredPosts = computed(() => posts.value)

const composeTitlePreview = computed(() =>
  composeHerbId.value ? `分享药材 · ${composeHerbName.value}` : composeTitle.value,
)

function formatTimeAgo(iso?: string): string {
  if (!iso) return '刚刚'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diff = Date.now() - t
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day} 天前`
  return iso.slice(0, 10)
}

function mapPost(item: ForumPostItem): CommunityPost {
  const category = item.category === 'share' ? 'share' : 'question'
  const tags: string[] = []
  if (item.refType === 'herb' && item.refHerbName) {
    tags.push(item.refHerbName)
  }
  if (category === 'share') tags.push('药材分享')
  const excerpt =
    item.content.length > 160 ? `${item.content.slice(0, 160)}…` : item.content
  return {
    id: item.id,
    category,
    author: item.authorNickname || '本草学员',
    avatar: (item.authorNickname || '本').slice(0, 1),
    title: item.title,
    excerpt,
    tags,
    likeCount: item.likeCount ?? 0,
    commentCount: item.commentCount ?? 0,
    viewCount: 0,
    timeAgo: formatTimeAgo(item.createTime),
    refType: item.refType,
    refId: item.refId,
    refHerbName: item.refHerbName,
  }
}

function defaultHerbDraft(name: string): string {
  return `正在学习「${name}」这味药材，和大家分享一些心得：\n\n`
}

function openHerbCompose(herbId: number, herbName: string) {
  if (!requireUserLogin(router, '登录后可发帖')) return
  composeHerbId.value = herbId
  composeHerbName.value = herbName
  composeTitle.value = ''
  composeCategory.value = 'share'
  composeContent.value = defaultHerbDraft(herbName)
  showCompose.value = true
  activeCategory.value = 'share'
}

function syncComposeFromRoute() {
  if (route.query.compose !== 'herb') return
  const herbId = Number(route.query.herbId)
  const herbName = String(route.query.herbName || '').trim()
  if (!herbId || !herbName) return
  openHerbCompose(herbId, herbName)
}

function clearComposeQuery() {
  router.replace({
    path: '/wellness',
    query: { tab: 'community' },
  })
}

function closeCompose() {
  showCompose.value = false
  composeHerbId.value = null
  composeHerbName.value = ''
  composeTitle.value = ''
  composeCategory.value = 'question'
  composeContent.value = ''
  if (route.query.compose === 'herb') {
    clearComposeQuery()
  }
}

async function loadPosts() {
  loading.value = true
  try {
    const data = await fetchForumPosts({
      page: page.value,
      pageSize: 20,
      category: activeCategory.value === 'all' ? undefined : activeCategory.value,
      keyword: keyword.value.trim() || undefined,
    })
    posts.value = (data.list ?? []).map(mapPost)
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

function onCompose() {
  if (!requireUserLogin(router, '登录后可发帖')) return
  showCompose.value = true
  composeHerbId.value = null
  composeHerbName.value = ''
  composeTitle.value = ''
  composeCategory.value = activeCategory.value === 'share' ? 'share' : 'question'
  composeContent.value = ''
}

async function onPublish() {
  if (!requireUserLogin(router, '登录后可发帖')) return
  const content = composeContent.value.trim()
  if (!content) {
    ElMessage.warning('请填写帖子内容')
    return
  }
  publishing.value = true
  try {
    if (composeHerbId.value) {
      await shareHerbToForum(composeHerbId.value, content)
      ElMessage.success('药材分享已发布到社区')
    } else {
      const title = composeTitle.value.trim()
      if (!title) {
        ElMessage.warning('请填写帖子标题')
        return
      }
      await createForumPost({
        title,
        content,
        category: composeCategory.value,
      })
      ElMessage.success('帖子已发布到社区')
    }
    closeCompose()
    page.value = 1
    await loadPosts()
  } finally {
    publishing.value = false
  }
}

function onInteract(action: string) {
  if (!requireUserLogin(router, '登录后可互动')) return
  ElMessage.info(`${action}功能即将上线`)
}

function goHerb(post: CommunityPost) {
  if (post.refType === 'herb' && post.refId) {
    router.push(`/atlas/herbs/${post.refId}`)
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadPosts()
  }, 400)
})

watch(activeCategory, () => {
  page.value = 1
  loadPosts()
})

watch(
  () => [route.query.compose, route.query.herbId, route.query.herbName],
  () => syncComposeFromRoute(),
)

onMounted(() => {
  loadPosts()
  syncComposeFromRoute()
})
</script>

<template>
  <div class="community-panel">
    <p v-if="!userStore.isLoggedIn()" class="guest-tip">
      游客可浏览社区帖子；登录后可发帖、点赞与评论
    </p>
    <div class="toolbar">
      <el-input
        v-model="keyword"
        class="search-input"
        placeholder="搜索帖子、话题…"
        clearable
        :prefix-icon="ChatDotRound"
      />
      <el-button type="primary" @click="onCompose">
        {{ userStore.isLoggedIn() ? '发表帖子' : '登录后发帖' }}
      </el-button>
    </div>

    <div class="category-bar">
      <button
        v-for="chip in categoryChips"
        :key="chip.key"
        type="button"
        class="cat-chip"
        :class="{ active: activeCategory === chip.key }"
        @click="activeCategory = chip.key"
      >
        {{ chip.label }}
      </button>
    </div>

    <section v-if="showCompose" class="compose-card">
      <div class="compose-head">
        <h3>{{ composeHerbId ? '分享药材到社区' : '写帖子' }}</h3>
        <button type="button" class="compose-close" @click="closeCompose">取消</button>
      </div>

      <div v-if="composeHerbId" class="herb-ref">
        <span class="herb-ref-label">关联药材</span>
        <button type="button" class="herb-ref-link" @click="router.push(`/atlas/herbs/${composeHerbId}`)">
          {{ composeHerbName }}
        </button>
      </div>

      <el-input
        v-if="composeHerbId"
        :model-value="composeTitlePreview"
        readonly
        class="compose-title"
        placeholder="标题"
      />
      <template v-else>
        <el-radio-group v-model="composeCategory" class="compose-category">
          <el-radio value="question">提问互助</el-radio>
          <el-radio value="share">学习心得</el-radio>
        </el-radio-group>
        <el-input
          v-model="composeTitle"
          class="compose-title"
          placeholder="帖子标题"
          maxlength="200"
          show-word-limit
        />
      </template>

      <el-input
        v-model="composeContent"
        type="textarea"
        :rows="8"
        placeholder="写下你的学习心得、用法体会或疑问…"
        maxlength="2000"
        show-word-limit
      />

      <div class="compose-actions">
        <el-button @click="closeCompose">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="onPublish">
          发布帖子
        </el-button>
      </div>
    </section>

    <p v-else class="community-tip">
      发帖后即时展示在社区；违规内容管理员可在后台隐藏或删除。
    </p>

    <div v-loading="loading" class="post-list">
      <el-empty v-if="!loading && filteredPosts.length === 0" description="暂无相关帖子" />
      <article v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-head">
          <span class="avatar">{{ post.avatar }}</span>
          <div class="author-meta">
            <span class="author">{{ post.author }}</span>
            <span class="time">{{ post.timeAgo }}</span>
          </div>
          <el-tag
            size="small"
            :type="post.category === 'question' ? 'warning' : 'success'"
            effect="light"
          >
            {{ post.category === 'question' ? '提问' : '心得' }}
          </el-tag>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        <div class="post-tags">
          <button
            v-if="post.refType === 'herb' && post.refId"
            type="button"
            class="tag tag-link"
            @click="goHerb(post)"
          >
            #{{ post.refHerbName || '查看药材' }}
          </button>
          <span v-for="tag in post.tags.filter((t) => t !== post.refHerbName)" :key="tag" class="tag">
            #{{ tag }}
          </span>
        </div>
        <div class="post-foot">
          <span class="foot-item"><el-icon><View /></el-icon> {{ post.viewCount }}</span>
          <button type="button" class="foot-btn" @click="onInteract('评论')">
            <el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}
          </button>
          <button type="button" class="foot-btn" @click="onInteract('点赞')">
            <el-icon><Pointer /></el-icon> {{ post.likeCount }}
          </button>
          <button type="button" class="foot-btn" @click="onInteract('收藏')">
            <el-icon><Star /></el-icon> 收藏
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.community-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guest-tip {
  margin: 0;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--bc-text-secondary);
  background: var(--bc-primary-soft);
  border: 1px solid var(--bc-primary-light);
  border-radius: var(--bc-radius);
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  padding: 8px 18px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  background: #fff;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-chip:hover,
.cat-chip.active {
  border-color: #1a5f3f;
  color: #1a5f3f;
  background: #e8f5ee;
}

.compose-card {
  background: #fff;
  border: 2px solid #1a5f3f;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 6px 20px rgba(26, 95, 63, 0.1);
}

.compose-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.compose-head h3 {
  margin: 0;
  font-size: 18px;
  color: #1a5f3f;
}

.compose-close {
  border: none;
  background: none;
  color: #909399;
  cursor: pointer;
  font-size: 14px;
}

.compose-close:hover {
  color: #1a5f3f;
}

.herb-ref {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f0f9f4;
  border-radius: 8px;
}

.herb-ref-label {
  font-size: 13px;
  color: #909399;
}

.herb-ref-link {
  border: none;
  background: none;
  color: #1a5f3f;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  padding: 0;
}

.herb-ref-link:hover {
  text-decoration: underline;
}

.compose-title {
  margin-bottom: 0;
}

.compose-category {
  margin-bottom: 4px;
}

.compose-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.community-tip {
  margin: 0;
  padding: 10px 14px;
  font-size: 13px;
  color: #606266;
  background: #fffbe6;
  border: 1px solid #faecd8;
  border-radius: 8px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 120px;
}

.post-card {
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
  padding: 18px 20px;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(26, 95, 63, 0.08);
}

.post-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5ee;
  border-radius: 50%;
  font-size: 20px;
}

.author-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.post-title {
  margin: 0 0 8px;
  font-size: 17px;
  color: #1a5f3f;
}

.post-excerpt {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  font-size: 12px;
  color: #1a5f3f;
  background: #f0f9f4;
  padding: 2px 10px;
  border-radius: 10px;
}

.tag-link {
  border: none;
  cursor: pointer;
}

.tag-link:hover {
  background: #d9f0e3;
}

.post-foot {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #909399;
  border-top: 1px solid #f0ebe3;
  padding-top: 12px;
}

.foot-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #909399;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.foot-btn:hover {
  color: #1a5f3f;
}
</style>
