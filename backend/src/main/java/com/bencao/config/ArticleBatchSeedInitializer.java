package com.bencao.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.entity.Article;
import com.bencao.mapper.ArticleMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 从 classpath:seed/articles-batch.json 同步百科文章（按 title 匹配，存在则更新，不存在则新增）。
 */
@Slf4j
@Component
@Order(27)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "bencao.seed.articles-batch", havingValue = "true", matchIfMissing = true)
public class ArticleBatchSeedInitializer implements ApplicationRunner {

    private static final String SEED_FILE = "seed/articles-batch.json";

    private final ArticleMapper articleMapper;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ClassPathResource resource = new ClassPathResource(SEED_FILE);
            if (!resource.exists()) {
                log.warn("未找到批量百科种子文件: {}（请执行 mvn compile 或 IDE Rebuild）", SEED_FILE);
                return;
            }
            int inserted = 0;
            int updated = 0;
            Set<String> seedTitles = new HashSet<>();
            try (InputStream in = resource.getInputStream()) {
                JsonNode root = objectMapper.readTree(in);
                if (!root.isArray()) {
                    log.warn("{} 根节点必须是 JSON 数组", SEED_FILE);
                    return;
                }
                log.info("读取百科种子 {} 条（{}）", root.size(), SEED_FILE);
                for (JsonNode node : root) {
                    String title = text(node, "title");
                    if (StringUtils.hasText(title)) {
                        seedTitles.add(title);
                    }
                    SyncResult result = syncOne(node);
                    if (result == SyncResult.INSERTED) {
                        inserted++;
                    } else if (result == SyncResult.UPDATED) {
                        updated++;
                    }
                }
            }
            int removed = pruneStaleArticles(seedTitles);
            if (inserted > 0 || updated > 0 || removed > 0) {
                log.info("批量百科种子同步完成：新增 {} 条，更新 {} 条，移除过期文章 {} 条",
                        inserted, updated, removed);
            }
        } catch (Exception ex) {
            log.error("批量百科种子同步失败", ex);
        }
    }

    private enum SyncResult { SKIPPED, INSERTED, UPDATED }

    private SyncResult syncOne(JsonNode node) {
        String title = text(node, "title");
        if (!StringUtils.hasText(title)) {
            return SyncResult.SKIPPED;
        }

        Article existing = articleMapper.selectOne(
                new LambdaQueryWrapper<Article>().eq(Article::getTitle, title).last("LIMIT 1"));

        Article article = existing != null ? existing : new Article();
        applyFields(article, node, title, existing != null);

        if (existing == null) {
            articleMapper.insert(article);
            log.info("百科种子已新增: {}", title);
            return SyncResult.INSERTED;
        }

        articleMapper.updateById(article);
        log.info("百科种子已更新: {}", title);
        return SyncResult.UPDATED;
    }

    private void applyFields(Article article, JsonNode node, String title, boolean isUpdate) {
        article.setTitle(title);
        article.setArticleType(text(node, "articleType"));
        article.setCategory(text(node, "category"));
        article.setContentKind(text(node, "contentKind"));
        article.setCoverImage(text(node, "coverImage"));
        article.setContent(text(node, "content"));
        article.setAuthor(text(node, "author"));
        article.setSourceName(text(node, "sourceName"));
        article.setSourceUrl(text(node, "sourceUrl"));
        article.setGalleryJson(jsonArrayString(node, "gallery"));
        // 仅课程保留视频；文章清空（空串确保 MyBatis 更新落库）
        if ("course".equals(text(node, "contentKind"))) {
            String videos = jsonArrayString(node, "videos");
            article.setVideosJson(videos != null ? videos : "");
        } else {
            article.setVideosJson("");
        }
        // 浏览量仅统计本站访问，种子/外链播放量不写入
        if (!isUpdate) {
            article.setViewCount(0);
        }
        article.setStatus(node.has("status") ? node.get("status").asInt(1) : 1);
    }

    private String text(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) {
            return "";
        }
        return node.get(field).asText("").trim();
    }

    /** 清理种子文件中已不存在的百科文章与课程 */
    private int pruneStaleArticles(Set<String> seedTitles) {
        List<Article> stale = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getArticleType, "wiki")
                .in(Article::getContentKind, "article", "course"));
        List<Long> removeIds = new ArrayList<>();
        for (Article article : stale) {
            if (article.getTitle() != null && !seedTitles.contains(article.getTitle())) {
                removeIds.add(article.getId());
            }
        }
        if (removeIds.isEmpty()) {
            return 0;
        }
        articleMapper.deleteBatchIds(removeIds);
        log.info("已移除过期百科内容 {} 条", removeIds.size());
        return removeIds.size();
    }

    private String jsonArrayString(JsonNode node, String field) {
        if (!node.has(field) || !node.get(field).isArray() || node.get(field).isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(node.get(field));
        } catch (Exception ex) {
            log.warn("百科 {} 字段序列化失败", field);
            return null;
        }
    }
}
