package com.bencao.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 清除种子/B站播放量、假销量等外链数据，仅保留后续站内访问与订单累计。
 */
@Slf4j
@Component
@Order(30)
@RequiredArgsConstructor
public class SiteViewCountNormalizer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        normalizeViewCounts();
        normalizeProductSales();
    }

    private void normalizeViewCounts() {
        try {
            Long maxArticle = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(view_count), 0) FROM article", Long.class);
            if (maxArticle == null || maxArticle <= 10_000) {
                return;
            }
            int articles = jdbcTemplate.update("UPDATE article SET view_count = 0");
            int recipes = jdbcTemplate.update("UPDATE recipe SET view_count = 0");
            log.info("已清零外链/种子浏览量：百科/课程 {} 条、食谱 {} 条（此后仅统计本站访问）", articles, recipes);
        } catch (Exception ex) {
            log.warn("浏览量规范化跳过: {}", ex.getMessage());
        }
    }

    private void normalizeProductSales() {
        try {
            Long maxSales = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(sales_count), 0) FROM product", Long.class);
            if (maxSales == null || maxSales <= 100) {
                return;
            }
            int products = jdbcTemplate.update("UPDATE product SET sales_count = 0");
            log.info("已清零种子销量：商品 {} 条（此后仅统计本站订单）", products);
        } catch (Exception ex) {
            log.warn("销量规范化跳过: {}", ex.getMessage());
        }
    }
}
