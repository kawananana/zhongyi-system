package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 启动时删除图鉴占位假数据（picsum 随机图等），便于 herbs-batch.json 重新导入真实药材。
 */
@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "bencao.seed.clear-demo-herbs", havingValue = "true", matchIfMissing = true)
public class HerbDemoDataCleaner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int byCover = jdbcTemplate.update(
                    "DELETE FROM `herb` WHERE `cover_image` LIKE '%picsum.photos%'");
            int byImage = jdbcTemplate.update(
                    "DELETE FROM `herb` WHERE `id` IN ("
                            + "SELECT `herb_id` FROM `herb_image` WHERE `image_url` LIKE '%picsum.photos%')");
            int total = byCover + byImage;
            if (total > 0) {
                log.info("已清除图鉴占位假数据 {} 条（picsum 封面/图片）", total);
                jdbcTemplate.update(
                        "UPDATE `home_banner` SET `link_type` = 'url', `link_target_id` = NULL "
                                + "WHERE `link_type` = 'herb'");
            }
        } catch (Exception ex) {
            log.warn("清除图鉴占位数据失败: {}", ex.getMessage());
        }
    }
}
