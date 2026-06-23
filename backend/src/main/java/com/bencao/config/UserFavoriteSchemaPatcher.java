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
@Order(13)
@RequiredArgsConstructor
public class UserFavoriteSchemaPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.TABLES "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_article_favorite'",
                    Integer.class);
            if (count == null || count == 0) {
                log.info("user_article_favorite 表不存在，正在创建…");
                jdbcTemplate.execute(
                        "CREATE TABLE `user_article_favorite` ("
                                + "`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,"
                                + "`user_id` BIGINT UNSIGNED NOT NULL,"
                                + "`article_id` BIGINT UNSIGNED NOT NULL,"
                                + "`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                                + "PRIMARY KEY (`id`),"
                                + "UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),"
                                + "KEY `idx_user_id` (`user_id`)"
                                + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户百科收藏'");
            }
            ensureRecipeFavoriteTable();
        } catch (Exception ex) {
            log.warn("user_article_favorite 表结构检查失败: {}", ex.getMessage());
        }
    }

    private void ensureRecipeFavoriteTable() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.TABLES "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_recipe_favorite'",
                    Integer.class);
            if (count != null && count > 0) {
                return;
            }
            log.info("user_recipe_favorite 表不存在，正在创建…");
            jdbcTemplate.execute(
                    "CREATE TABLE `user_recipe_favorite` ("
                            + "`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,"
                            + "`user_id` BIGINT UNSIGNED NOT NULL,"
                            + "`recipe_id` BIGINT UNSIGNED NOT NULL,"
                            + "`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                            + "PRIMARY KEY (`id`),"
                            + "UNIQUE KEY `uk_user_recipe` (`user_id`, `recipe_id`),"
                            + "KEY `idx_user_id` (`user_id`)"
                            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户药膳收藏'");
        } catch (Exception ex) {
            log.warn("user_recipe_favorite 表结构检查失败: {}", ex.getMessage());
        }
    }
}
