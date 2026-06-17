package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 旧库自动补齐 article 百科字段，避免 Unknown column 导致接口 500。
 */
@Slf4j
@Component
@Order(24)
@RequiredArgsConstructor
public class ArticleSchemaPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ensureColumn("category",
                    "ALTER TABLE `article` ADD COLUMN `category` VARCHAR(32) NOT NULL DEFAULT 'recommend' "
                            + "COMMENT '百科分类' AFTER `article_type`");
            ensureColumn("content_kind",
                    "ALTER TABLE `article` ADD COLUMN `content_kind` VARCHAR(16) NOT NULL DEFAULT 'article' "
                            + "COMMENT 'article文章 course课程' AFTER `category`");
            ensureColumn("source_name",
                    "ALTER TABLE `article` ADD COLUMN `source_name` VARCHAR(128) NOT NULL DEFAULT '' "
                            + "COMMENT '参考资料名称' AFTER `author`");
            ensureColumn("source_url",
                    "ALTER TABLE `article` ADD COLUMN `source_url` VARCHAR(512) NOT NULL DEFAULT '' "
                            + "COMMENT '参考资料链接' AFTER `source_name`");
            ensureColumn("gallery_json",
                    "ALTER TABLE `article` ADD COLUMN `gallery_json` MEDIUMTEXT NULL "
                            + "COMMENT '配图JSON' AFTER `source_url`");
            ensureColumn("videos_json",
                    "ALTER TABLE `article` ADD COLUMN `videos_json` MEDIUMTEXT NULL "
                            + "COMMENT '视频JSON' AFTER `gallery_json`");
        } catch (Exception ex) {
            log.warn("article 表结构检查失败: {}", ex.getMessage());
        }
    }

    private void ensureColumn(String column, String ddl) {
        if (columnExists(column)) {
            return;
        }
        log.info("article 表缺少列 {}，正在执行补丁…", column);
        jdbcTemplate.execute(ddl);
        log.info("article.{} 已创建", column);
    }

    private boolean columnExists(String column) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article' AND COLUMN_NAME = ?",
                Integer.class,
                column);
        return count != null && count > 0;
    }
}
