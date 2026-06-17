# 本草萌智 · 前端

Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus + Axios + Three.js

## 目录结构

```
src/
├── api/           # 接口定义
├── components/    # 公共组件（含 AdminLayout）
├── router/        # 路由
├── store/         # Pinia 状态
├── utils/         # 工具（含 request 封装）
├── views/         # 页面
└── types/         # TS 类型
```

## 本地开发

```bash
cd frontend
npm install
npm run dev
```

默认地址：http://localhost:5174（避免与占用 5173 的其他 Vite 项目冲突）

需同时启动后端（8080），Vite 已将 `/api` 代理到后端。

## 后台路由

| 路径 | 说明 |
|------|------|
| `/login` | 登录页 |
| `/admin/herbs` | 图鉴管理 |
| `/admin/products` | 商品管理 |
| `/admin/forum` | 论坛管控 |
| `/admin/dashboard` | 数据看板 |
