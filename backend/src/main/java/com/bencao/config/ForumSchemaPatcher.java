package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(11)
@RequiredArgsConstructor
public class ForumSchemaPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ensureColumn("category",
                    "ALTER TABLE `forum_post` ADD COLUMN `category` VARCHAR(32) NOT NULL DEFAULT 'question' "
                            + "COMMENT 'question提问 share心得' AFTER `content`");
            ensureColumn("ref_type",
                    "ALTER TABLE `forum_post` ADD COLUMN `ref_type` VARCHAR(32) NOT NULL DEFAULT '' "
                            + "COMMENT '关联类型herb等' AFTER `category`");
            ensureColumn("ref_id",
                    "ALTER TABLE `forum_post` ADD COLUMN `ref_id` BIGINT UNSIGNED DEFAULT NULL "
                            + "COMMENT '关联资源ID' AFTER `ref_type`");
        } catch (Exception ex) {
            log.warn("forum_post 表结构检查失败: {}", ex.getMessage());
        }
    }

    private void ensureColumn(String column, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'forum_post' AND COLUMN_NAME = ?",
                Integer.class,
                column);
        if (count != null && count > 0) {
            return;
        }
        log.info("forum_post 表缺少列 {}，正在执行补丁…", column);
        jdbcTemplate.execute(ddl);
    }
}
