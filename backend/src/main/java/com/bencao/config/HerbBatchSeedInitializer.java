package com.bencao.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.entity.Herb;
import com.bencao.entity.HerbImage;
import com.bencao.mapper.HerbImageMapper;
import com.bencao.mapper.HerbMapper;
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
import java.util.List;

/**
 * 从 classpath:seed/herbs-batch.json 同步药材（按 herbName 匹配，存在则更新，不存在则新增）。
 */
@Slf4j
@Component
@Order(25)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "bencao.seed.herbs-batch", havingValue = "true", matchIfMissing = true)
public class HerbBatchSeedInitializer implements ApplicationRunner {

    private static final String SEED_FILE = "seed/herbs-batch.json";

    private final HerbMapper herbMapper;
    private final HerbImageMapper herbImageMapper;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ClassPathResource resource = new ClassPathResource(SEED_FILE);
            if (!resource.exists()) {
                log.warn("未找到批量药材种子文件: {}（请执行 mvn compile 或 IDE Rebuild）", SEED_FILE);
                return;
            }
            int inserted = 0;
            int updated = 0;
            try (InputStream in = resource.getInputStream()) {
                JsonNode root = objectMapper.readTree(in);
                if (!root.isArray()) {
                    log.warn("{} 根节点必须是 JSON 数组", SEED_FILE);
                    return;
                }
                log.info("读取药材种子 {} 条（{}）", root.size(), SEED_FILE);
                for (JsonNode node : root) {
                    SyncResult result = syncOne(node);
                    if (result == SyncResult.INSERTED) {
                        inserted++;
                    } else if (result == SyncResult.UPDATED) {
                        updated++;
                    }
                }
            }
            if (inserted > 0 || updated > 0) {
                log.info("批量药材种子同步完成：新增 {} 条，更新 {} 条", inserted, updated);
            }
        } catch (Exception ex) {
            log.error("批量药材种子同步失败", ex);
        }
    }

    private enum SyncResult { SKIPPED, INSERTED, UPDATED }

    private SyncResult syncOne(JsonNode node) {
        String herbName = text(node, "herbName");
        if (!StringUtils.hasText(herbName)) {
            return SyncResult.SKIPPED;
        }

        Herb existing = herbMapper.selectOne(
                new LambdaQueryWrapper<Herb>().eq(Herb::getHerbName, herbName).last("LIMIT 1"));

        Herb herb = existing != null ? existing : new Herb();
        applyFields(herb, node, herbName);

        if (existing == null) {
            herbMapper.insert(herb);
            replaceImages(herb.getId(), collectImages(node, herb));
            log.info("药材种子已新增: {}", herbName);
            return SyncResult.INSERTED;
        }

        herbMapper.updateById(herb);
        replaceImages(herb.getId(), collectImages(node, herb));
        log.info("药材种子已更新: {}", herbName);
        return SyncResult.UPDATED;
    }

    private void applyFields(Herb herb, JsonNode node, String herbName) {
        herb.setHerbName(herbName);
        herb.setAlias(text(node, "alias"));
        herb.setOriginProvince(text(node, "originProvince"));
        herb.setOriginProvinceName(text(node, "originProvinceName"));
        herb.setDaoDiRegion(text(node, "daoDiRegion"));
        herb.setIsDaoDi(node.has("isDaoDi") ? node.get("isDaoDi").asInt(0) : 0);
        herb.setNature(text(node, "nature"));
        herb.setTaste(text(node, "taste"));
        herb.setMeridian(text(node, "meridian"));
        herb.setPropertyDesc(text(node, "propertyDesc"));
        herb.setEfficacy(text(node, "efficacy"));
        herb.setClinicalUsage(text(node, "clinicalUsage"));
        herb.setCoverImage(text(node, "coverImage"));
        if (node.has("viewCount")) {
            herb.setViewCount(node.get("viewCount").asInt(0));
        }
        if (node.has("collectCount")) {
            herb.setCollectCount(node.get("collectCount").asInt(0));
        }
        herb.setStatus(node.has("status") ? node.get("status").asInt(1) : 1);

        if (node.has("detailContent") && !node.get("detailContent").isNull()) {
            try {
                herb.setDetailContent(objectMapper.writeValueAsString(node.get("detailContent")));
            } catch (Exception e) {
                log.warn("药材 {} 的 detailContent 序列化失败", herbName);
            }
        }
    }

    private List<String> collectImages(JsonNode node, Herb herb) {
        List<String> images = new ArrayList<>();
        if (node.has("images") && node.get("images").isArray()) {
            node.get("images").forEach(img -> {
                if (img.isTextual() && StringUtils.hasText(img.asText())) {
                    images.add(img.asText());
                }
            });
        }
        if (images.isEmpty() && StringUtils.hasText(herb.getCoverImage())) {
            images.add(herb.getCoverImage());
        }
        return images;
    }

    private void replaceImages(Long herbId, List<String> images) {
        herbImageMapper.delete(
                new LambdaQueryWrapper<HerbImage>().eq(HerbImage::getHerbId, herbId));
        int order = 1;
        for (String url : images) {
            HerbImage image = new HerbImage();
            image.setHerbId(herbId);
            image.setImageUrl(url);
            image.setSortOrder(order++);
            herbImageMapper.insert(image);
        }
    }

    private String text(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) {
            return "";
        }
        return node.get(field).asText("").trim();
    }
}
