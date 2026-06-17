package com.bencao.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bencao.jwt")
public class JwtProperties {

    private String secret;
    private long accessTokenExpireSeconds;
    private long refreshTokenExpireSeconds;
}
