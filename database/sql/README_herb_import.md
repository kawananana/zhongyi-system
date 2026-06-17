# 药材批量导入说明

## 方式一：JSON 批量（推荐，不用一条条发）

1. 编辑文件：`backend/src/main/resources/seed/herbs-batch.json`
2. 在数组里**追加**药材对象（可复制紫苏那条当模板）
3. 图片放到：`frontend/public/images/herbs/你的图片.jpg`
4. **先编译再重启后端**（`cd backend && mvn compile`），否则 `target` 里的 JSON 可能是旧的  
5. 启动时会删除 picsum 占位图鉴，并从 JSON **同步**药材（同名则更新字段与图片）

关闭自动导入（可选）：`application.yml` 增加

```yaml
bencao:
  seed:
    herbs-batch: false
```

## 方式二：一次发给我多条

把多味药的文字按下面格式粘在一起发给我，我生成 **一个** `seed_herbs_xxx.sql`，你在 MySQL 执行一次即可。

## 方式三：Excel / CSV

表头：药材名称、别名、省份、药性、药味、归经、功效、临床应用、封面图文件名  
发我表格或 CSV，我转成 JSON 或 SQL。

## 功效分类（首页卡片）

无单独标签表，在 **功效** 字段写关键词即可，例如：

- 补虚类：补虚、补气、益气
- 安神类：安神、宁心、养心
- 清热类：清热、解毒
- 解表类：解表、散寒、发汗解肌、发汗散寒

## JSON 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| herbName | 是 | 药材名 |
| alias | 否 | 别名 |
| nature / taste / meridian | 建议 | 性味归经 |
| efficacy / clinicalUsage | 建议 | 列表页与筛选 |
| coverImage | 建议 | 如 `/images/herbs/xxx.jpg` |
| detailContent | 否 | 详情分块：intro、property、efficacy、suitableCrowd、contraindication、applications、precautions、references、modernResearch 等（见紫苏/麻黄示例） |
| images | 否 | 多图数组 |
