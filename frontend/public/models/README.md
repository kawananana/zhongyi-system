# 3D 人体模型（Blender 导出说明）

## 1. 在 Blender 中清理模型

1. 打开人体 `.blend` 文件  
2. **大纲视图**中删除灰色裤子、鞋、多余杂物（只保留皮肤人体）  
3. 新建 **Principled BSDF** 材质：  
   - 基础色：浅棕肤色 `#EDCDb8` 左右  
   - 粗糙度：**0.7**  
   - 金属度：**0.1**  
4. 检查破面、穿模，有问题则补面或删面  

## 2. 导出 GLB

`文件 → 导出 → glTF 2.0 (.glb)`

- 勾选 **glTF Binary (.glb)**  
- 建议勾选 **Draco 压缩**  
- **先只选中人体网格**，再导出  
- 务必勾选 **Selected Objects（仅导出选中物体）**，否则会带上方块、空物体等，网页里会出现黑色块  

导出后覆盖本目录下的 `human-body.glb`。

## 3. 前端自动处理

加载时会：

- 按名称剔除带 `pants/cloth/裤` 等关键词的网格（双保险）  
- 统一肤色材质（粗糙度 0.7）  
- 对齐到穴位坐标系  

经络穴位坐标可在 `src/data/meridiansData.ts` 与 `database/sql/seed_acupoints.sql` 中维护。
