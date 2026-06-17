# 本草萌智 · 后端服务

Spring Boot 3.2 + MyBatis-Plus + MySQL 8 + Redis + JWT (jjwt)

## 目录结构

```
src/main/java/com/bencao/
├── BencaoApplication.java
├── common/          # Result、异常、全局处理
├── config/          # MyBatis-Plus、Redis、JWT 配置
├── controller/
├── service/
│   └── impl/
├── mapper/
└── entity/
```

## 快速启动

1. 执行 `database/sql/bencao_mengzhi.sql` 初始化数据库（建库 + 建表 + 种子数据）
2. 修改 `application.yml` 中的 MySQL / Redis 连接信息
3. 启动：

```bash
cd backend
mvn spring-boot:run
```

## 已提供接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/atlas/herbs?page=1&pageSize=20` | 药材分页（支持 keyword、nature、originProvince） |
| GET | `/api/v1/atlas/herbs/{id}` | 药材详情 |
| GET | `/api/v1/users?page=1&pageSize=20` | 用户分页 |
| GET | `/api/v1/users/{id}` | 用户详情（密码字段已 @JsonIgnore） |

## 统一响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { "list": [], "total": 5, "page": 1, "pageSize": 20 },
  "timestamp": 1713600000000
}
```
