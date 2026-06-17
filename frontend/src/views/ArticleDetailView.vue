<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Link, Picture, VideoPlay } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchArticleDetail, type ArticleItem } from '@/api/article'
import { categoryLabel } from '@/utils/wikiCategories'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'
import { resolveArticleCover } from '@/utils/articleCover'
import WikiVideoPlayer from '@/components/wiki/WikiVideoPlayer.vue'
import { parseGalleryJson, parseVideosJson } from '@/utils/wikiMedia'
import { resolveSourceUrl } from '@/utils/wikiSource'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const article = ref<ArticleItem | null>(null)

const kindLabel = computed(() =>
  article.value?.contentKind === 'course' ? '课程' : '文章',
)

const gallery = computed(() => parseGalleryJson(article.value?.galleryJson))
const videos = computed(() => parseVideosJson(article.value?.videosJson))
const sourceHref = computed(() =>
  resolveSourceUrl(article.value?.sourceName, article.value?.sourceUrl),
)

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    article.value = await fetchArticleDetail(id)
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/atlas/articles')
}
</script>

<template>
  <div class="wiki-detail-page">
    <HomeHeader />
    <main class="detail-main" v-loading="loading">
      <template v-if="article">
        <button type="button" class="back-link" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回百科
        </button>

        <article class="detail-card">
          <div v-if="article" class="cover-wrap">
            <el-image class="cover" :src="resolveArticleCover(article)" fit="cover">
              <template #error>
                <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
              </template>
            </el-image>
          </div>

          <div class="detail-inner">
            <div class="meta">
              <span class="tag tag-kind">{{ kindLabel }}</span>
              <span class="tag tag-cat">{{ categoryLabel(article.category || '') }}</span>
              <span v-if="gallery.length" class="tag tag-media">
                <el-icon><Picture /></el-icon>
                {{ gallery.length }} 图
              </span>
              <span v-if="article.contentKind === 'course' && videos.length" class="tag tag-media">
                <el-icon><VideoPlay /></el-icon>
                {{ videos.length }} 视频
              </span>
              <span class="views">{{ article.viewCount ?? 0 }} 阅读</span>
            </div>
            <h1>{{ article.title }}</h1>
            <p class="author-line">
              <span class="author">{{ article.author || '本草萌智编辑部' }}</span>
            </p>

            <section v-if="article.contentKind === 'course' && videos.length" class="media-section">
              <h2 class="section-title">
                <el-icon><VideoPlay /></el-icon>
                配套视频
              </h2>
              <div class="video-list">
                <div v-for="(video, idx) in videos" :key="idx" class="video-card">
                  <p class="video-title">{{ video.title }}</p>
                  <WikiVideoPlayer :video="video" />
                </div>
              </div>
              <p class="media-note">视频来源为公开科普教学资源，仅供学习参考。</p>
            </section>

            <div class="body">{{ article.content }}</div>

            <section v-if="gallery.length" class="media-section">
              <h2 class="section-title">
                <el-icon><Picture /></el-icon>
                配图说明
              </h2>
              <div class="gallery-grid">
                <figure v-for="(img, idx) in gallery" :key="idx" class="gallery-item">
                  <el-image :src="img.url" fit="cover" class="gallery-img" :preview-src-list="gallery.map((g) => g.url)">
                    <template #error>
                      <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="gallery-error" />
                    </template>
                  </el-image>
                  <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
                </figure>
              </div>
              <p v-if="gallery.some((g) => g.url?.includes('/photos/source/'))" class="media-note">
                配图均来自文末「参考资料」原文，无则不放图。
              </p>
            </section>

            <footer v-if="article.sourceName || sourceHref" class="source-footer">
              <a
                v-if="sourceHref"
                :href="sourceHref"
                target="_blank"
                rel="noopener noreferrer"
                class="source-link"
                :title="`查看原文：${article.sourceName || sourceHref}`"
              >
                <span class="source-label">参考资料</span>
                <span class="source-name">{{ article.sourceName || '查看原文' }}</span>
                <el-icon class="source-icon"><Link /></el-icon>
              </a>
              <span v-else class="source-text">
                <span class="source-label">参考资料</span>
                {{ article.sourceName }}
              </span>
            </footer>
          </div>
        </article>
      </template>
    </main>
  </div>
</template>

<style scoped>
.wiki-detail-page {
  min-height: 100vh;
  background: #f7f3eb;
}

.detail-main {
  max-width: 820px;
  margin: 0 auto;
  padding: 20px 24px 56px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: #fff;
  color: #1a5f3f;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #ebe6dc;
  transition: background 0.2s, box-shadow 0.2s;
}

.back-link:hover {
  background: #f0f7f2;
  box-shadow: 0 2px 8px rgba(26, 95, 63, 0.1);
}

.detail-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #ebe6dc;
  box-shadow: 0 8px 32px rgba(26, 95, 63, 0.08);
}

.cover-wrap {
  height: 280px;
  background: linear-gradient(145deg, #e8f5ee 0%, #f0ebe3 100%);
}

.cover,
.error-img {
  width: 100%;
  height: 280px;
}

.error-img {
  object-fit: cover;
}

.detail-inner {
  padding: 28px 32px 36px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 500;
}

.tag-kind {
  background: linear-gradient(135deg, #1a5f3f 0%, #2d8a5e 100%);
  color: #fff;
}

.tag-cat {
  background: #e8f5ee;
  color: #1a5f3f;
}

.tag-media {
  background: #f5f0e8;
  color: #8b6914;
}

.views {
  font-size: 13px;
  color: #909399;
  margin-left: auto;
}

h1 {
  margin: 0 0 12px;
  font-size: 28px;
  color: #303133;
  line-height: 1.35;
  font-weight: 700;
}

.author-line {
  margin: 0 0 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0ebe3;
}

.author {
  color: #606266;
  font-size: 14px;
}

.media-section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 18px;
  color: #1a5f3f;
  font-weight: 600;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-card {
  border: 1px solid #ebe6dc;
  border-radius: 12px;
  overflow: hidden;
  background: #faf8f4;
}

.video-title {
  margin: 0;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #f0ebe3;
}

.media-note {
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
}

.body {
  line-height: 1.9;
  color: #4a4a4a;
  font-size: 15px;
  white-space: pre-wrap;
  margin-bottom: 28px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.gallery-item {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebe6dc;
  background: #faf8f4;
}

.gallery-img,
.gallery-error {
  width: 100%;
  height: 180px;
  display: block;
}

.gallery-error {
  object-fit: cover;
}

.gallery-item figcaption {
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #606266;
}

.source-footer {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed #e0dcd4;
  font-size: 13px;
}

.source-label {
  margin-right: 8px;
  color: #909399;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.source-link:hover {
  color: #1a5f3f;
}

.source-link:hover .source-name {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.source-name {
  color: #1a5f3f;
  font-weight: 500;
}

.source-icon {
  color: #1a5f3f;
  font-size: 14px;
}

.source-text {
  color: #606266;
}

@media (max-width: 640px) {
  .detail-inner {
    padding: 20px 18px 28px;
  }

  h1 {
    font-size: 22px;
  }

  .cover-wrap,
  .cover,
  .error-img {
    height: 200px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
