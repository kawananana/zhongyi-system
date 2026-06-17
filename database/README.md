# 数据库脚本说明

## 唯一脚本

| 文件 | 说明 |
|------|------|
| **`sql/bencao_mengzhi.sql`** | 建库 + 全量建表（27 张）+ 开发种子数据 |

后续所有表结构、索引、种子数据的修改，**只改这一份文件**。

## 执行方式

```bash
mysql -u root -p --default-character-set=utf8mb4 < sql/bencao_mengzhi.sql
```

脚本内已包含 `CREATE DATABASE` 与 `USE bencao_mengzhi`，无需事先建库。

Windows 示例：

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 --default-character-set=utf8mb4 < database\sql\bencao_mengzhi.sql
```

> 重复执行会先 `DROP` 再重建全部表，**会清空已有数据**。

## 表清单（27 张）

| 模块 | 表名 |
|------|------|
| 用户 | `sys_user`、`user_health_archive`、`user_herb_favorite` |
| 学 | `herb`、`herb_image`、`province_herb_mapping`、`acupoint`、`article`、`home_banner` |
| 用 | `recipe`、`recipe_ingredient` |
| 购 | `product`、`cart_item`、`shop_order`、`order_item` |
| 玩 | `quiz_question`、`user_points`、`points_gift`、`points_exchange`、`points_ledger`、`forum_post`、`forum_post_like`、`forum_comment` |
| 后台/系统 | `admin_user`、`sys_config`、`sys_dict`、`sys_audit_log` |

## 种子数据

- 轮播 3 条、资讯 3 条、药材 8 条（含寒/热/温/凉）、省份映射、药材图片
- 后台管理员：`admin` / `password`（BCrypt，仅开发环境）
