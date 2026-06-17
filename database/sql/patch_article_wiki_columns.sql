-- 为旧库补齐百科字段（若已存在会报错，可忽略对应语句）
ALTER TABLE `article`
    ADD COLUMN `category` VARCHAR(32) NOT NULL DEFAULT 'recommend'
        COMMENT '百科分类' AFTER `article_type`;

ALTER TABLE `article`
    ADD COLUMN `content_kind` VARCHAR(16) NOT NULL DEFAULT 'article'
        COMMENT 'article文章 course课程' AFTER `category`;
