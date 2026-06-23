package com.bencao.service.impl;

import com.bencao.common.exception.BusinessException;
import com.bencao.config.DeepseekProperties;
import com.bencao.dto.StudyChatMessageDTO;
import com.bencao.dto.StudyChatRequest;
import com.bencao.dto.StudyChatResponseVO;
import com.bencao.service.StudyChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudyChatServiceImpl implements StudyChatService {

    private static final String SYSTEM_PROMPT = """
            你是「本草萌智」平台的萌智伴学小助手，大家都叫你「小萌」。
            
            【人设】
            - 性格亲民、有耐心，像一位愿意陪读的老同学，不说教、不摆架子
            - 精通中医药：熟悉中药性味归经、方剂配伍、经络穴位、针灸艾灸、体质养生与药膳食疗
            - 善于把晦涩的中医术语翻译成大白话，必要时举生活里的例子帮助理解
            
            【回答风格】
            - 用中文、Markdown 格式，条理清楚，重点加粗
            - 先直接回应问题，再补充原理或记忆窍门；复杂问题可分点说明
            - 语气温暖自然，可适当用「咱们」「你可以试试」等表达，但保持专业可信
            
            【边界】
            - 只做中医药科普与学习辅导，不开具处方，不替代医生诊断与治疗
            - 涉及急重症、用药剂量、孕妇儿童等特殊人群时，提醒用户咨询专业医师
            
            【擅长领域】
            药材辨析与功效对比、四气五味与升降浮沉、方剂入门、备考复习规划、九体质调养、针灸艾灸常识、本草图鉴与药膳应用等。
            """;

    private final DeepseekProperties deepseekProperties;
    private final ObjectMapper objectMapper;

    @Override
    public StudyChatResponseVO chat(StudyChatRequest request) {
        if (!StringUtils.hasText(deepseekProperties.getApiKey())) {
            throw new BusinessException("AI 服务未配置，请设置环境变量 DEEPSEEK_API_KEY 或 application-local.yml");
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", buildSystemPrompt(request.getConstitutionContext())));

        if (request.getHistory() != null) {
            for (StudyChatMessageDTO item : request.getHistory()) {
                if (!StringUtils.hasText(item.getRole()) || !StringUtils.hasText(item.getContent())) {
                    continue;
                }
                messages.add(Map.of("role", item.getRole().trim(), "content", item.getContent().trim()));
            }
        }

        messages.add(Map.of("role", "user", "content", request.getMessage().trim()));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", deepseekProperties.getModel());
        body.put("messages", messages);
        body.put("temperature", deepseekProperties.getTemperature());
        body.put("max_tokens", deepseekProperties.getMaxTokens());

        try {
            RestClient client = RestClient.create();
            String responseBody = client.post()
                    .uri(deepseekProperties.getBaseUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + deepseekProperties.getApiKey().trim())
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || !StringUtils.hasText(contentNode.asText())) {
                String apiError = root.path("error").path("message").asText("");
                throw new BusinessException(StringUtils.hasText(apiError) ? apiError : "AI 返回内容为空");
            }
            return new StudyChatResponseVO(contentNode.asText().trim());
        } catch (BusinessException ex) {
            throw ex;
        } catch (RestClientException ex) {
            log.error("DeepSeek API 调用失败", ex);
            throw new BusinessException("AI 服务暂时不可用，请稍后重试");
        } catch (Exception ex) {
            log.error("解析 DeepSeek 响应失败", ex);
            throw new BusinessException("AI 响应解析失败");
        }
    }

    private String buildSystemPrompt(String constitutionContext) {
        if (!StringUtils.hasText(constitutionContext)) {
            return SYSTEM_PROMPT;
        }
        return SYSTEM_PROMPT + "\n\n【用户体质自测附加上下文】\n" + constitutionContext.trim();
    }
}
