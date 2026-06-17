-- =============================================================================
-- 本草萌智 · 数据库唯一脚本（建库 + 建表 + 种子数据）
-- 依据：需求分析报告 2.0 · §7.2 逻辑设计 · §6 数据字典
-- 数据库：MySQL 8.0+ · utf8mb4_unicode_ci
-- 维护说明：后续所有表结构变更、种子数据修改，仅改本文件
-- 执行：mysql -u root -p < database/sql/bencao_mengzhi.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `bencao_mengzhi`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bencao_mengzhi`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 阶段 0：用户与健康管理（P1）
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `points_exchange`;
DROP TABLE IF EXISTS `forum_comment`;
DROP TABLE IF EXISTS `forum_post_like`;
DROP TABLE IF EXISTS `forum_post`;
DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `shop_order`;
DROP TABLE IF EXISTS `cart_item`;
DROP TABLE IF EXISTS `recipe_ingredient`;
DROP TABLE IF EXISTS `user_herb_favorite`;
DROP TABLE IF EXISTS `user_health_archive`;
DROP TABLE IF EXISTS `user_points`;
DROP TABLE IF EXISTS `sys_audit_log`;
DROP TABLE IF EXISTS `sys_dict`;
DROP TABLE IF EXISTS `sys_config`;
DROP TABLE IF EXISTS `points_gift`;
DROP TABLE IF EXISTS `quiz_question`;
DROP TABLE IF EXISTS `points_ledger`;
DROP TABLE IF EXISTS `recipe`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `herb_image`;
DROP TABLE IF EXISTS `province_herb_mapping`;
DROP TABLE IF EXISTS `herb`;
DROP TABLE IF EXISTS `acupoint`;
DROP TABLE IF EXISTS `article`;
DROP TABLE IF EXISTS `home_banner`;
DROP TABLE IF EXISTS `admin_user`;
DROP TABLE IF EXISTS `sys_user`;

CREATE TABLE `sys_user` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `nickname`        VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '昵称',
    `phone`           VARCHAR(20)     NOT NULL COMMENT '手机号',
    `password`        VARCHAR(255)    NOT NULL COMMENT '登录密码（BCrypt）',
    `avatar`          VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '头像URL',
    `gender`          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '性别：0未知 1男 2女',
    `birthday`        DATE            DEFAULT NULL COMMENT '生日',
    `status`          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '账号状态：0禁用 1正常',
    `last_login_time` DATETIME        DEFAULT NULL COMMENT '最后登录时间',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='C端用户表';

CREATE TABLE `user_health_archive` (
    `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '健康档案ID',
    `user_id`             BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `sleep_quality`       TINYINT UNSIGNED DEFAULT NULL COMMENT '睡眠质量（1-5）',
    `sleep_hours`         DECIMAL(4,1)    DEFAULT NULL COMMENT '日均睡眠时长（小时）',
    `height_cm`           DECIMAL(5,2)    DEFAULT NULL COMMENT '身高（厘米）',
    `weight_kg`           DECIMAL(5,2)    DEFAULT NULL COMMENT '体重（千克）',
    `bmi`                 DECIMAL(5,2)    DEFAULT NULL COMMENT 'BMI',
    `exam_info`           JSON            DEFAULT NULL COMMENT '体检信息JSON',
    `medical_history`     TEXT            COMMENT '既往病史',
    `allergy_history`     VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '过敏史',
    `constitution_type`   VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '体质类型',
    `constitution_report` JSON            DEFAULT NULL COMMENT '体质分析报告缓存',
    `create_time`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_constitution_type` (`constitution_type`),
    CONSTRAINT `fk_health_archive_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户健康档案表';

-- -----------------------------------------------------------------------------
-- 阶段 1：学 · 科普与图鉴引擎（P2）
-- -----------------------------------------------------------------------------

CREATE TABLE `herb` (
    `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '药材ID',
    `herb_name`            VARCHAR(64)     NOT NULL COMMENT '药材名称',
    `alias`                VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '别名',
    `origin_province`      VARCHAR(16)     NOT NULL DEFAULT '' COMMENT '产地省份编码',
    `origin_province_name` VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '产地省份名称',
    `dao_di_region`        VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '道地产区',
    `is_dao_di`            TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否道地：0否 1是',
    `nature`               VARCHAR(8)      NOT NULL DEFAULT '' COMMENT '药性',
    `taste`                VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '药味',
    `meridian`             VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '归经',
    `property_desc`        TEXT            COMMENT '性状描述',
    `efficacy`             TEXT            COMMENT '功效主治',
    `clinical_usage`       TEXT            COMMENT '临床用途',
    `cover_image`          VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '封面图',
    `view_count`           INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '浏览量',
    `collect_count`        INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '收藏量',
    `status`               TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0下架 1上架',
    `create_time`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_herb_name` (`herb_name`),
    KEY `idx_origin_province` (`origin_province`),
    KEY `idx_nature` (`nature`),
    KEY `idx_status_view` (`status`, `view_count`),
    FULLTEXT KEY `ft_herb_name_alias` (`herb_name`, `alias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='中药材图鉴表';

CREATE TABLE `herb_image` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图片ID',
    `herb_id`     BIGINT UNSIGNED NOT NULL COMMENT '药材ID',
    `image_url`   VARCHAR(512)    NOT NULL COMMENT '图片地址',
    `sort_order`  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_herb_sort` (`herb_id`, `sort_order`),
    CONSTRAINT `fk_herb_image_herb` FOREIGN KEY (`herb_id`) REFERENCES `herb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='中药材图片表';

CREATE TABLE `province_herb_mapping` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '映射ID',
    `province_code` VARCHAR(16)     NOT NULL COMMENT '省份编码',
    `province_name` VARCHAR(32)     NOT NULL COMMENT '省份名称',
    `herb_id`       BIGINT UNSIGNED NOT NULL COMMENT '药材ID',
    `region_label`  VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '产区标签',
    `sort_order`    INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_province_code` (`province_code`),
    KEY `idx_herb_id` (`herb_id`),
    CONSTRAINT `fk_mapping_herb` FOREIGN KEY (`herb_id`) REFERENCES `herb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='省份药材映射表';

CREATE TABLE `acupoint` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '穴位ID',
    `point_name`    VARCHAR(64)     NOT NULL COMMENT '穴位名称',
    `meridian`      VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '所属经络',
    `position_desc` VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '位置描述',
    `efficacy`      TEXT            COMMENT '功效',
    `coord_3d`      JSON            DEFAULT NULL COMMENT '3D坐标',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_meridian` (`meridian`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='针灸穴位表';

CREATE TABLE `article` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文章ID',
    `title`        VARCHAR(200)    NOT NULL COMMENT '标题',
    `article_type` VARCHAR(32)     NOT NULL DEFAULT 'general' COMMENT '兼容旧类型',
    `category`     VARCHAR(32)     NOT NULL DEFAULT 'recommend' COMMENT '百科分类：recommend/acupuncture/moxibustion/tuina/cupping/diet/exercise/lifestyle',
    `content_kind` VARCHAR(16)     NOT NULL DEFAULT 'article' COMMENT '内容形态：article文章 course课程',
    `cover_image`  VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '封面图',
    `content`      MEDIUMTEXT      COMMENT '正文',
    `author`       VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '作者',
    `source_name`  VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '参考资料名称',
    `source_url`   VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '参考资料链接',
    `gallery_json` MEDIUMTEXT      NULL COMMENT '配图JSON',
    `videos_json`  MEDIUMTEXT      NULL COMMENT '视频JSON',
    `view_count`   INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '浏览量',
    `status`       TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0草稿 1发布',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status_view` (`status`, `view_count`),
    KEY `idx_category_kind` (`category`, `content_kind`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资讯文章表';

CREATE TABLE `home_banner` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '轮播ID',
    `title`          VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '标题',
    `image_url`      VARCHAR(512)    NOT NULL COMMENT '图片地址',
    `link_type`      VARCHAR(32)     NOT NULL DEFAULT 'none' COMMENT '链接类型',
    `link_target_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '链接目标ID',
    `link_url`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '外链',
    `position`       VARCHAR(32)     NOT NULL DEFAULT 'home' COMMENT '展示位置',
    `sort_order`     INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '排序',
    `status`         TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_position_status` (`position`, `status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='首页轮播图表';

-- -----------------------------------------------------------------------------
-- 用 · 养生药膳（P5）
-- -----------------------------------------------------------------------------

CREATE TABLE `recipe` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '食谱ID',
    `recipe_name`       VARCHAR(128)    NOT NULL COMMENT '食谱名称',
    `category`          VARCHAR(32)     NOT NULL DEFAULT 'soup' COMMENT '分类：soup/porridge/tea/snack',
    `cover_image`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '封面图',
    `summary`           VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '简介',
    `efficacy`          TEXT            COMMENT '功效',
    `cooking_steps`     MEDIUMTEXT      COMMENT '制作步骤',
    `cooking_time`      VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '烹饪时间',
    `difficulty`        VARCHAR(16)     NOT NULL DEFAULT '中等' COMMENT '难度',
    `tags`              VARCHAR(256)    NOT NULL DEFAULT '' COMMENT '标签，逗号分隔',
    `constitution_tags` VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '适宜体质标签',
    `is_featured`       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '每日一荐：0否 1是',
    `view_count`        INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '浏览量',
    `status`            TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_category` (`category`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='药膳食谱表';

CREATE TABLE `recipe_ingredient` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用料ID',
    `recipe_id`   BIGINT UNSIGNED NOT NULL COMMENT '食谱ID',
    `product_id`  BIGINT UNSIGNED DEFAULT NULL COMMENT '关联商品ID',
    `ingredient_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '用料名称（无商品时）',
    `dosage`      VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '用量',
    `sort_order`  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_recipe_id` (`recipe_id`),
    CONSTRAINT `fk_recipe_ingredient_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipe` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食谱用料表';

-- -----------------------------------------------------------------------------
-- 购 · 本草市集（P5）
-- -----------------------------------------------------------------------------

CREATE TABLE `product` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `product_name` VARCHAR(128)    NOT NULL COMMENT '商品名称',
    `herb_id`      BIGINT UNSIGNED DEFAULT NULL COMMENT '关联药材ID',
    `category`     VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '分类',
    `price`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00 COMMENT '价格（元）',
    `stock`        INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '库存',
    `cover_image`  VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '封面图',
    `detail`       MEDIUMTEXT      COMMENT '详情',
    `sales_count`  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '销量',
    `status`       TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0下架 1上架',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_herb_id` (`herb_id`),
    KEY `idx_category` (`category`),
    KEY `idx_status_sales` (`status`, `sales_count`),
    CONSTRAINT `fk_product_herb` FOREIGN KEY (`herb_id`) REFERENCES `herb` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

CREATE TABLE `cart_item` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
    `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `product_id`  BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `quantity`    INT UNSIGNED    NOT NULL DEFAULT 1 COMMENT '数量',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

CREATE TABLE `shop_order` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no`       VARCHAR(32)     NOT NULL COMMENT '订单编号',
    `user_id`        BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `total_amount`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    `pay_type`       VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '支付方式',
    `pay_status`     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付状态：0待付 1已付 2退款',
    `order_status`   TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '订单状态：0待发货 1已发货 2完成 3取消',
    `receiver_name`  VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '收货人',
    `receiver_phone` VARCHAR(20)     NOT NULL DEFAULT '' COMMENT '收货电话',
    `receiver_addr`  VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '收货地址',
    `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `pay_time`       DATETIME        DEFAULT NULL COMMENT '支付时间',
    `finish_time`    DATETIME        DEFAULT NULL COMMENT '完成时间',
    `update_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_pay_status` (`pay_status`),
    KEY `idx_order_status` (`order_status`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

CREATE TABLE `order_item` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '明细ID',
    `order_id`     BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `product_id`   BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `product_name` VARCHAR(128)    NOT NULL COMMENT '商品名称快照',
    `unit_price`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00 COMMENT '单价',
    `quantity`     INT UNSIGNED    NOT NULL DEFAULT 1 COMMENT '数量',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `shop_order` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- -----------------------------------------------------------------------------
-- 玩 · 萌智趣学 + 社区（P4）
-- -----------------------------------------------------------------------------

CREATE TABLE `quiz_question` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
    `question_content` TEXT          NOT NULL COMMENT '题目内容',
    `option_a`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '选项A',
    `option_b`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '选项B',
    `option_c`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '选项C',
    `option_d`       VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '选项D',
    `correct_answer` CHAR(1)         NOT NULL COMMENT '正确答案A/B/C/D',
    `question_type`  VARCHAR(32)     NOT NULL DEFAULT 'single' COMMENT '题型',
    `ref_type`       VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '关联类型herb/article',
    `ref_id`         BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID',
    `status`         TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_ref` (`ref_type`, `ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='趣味题库表';

CREATE TABLE `user_points` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '积分账户ID',
    `user_id`        BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `total_points`   INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '累计积分',
    `available_points` INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '可用积分',
    `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分表';

CREATE TABLE `points_gift` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '礼品ID',
    `gift_name`     VARCHAR(128)    NOT NULL COMMENT '礼品名称',
    `cover_image`   VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '封面图',
    `points_required` INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '所需积分',
    `stock`         INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '库存',
    `status`        TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分礼品表';

CREATE TABLE `points_exchange` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '兑换ID',
    `user_id`       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `gift_id`       BIGINT UNSIGNED NOT NULL COMMENT '礼品ID',
    `points_cost`   INT UNSIGNED    NOT NULL COMMENT '消耗积分',
    `status`        TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态：0待发货 1已完成 2取消',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_exchange_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_exchange_gift` FOREIGN KEY (`gift_id`) REFERENCES `points_gift` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分兑换记录表';

CREATE TABLE `forum_post` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
    `user_id`       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `title`         VARCHAR(200)    NOT NULL DEFAULT '' COMMENT '标题',
    `content`       MEDIUMTEXT      COMMENT '正文',
    `image_urls`    JSON            DEFAULT NULL COMMENT '图片列表JSON',
    `like_count`    INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '点赞数',
    `comment_count` INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '评论数',
    `audit_status`  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '审核：0待审 1通过 2驳回',
    `status`        TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_audit_status` (`audit_status`),
    CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区帖子表';

CREATE TABLE `forum_post_like` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
    `post_id`     BIGINT UNSIGNED NOT NULL COMMENT '帖子ID',
    `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
    CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞表';

CREATE TABLE `forum_comment` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `post_id`         BIGINT UNSIGNED NOT NULL COMMENT '帖子ID',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `content`         TEXT            NOT NULL COMMENT '评论内容',
    `parent_id`       BIGINT UNSIGNED DEFAULT NULL COMMENT '父评论ID（盖楼）',
    `reply_to_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '回复目标用户ID',
    `audit_status`    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '审核状态',
    `status`          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_post_id` (`post_id`),
    KEY `idx_parent_id` (`parent_id`),
    CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子评论表';

-- -----------------------------------------------------------------------------
-- 用户收藏（药匣，依赖 herb）
-- -----------------------------------------------------------------------------

CREATE TABLE `user_herb_favorite` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `herb_id`     BIGINT UNSIGNED NOT NULL COMMENT '药材ID',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_herb` (`user_id`, `herb_id`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_favorite_herb` FOREIGN KEY (`herb_id`) REFERENCES `herb` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户药匣收藏表';

-- -----------------------------------------------------------------------------
-- P6 · 后台管理与系统治理
-- -----------------------------------------------------------------------------

CREATE TABLE `admin_user` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
    `username`    VARCHAR(64)     NOT NULL COMMENT '用户名',
    `password`    VARCHAR(255)    NOT NULL COMMENT '密码BCrypt',
    `role`        VARCHAR(32)     NOT NULL DEFAULT 'operator' COMMENT '角色',
    `status`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='后台管理员表';

CREATE TABLE `sys_config` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key`   VARCHAR(64)     NOT NULL COMMENT '配置键',
    `config_value` TEXT            COMMENT '配置值',
    `remark`       VARCHAR(256)    NOT NULL DEFAULT '' COMMENT '备注',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统全局配置表';

CREATE TABLE `sys_dict` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '字典ID',
    `dict_type`   VARCHAR(64)     NOT NULL COMMENT '字典类型',
    `dict_label`  VARCHAR(128)    NOT NULL COMMENT '显示标签',
    `dict_value`  VARCHAR(128)    NOT NULL COMMENT '字典值',
    `sort_order`  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '排序',
    `status`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_dict_type` (`dict_type`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统字典表';

CREATE TABLE `sys_audit_log` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `operator_type` VARCHAR(16)     NOT NULL DEFAULT 'admin' COMMENT '操作人类型admin/user',
    `operator_id`   BIGINT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
    `operator_ip`   VARCHAR(64)     NOT NULL DEFAULT '' COMMENT 'IP',
    `module`        VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '模块',
    `action`        VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '动作',
    `request_uri`   VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '请求URI',
    `request_params` TEXT           COMMENT '请求参数',
    `risk_level`    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '风险等级',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_operator` (`operator_type`, `operator_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统操作审计日志表';

-- recipe_ingredient 关联 product（需在 product 建表后）
ALTER TABLE `recipe_ingredient`
    ADD CONSTRAINT `fk_recipe_ingredient_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE SET NULL;

-- 积分流水（扩展，便于 P4 积分账单）
CREATE TABLE `points_ledger` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '流水ID',
    `user_id`      BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `change_points` INT            NOT NULL COMMENT '变动积分（正负）',
    `balance_after` INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '变动后余额',
    `biz_type`     VARCHAR(32)     NOT NULL COMMENT '业务类型quiz/exchange/admin',
    `biz_id`       BIGINT UNSIGNED DEFAULT NULL COMMENT '业务关联ID',
    `remark`       VARCHAR(256)    NOT NULL DEFAULT '' COMMENT '备注',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_time` (`user_id`, `create_time`),
    CONSTRAINT `fk_ledger_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分流水明细表';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 种子数据（开发/联调）
-- =============================================================================

INSERT INTO `home_banner` (`title`, `image_url`, `link_type`, `link_target_id`, `link_url`, `position`, `sort_order`, `status`) VALUES
('霜降时节，温补养肺正当时', 'https://picsum.photos/800/400?random=1', 'url', NULL, '', 'home', 1, 1),
('药食同源：一碗药膳暖全身', 'https://picsum.photos/800/400?random=2', 'url', NULL, '', 'home', 2, 1),
('走进本草图鉴，识百草之性味归经', 'https://picsum.photos/800/400?random=3', 'url', NULL, '/herbs', 'home', 3, 1);

-- 本草百科由后端启动时从 seed/articles-batch.json 导入（见 ArticleBatchSeedInitializer），此处不再插入 picsum 占位数据。

-- 图鉴药材由后端启动时从 seed/herbs-batch.json 导入（见 HerbBatchSeedInitializer），此处不再插入 picsum 占位数据。

-- 药膳食疗食谱
INSERT INTO `recipe` (
    `recipe_name`, `category`, `cover_image`, `summary`, `efficacy`, `cooking_steps`,
    `cooking_time`, `difficulty`, `tags`, `constitution_tags`, `is_featured`, `view_count`, `status`
) VALUES
(
    '当归生姜羊肉汤', 'soup',
    'https://picsum.photos/seed/recipe-yangrou/640/400',
    '出自《金匮要略》，温中补虚、祛寒止痛，是冬季温补气血的经典名方，适合畏寒肢冷、产后体虚者。',
    '温中补虚，祛寒止痛。用于虚劳不足、产后腹痛、寒疝腹痛。',
    '1. 羊肉切块焯水；2. 当归、生姜洗净，与羊肉同入砂锅；3. 加水适量，武火煮沸后改文火炖2小时；4. 加盐调味即可。',
    '2小时', '中等', '温补气血,冬季食谱,经典名方', '气虚质,阳虚质', 1, 3280, 1
),
(
    '山药红枣糕', 'snack',
    'https://picsum.photos/seed/recipe-shanyao/400/300',
    '山药健脾、红枣养血，蒸熟后口感软糯，适合脾胃虚弱、面色萎黄者日常点心。',
    '健脾养胃，益气补血。',
    '1. 山药去皮蒸熟压泥；2. 红枣去核切碎与山药拌匀；3. 可加少量糯米粉塑形；4. 上锅蒸15分钟。',
    '40分钟', '简单', '健脾养胃,四季', '气虚质,血虚质', 0, 1860, 1
),
(
    '银耳莲子羹', 'porridge',
    'https://picsum.photos/seed/recipe-yiner/400/300',
    '银耳滋阴润肺，莲子养心安神，秋冬干燥季节常饮可润燥生津。',
    '滋阴润肺，养心安神。',
    '1. 银耳泡发撕小朵；2. 莲子去芯与银耳同煮；3. 小火慢炖1小时至黏稠；4. 可加冰糖或枸杞。',
    '1.5小时', '简单', '滋阴润燥,秋季', '阴虚质', 0, 2150, 1
),
(
    '黄芪枸杞茶', 'tea',
    'https://picsum.photos/seed/recipe-huangqi-tea/400/300',
    '黄芪补气升阳，枸杞滋补肝肾，每日一杯，适合易疲劳、用眼过度人群。',
    '补气固表，滋补肝肾，益精明目。',
    '1. 黄芪10g、枸杞10g洗净；2. 沸水冲泡或小火煎煮15分钟；3. 可反复冲泡2—3次。',
    '15分钟', '简单', '补气明目,日常茶饮', '气虚质', 0, 1920, 1
),
(
    '薏米红豆粥', 'porridge',
    'https://picsum.photos/seed/recipe-yimi/400/300',
    '薏米利水渗湿，红豆健脾利湿，夏季祛湿经典粥品。',
    '健脾利湿，清热排脓。',
    '1. 薏米、红豆浸泡4小时；2. 加水煮至豆烂米熟；3. 不宜加糖过多，湿热体质尤宜。',
    '1小时', '简单', '祛湿健脾,夏季', '湿热质', 0, 1680, 1
),
(
    '百合雪梨汤', 'soup',
    'https://picsum.photos/seed/recipe-lily/400/300',
    '百合润肺止咳，雪梨生津润燥，缓解秋燥干咳、咽喉不适。',
    '养阴润肺，清心安神。',
    '1. 雪梨去核切块；2. 鲜百合掰片与雪梨同炖；3. 文火40分钟，可加冰糖。',
    '50分钟', '简单', '润肺止咳,秋季', '阴虚质', 0, 1540, 1
),
(
    '玫瑰花陈皮茶', 'tea',
    'https://picsum.photos/seed/recipe-rose-tea/400/300',
    '玫瑰疏肝解郁，陈皮理气健脾，情志不畅、脘腹胀满者可常饮。',
    '疏肝理气，健脾和胃。',
    '1. 玫瑰花5—8朵、陈皮3g；2. 80℃左右热水冲泡，闷5分钟饮用。',
    '10分钟', '简单', '疏肝理气,四季', '气郁质', 0, 1420, 1
),
(
    '桂花糯米藕', 'snack',
    'https://picsum.photos/seed/recipe-lotus/400/300',
    '糯米补中益气，莲藕健脾开胃，桂花温肺化饮，江南时令小点。',
    '补中益气，健脾开胃。',
    '1. 藕节灌入泡软糯米；2. 加红糖桂花小火焖煮1小时；3. 切片装盘。',
    '1.5小时', '中等', '时令小点,健脾', '平和质', 0, 1280, 1
);

INSERT INTO `recipe_ingredient` (`recipe_id`, `ingredient_name`, `dosage`, `sort_order`) VALUES
(1, '羊肉', '500g', 1),
(1, '当归', '15g', 2),
(1, '生姜', '30g', 3),
(2, '山药', '300g', 1),
(2, '红枣', '100g', 2),
(3, '银耳', '半朵', 1),
(3, '莲子', '30g', 2);

-- 本草市集商品（category 与前端 marketCategories 一致；detail 格式：【标签】| 规格：… | 说明）
INSERT INTO `product` (
    `product_name`, `herb_id`, `category`, `price`, `stock`, `cover_image`, `detail`, `sales_count`, `status`
) VALUES
-- 养生茶疗
('杭白菊枸杞茶', NULL, 'tea_therapy', 36.80, 420, '/images/market/tea_therapy.svg', '【养生茶疗】| 规格：15袋×5g | 桐乡杭白菊配宁夏枸杞，独立茶包，清肝火明目，办公室冲泡方便。', 2340, 1),
('玫瑰红枣桂圆茶', NULL, 'tea_therapy', 42.00, 380, '/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png', '【养生茶疗】| 规格：20袋×8g | 平阴玫瑰、新疆红枣、莆田桂圆，暖宫养血，女性日常调理。', 1876, 1),
('新会陈皮普洱茶', 6, 'tea_therapy', 68.00, 260, 'https://picsum.photos/seed/chenpi-puer/400/400', '【养生茶疗】| 规格：罐装250g | 广东新会陈皮拼云南熟普，理气健脾、消食解腻，耐泡回甘。', 956, 1),
-- 艾灸艾柱
('蕲春三年陈艾柱', NULL, 'moxibustion', 58.00, 350, 'https://picsum.photos/seed/qichun-moxa/400/400', '【艾灸艾柱】| 规格：54粒×1.8cm | 湖北蕲春艾叶，三年陈化，烟少味醇，适配标准艾灸盒。', 3210, 1),
('无烟艾条', NULL, 'moxibustion', 45.00, 480, 'https://picsum.photos/seed/moxa-stick-bar/400/400', '【艾灸艾柱】| 规格：10支×18mm | 低烟配方艾条，悬灸、隔姜灸均可，居家常备。', 2788, 1),
('艾灸盒随身套装', NULL, 'moxibustion', 89.00, 180, 'https://picsum.photos/seed/moxa-kit/400/400', '【艾灸艾柱】| 规格：1盒+54粒艾柱 | 不锈钢随身灸盒、隔热垫、固定带及艾柱，新手入门套装。', 1543, 1),
-- 中医护肤
('当归草本润唇膏', 2, 'skincare', 39.90, 520, 'https://picsum.photos/seed/angelica-lip/400/400', '【中医护肤】| 规格：3.5g/支 | 当归提取物+天然蜂蜡，无香精色素，缓解唇部干裂。', 1654, 1),
('黄芪保湿面膜', 4, 'skincare', 79.00, 300, 'https://picsum.photos/seed/astragalus-mask/400/400', '【中医护肤】| 规格：5片×25ml | 黄芪多糖精华液膜布，补气固表，改善暗沉粗糙。', 892, 1),
('珍珠粉洁面乳', NULL, 'skincare', 56.00, 240, 'https://picsum.photos/seed/pearl-cleanser/400/400', '【中医护肤】| 规格：100ml | 水解珍珠粉配伍氨基酸表活，温和清洁不紧绷。', 743, 1),
-- 中医书籍
('《黄帝内经》白话图解', NULL, 'books', 68.00, 200, 'https://picsum.photos/seed/huangdi-book/400/400', '【中医书籍】| 规格：精装16开 | 彩色插图+白话注解，中医入门经典，附经络概览图。', 1280, 1),
('《针灸学》教材精编', NULL, 'books', 45.00, 320, 'https://picsum.photos/seed/acupuncture-textbook/400/400', '【中医书籍】| 规格：平装 | 十四经脉穴位定位、针刺手法要点，配真人取穴彩图。', 876, 1),
('《中药学》速查手册', NULL, 'books', 32.00, 450, 'https://picsum.photos/seed/tcm-herb-handbook/400/400', '【中医书籍】| 规格：口袋本 | 常用药材性味归经、功效主治速查，实习备考实用。', 654, 1),
-- 药食同源
('桑葚山楂块', NULL, 'food_medicine', 39.90, 800, '/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png', '【药食同源】| 规格：220g/盒 | 桑葚、山楂实材冷压成型，酸甜软糯，健脾消食，独立小包装。', 5680, 1),
('党参黄芪牛肉粒', NULL, 'food_medicine', 68.00, 450, '/images/market/65a4d09b25782d71c0029f4aa9549256_720.png', '【药食同源】| 规格：120g/袋 | 党参、黄芪入膳牛肉粒，高蛋白即食，补气养血，健身代餐。', 4230, 1),
('桑葚山楂块', NULL, 'food_medicine', 39.90, 800, '/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png', '【药食同源】| 规格：220g/盒 | 桑葚、山楂实材冷压成型，酸甜软糯，健脾消食，独立小包装。', 5680, 1),
('艾叶红花泡脚包', NULL, 'foot_therapy', 39.90, 700, '/images/market/fd16a2b13332d4a635895a18c03306f7_720.png', '【养生足疗】| 规格：30包×30g | 蕲春艾叶配红花、干姜，睡前泡脚20分钟，温经助眠。', 5120, 1),
('水牛角刮痧板', NULL, 'physio_tools', 35.00, 600, '/images/market/1eec53851cda1a2c6197406d79b29ace.png', '【理疗工具】| 规格：约12cm | 天然水牛角打磨，薄边设计，面部背部经络疏通，配刮痧油。', 4560, 1),
('甘肃黄芪片', 4, 'decoction', 48.00, 800, '/images/market/f8707b9bd50fa496cb0607e54b6f0ff6_720.png', '【滋补饮片】| 规格：100g/罐 | 岷县黄芪斜切片，豆腥味浓，煲汤泡茶，补气升阳。', 4560, 1),
('四神小棍', NULL, 'food_medicine', 29.90, 920, 'https://picsum.photos/seed/sishen-stick/400/400', '【药食同源】| 规格：320g/罐 | 茯苓、莲子、山药、芡实研磨成型，健脾祛湿，儿童老人皆宜。', 3890, 1),
('红枣枸杞核桃糕', 3, 'food_medicine', 48.00, 360, 'https://picsum.photos/seed/jujube-goji-cake/400/400', '【药食同源】| 规格：500g/盒 | 宁夏枸杞、新疆红枣、核桃仁，软糯不粘牙，滋补肝肾。', 2156, 1),
-- 膏方系列
('川贝秋梨膏', NULL, 'herbal_paste', 78.00, 280, 'https://picsum.photos/seed/pear-paste/400/400', '【膏方系列】| 规格：300g/瓶 | 川贝母、秋梨、蜂蜜慢火熬制，润肺止咳，秋冬咽干适用。', 3450, 1),
('九蒸九晒黑芝麻丸', NULL, 'herbal_paste', 59.90, 400, 'https://picsum.photos/seed/black-sesame-ball/400/400', '【膏方系列】| 规格：罐装200g | 传统九蒸九晒黑芝麻，补肾乌发，每日2丸即食。', 2876, 1),
('固本膏', NULL, 'herbal_paste', 128.00, 120, 'https://picsum.photos/seed/guben-paste/400/400', '【膏方系列】| 规格：150g/盒 | 人参、黄芪、枸杞等配伍膏方，大补元气，体虚乏力者调理。', 1543, 1),
-- 理疗工具
('水牛角刮痧板', NULL, 'physio_tools', 35.00, 600, '/images/market/1eec53851cda1a2c6197406d79b29ace.png', '【理疗工具】| 规格：约12cm | 天然水牛角打磨，薄边设计，面部背部经络疏通，配刮痧油。', 4560, 1),
('真空拔罐器12罐装', NULL, 'physio_tools', 49.90, 380, 'https://picsum.photos/seed/cupping-set/400/400', '【理疗工具】| 规格：12罐+抽气枪 | 家用真空拔罐，透明罐体，肩背腰腿祛湿活血。', 2340, 1),
('经络按摩刷', NULL, 'physio_tools', 28.00, 520, 'https://picsum.photos/seed/meridian-brush/400/400', '【理疗工具】| 规格：1把 | 树脂梳齿经络刷，腿臂腹部推拿，配合精油使用。', 1876, 1),
-- 养生足疗
('党参黄芪牛肉粒', NULL, 'food_medicine', 68.00, 450, '/images/market/65a4d09b25782d71c0029f4aa9549256_720.png', '【药食同源】| 规格：120g/袋 | 党参、黄芪入膳牛肉粒，高蛋白即食，补气养血，健身代餐。', 4230, 1),
('老姜足浴包', NULL, 'foot_therapy', 29.90, 650, 'https://picsum.photos/seed/ginger-foot-soak/400/400', '【养生足疗】| 规格：20包 | 云南小黄姜切片烘干，驱寒暖足，手脚冰凉者适用。', 3890, 1),
('藏红花足浴盐', NULL, 'foot_therapy', 45.00, 300, 'https://picsum.photos/seed/saffron-foot-salt/400/400', '【养生足疗】| 规格：500g/袋 | 藏红花、海盐、艾叶粉，溶解快，活血通络，缓解疲劳。', 1654, 1),
-- 精品礼盒
('四季养生礼盒', NULL, 'gift_box', 198.00, 120, 'https://picsum.photos/seed/season-gift-box/400/400', '【精品礼盒】| 规格：茶+膏+足浴各1 | 菊花枸杞茶、秋梨膏、艾叶泡脚包组合，节日探亲送礼。', 876, 1),
('宁夏枸杞礼盒', 3, 'gift_box', 158.00, 150, 'https://picsum.photos/seed/goji-gift-box/400/400', '【精品礼盒】| 规格：特级枸杞500g×2罐 | 中宁头茬枸杞，粒大饱满，滋补肝肾，精美礼盒装。', 1230, 1),
('银耳莲子羹礼盒', NULL, 'gift_box', 88.00, 200, 'https://picsum.photos/seed/tremella-gift/400/400', '【精品礼盒】| 规格：6碗装 | 古田银耳、建宁莲子即食羹，滋阴润肺，开盖即食。', 987, 1),
-- 滋补饮片
('甘肃黄芪片', 4, 'decoction', 48.00, 800, '/images/market/f8707b9bd50fa496cb0607e54b6f0ff6_720.png', '【滋补饮片】| 规格：100g/罐 | 岷县黄芪斜切片，豆腥味浓，煲汤泡茶，补气升阳。', 4560, 1),
('岷县当归头片', 2, 'decoction', 52.00, 650, 'https://picsum.photos/seed/angelica-slice/400/400', '【滋补饮片】| 规格：100g | 甘肃岷县当归头片，油圈明显，补血活血，妇科常用。', 3890, 1),
('宁夏枸杞王', 3, 'decoction', 68.00, 500, 'https://picsum.photos/seed/goji-berry-dry/400/400', '【滋补饮片】| 规格：250g/袋 | 中宁特级大果枸杞，干燥饱满，泡茶嚼食，滋补肝肾。', 3210, 1),
('文山三七粉', NULL, 'decoction', 128.00, 200, 'https://picsum.photos/seed/panax-powder/400/400', '【滋补饮片】| 规格：50g/瓶 | 云南文山春三七超细粉，活血化瘀，跌打损伤及心脑血管养护。', 2156, 1);

-- 后台管理员（开发环境：admin / password，BCrypt）
INSERT INTO `admin_user` (`username`, `password`, `role`, `status`) VALUES
('admin', '$2a$10$eFdmkv6P0EYiiER8cfXDkuPtSc4Oo0pJ.JWxcq2g.pI.EP4XN2vOy', 'super_admin', 1);
