<script setup>
import AcupunctureModel from './AcupunctureModel.vue'
</script>

<template>
  <div class="admin-page">
    <header class="admin-header">
      <div>
        <h1>3D 针灸 · 管理后台</h1>
        <p>录入、编辑穴位信息与坐标（坐标请谨慎修改）</p>
      </div>
      <router-link to="/atlas/acupoint" class="back-link">返回 3D 经络</router-link>
    </header>
    <div class="admin-body">
      <AcupunctureModel />
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.admin-header h1 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.admin-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.back-link {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
  white-space: nowrap;
}

.back-link:hover {
  text-decoration: underline;
}

.admin-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
