package com.bencao.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bencao.deepseek")
public class DeepseekProperties {

    private String apiKey = "";
    private String baseUrl = "https://api.deepseek.com/chat/completions";
    private String model = "deepseek-chat";
    private double temperature = 0.7;
    private int maxTokens = 2048;
}
