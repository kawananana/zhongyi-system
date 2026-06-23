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
@Order(12)
@RequiredArgsConstructor
public class OrderReturnSchemaPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.TABLES "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_return_request'",
                    Integer.class);
            if (count != null && count > 0) {
                return;
            }
            log.info("order_return_request 表不存在，正在创建…");
            jdbcTemplate.execute(
                    "CREATE TABLE `order_return_request` ("
                            + "`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '退货申请ID',"
                            + "`order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',"
                            + "`user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',"
                            + "`reason` VARCHAR(500) NOT NULL COMMENT '退货原因',"
                            + "`status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审核 1已同意 2已拒绝',"
                            + "`admin_remark` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '审核备注',"
                            + "`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                            + "`update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                            + "`audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',"
                            + "PRIMARY KEY (`id`),"
                            + "UNIQUE KEY `uk_order_id` (`order_id`),"
                            + "KEY `idx_user_id` (`user_id`),"
                            + "KEY `idx_status` (`status`)"
                            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单退货申请'");
        } catch (Exception ex) {
            log.warn("order_return_request 表结构检查失败: {}", ex.getMessage());
        }
    }
}
