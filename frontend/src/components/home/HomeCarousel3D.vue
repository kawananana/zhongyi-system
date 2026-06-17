<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { HOME_CAROUSEL_SLIDES } from '@/data/homeCarouselSlides'

const slides = HOME_CAROUSEL_SLIDES
const activeIndex = ref(0)
const isPaused = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let touchStartX = 0

const total = computed(() => slides.length)

function normalizeOffset(index: number): number {
  const n = total.value
  let offset = index - activeIndex.value
  if (offset > n / 2) offset -= n
  if (offset < -n / 2) offset += n
  return offset
}

function slideStyle(index: number) {
  const offset = normalizeOffset(index)
  const abs = Math.abs(offset)
  const rotateY = offset * -58
  const translateZ = offset === 0 ? 120 : -80 - abs * 50
  const translateX = offset * 38
  const scale = offset === 0 ? 1 : 0.72
  const opacity = abs > 1 ? 0 : offset === 0 ? 1 : 0.55
  const zIndex = 20 - abs
  const pointerEvents = abs > 1 ? 'none' : 'auto'

  return {
    transform: `translateX(${translateX}%) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
    opacity,
    zIndex,
    pointerEvents,
  } as Record<string, string | number>
}

function goTo(index: number) {
  const n = total.value
  activeIndex.value = ((index % n) + n) % n
}

function prev() {
  goTo(activeIndex.value - 1)
}

function next() {
  goTo(activeIndex.value + 1)
}

function onSlideClick(index: number) {
  if (index === activeIndex.value) return
  goTo(index)
}

function startAutoPlay() {
  stopAutoPlay()
  timer = setInterval(() => {
    if (!isPaused.value) next()
  }, 5000)
}

function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX
  if (Math.abs(dx) < 40) return
  if (dx > 0) prev()
  else next()
}

onMounted(startAutoPlay)
onUnmounted(stopAutoPlay)
</script>

<template>
  <div
    class="carousel-3d"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="carousel-stage">
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="carousel-slide"
        :class="{ active: index === activeIndex }"
        :style="slideStyle(index)"
        @click="onSlideClick(index)"
      >
        <div class="slide-frame">
          <img :src="slide.image" :alt="slide.title" class="slide-img" />
          <div class="slide-caption">
            <span class="slide-organ">{{ slide.title }}</span>
            <span class="slide-desc">{{ slide.subtitle }}</span>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="nav-btn nav-prev" aria-label="上一张" @click="prev">
      <el-icon><ArrowLeft /></el-icon>
    </button>
    <button type="button" class="nav-btn nav-next" aria-label="下一张" @click="next">
      <el-icon><ArrowRight /></el-icon>
    </button>

    <div class="carousel-dots">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        type="button"
        class="dot"
        :class="{ active: index === activeIndex }"
        :aria-label="slide.title"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  overflow: hidden;
  background: linear-gradient(180deg, #faf8f4 0%, #f0ebe2 100%);
  border-radius: 12px;
}

.carousel-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  perspective-origin: 50% 42%;
}

.carousel-slide {
  position: absolute;
  width: min(52%, 380px);
  height: 88%;
  max-height: 100%;
  transition:
    transform 0.65s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.55s ease;
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.slide-frame {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px 8px;
  box-sizing: border-box;
}

.slide-img {
  flex: 1;
  width: 100%;
  min-height: 0;
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
  box-shadow:
    0 16px 48px rgba(26, 95, 63, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
  user-select: none;
  -webkit-user-drag: none;
}

.carousel-slide.active .slide-img {
  box-shadow:
    0 24px 56px rgba(26, 95, 63, 0.18),
    0 8px 20px rgba(0, 0, 0, 0.08);
}

.slide-caption {
  flex-shrink: 0;
  text-align: center;
  line-height: 1.4;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s, transform 0.4s;
}

.carousel-slide.active .slide-caption {
  opacity: 1;
  transform: translateY(0);
}

.slide-organ {
  display: inline-block;
  margin-right: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1a5f3f;
}

.slide-desc {
  font-size: 12px;
  color: #606266;
}

.nav-btn {
  position: absolute;
  top: 50%;
  z-index: 30;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #1a5f3f;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}

.nav-btn:hover {
  background: #fff;
  transform: translateY(-50%) scale(1.06);
}

.nav-prev {
  left: 12px;
}

.nav-next {
  right: 12px;
}

.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 30;
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(26, 95, 63, 0.25);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.dot.active {
  background: #1a5f3f;
  transform: scale(1.25);
}

@media (max-width: 992px) {
  .carousel-slide {
    width: min(70%, 320px);
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
