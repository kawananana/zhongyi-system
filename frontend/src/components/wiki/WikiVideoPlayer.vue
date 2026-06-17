<script setup lang="ts">
import { ref } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { bilibiliEmbedUrl, videoPlayUrl, type WikiVideoItem } from '@/utils/wikiMedia'

const props = defineProps<{
  video: WikiVideoItem
}>()

const playing = ref(false)

const embedUrl = bilibiliEmbedUrl(props.video)
const externalUrl = videoPlayUrl(props.video)
const poster = props.video.poster

function startPlay() {
  if (props.video.type === 'mp4' && props.video.url) {
    playing.value = true
    return
  }
  if (embedUrl) {
    playing.value = true
    return
  }
  if (externalUrl) {
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }
}

function openExternal() {
  if (externalUrl) {
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div class="wiki-video-player">
    <div class="video-frame-wrap">
      <iframe
        v-if="playing && embedUrl"
        class="video-frame"
        :src="embedUrl"
        scrolling="no"
        border="0"
        frameborder="no"
        framespacing="0"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        :title="video.title"
      />
      <video
        v-else-if="playing && video.type === 'mp4' && video.url"
        class="video-native"
        :src="video.url"
        :poster="poster"
        controls
        playsinline
      />
      <button
        v-else
        type="button"
        class="video-poster-btn"
        @click="startPlay"
      >
        <img v-if="poster" :src="poster" alt="" class="poster-img" />
        <span class="play-overlay">
          <el-icon class="play-icon"><VideoPlay /></el-icon>
          <span>点击播放</span>
        </span>
      </button>
    </div>
    <div class="video-actions">
      <button v-if="externalUrl" type="button" class="link-btn" @click="openExternal">
        在 B 站打开 ↗
      </button>
      <span v-if="!embedUrl && video.type === 'bilibili'" class="hint">
        该视频仅支持跳转 B 站观看
      </span>
    </div>
  </div>
</template>

<style scoped>
.video-frame-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background: #111;
  border-radius: 0;
  overflow: hidden;
}

.video-frame,
.video-native,
.video-poster-btn,
.poster-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-poster-btn {
  padding: 0;
  cursor: pointer;
  background: #1a1a1a;
}

.poster-img {
  object-fit: cover;
  opacity: 0.92;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 14px;
  transition: background 0.2s;
}

.video-poster-btn:hover .play-overlay {
  background: rgba(26, 95, 63, 0.45);
}

.play-icon {
  font-size: 42px;
}

.video-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 14px;
  background: #faf8f4;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 13px;
  color: #1a5f3f;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.hint {
  font-size: 12px;
  color: #909399;
}
</style>
