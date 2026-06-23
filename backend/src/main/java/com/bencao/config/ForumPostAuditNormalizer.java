package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 历史待审帖子自动通过，避免社区只显示少量旧帖。
 */
@Slf4j
@Component
@Order(14)
@RequiredArgsConstructor
public class ForumPostAuditNormalizer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE forum_post SET audit_status = 1 WHERE status = 1 AND audit_status = 0");
            if (updated > 0) {
                log.info("已将 {} 条待审论坛帖设为已通过", updated);
            }
        } catch (Exception ex) {
            log.warn("forum_post 审核状态规范化失败: {}", ex.getMessage());
        }
    }
}
