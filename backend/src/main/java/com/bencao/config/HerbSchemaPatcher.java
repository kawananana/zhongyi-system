package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class HerbSchemaPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ensureColumn("detail_content",
                    "ALTER TABLE `herb` ADD COLUMN `detail_content` MEDIUMTEXT NULL "
                            + "COMMENT '详情扩展JSON' AFTER `clinical_usage`");
        } catch (Exception ex) {
            log.warn("herb 表结构检查失败: {}", ex.getMessage());
        }
    }

    private void ensureColumn(String column, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'herb' AND COLUMN_NAME = ?",
                Integer.class,
                column);
        if (count != null && count > 0) {
            return;
        }
        log.info("herb 表缺少列 {}，正在执行补丁…", column);
        jdbcTemplate.execute(ddl);
    }
}
