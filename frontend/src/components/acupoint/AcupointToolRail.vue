<script setup lang="ts">
import { HomeFilled, QuestionFilled, Setting, View } from '@element-plus/icons-vue'

defineProps<{
  skinTranslucent: boolean
}>()

const emit = defineEmits<{
  home: []
  reset: []
  help: []
  intro: []
  toggleSkin: []
}>()
</script>

<template>
  <nav class="tool-rail">
    <button type="button" class="tool-btn" title="返回首页" @click="emit('home')">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </button>
    <button type="button" class="tool-btn" title="设置" @click="emit('help')">
      <el-icon><Setting /></el-icon>
      <span>设置</span>
    </button>
    <button
      type="button"
      class="tool-btn"
      :class="{ on: skinTranslucent }"
      title="解剖（皮肤半透明）"
      @click="emit('toggleSkin')"
    >
      <el-icon><View /></el-icon>
      <span>解剖</span>
    </button>
    <button type="button" class="tool-btn" title="教学引导" @click="emit('intro')">
      <span class="icon-text">教</span>
      <span>教学</span>
    </button>
    <button type="button" class="tool-btn" title="重置视角" @click="emit('reset')">
      <span class="icon-text">⟲</span>
      <span>操作</span>
    </button>
    <button type="button" class="tool-btn" title="帮助" @click="emit('help')">
      <el-icon><QuestionFilled /></el-icon>
      <span>帮助</span>
    </button>
  </nav>
</template>

<style scoped>
.tool-rail {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  width: 56px;
  padding: 10px 6px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c5348;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: background 0.2s, color 0.2s;
}

.tool-btn:hover,
.tool-btn.on {
  background: #1a5f3f;
  color: #fff;
}

.icon-text {
  font-size: 18px;
  line-height: 1;
}
</style>
