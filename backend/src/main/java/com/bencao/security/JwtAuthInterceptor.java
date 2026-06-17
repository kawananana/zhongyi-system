package com.bencao.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                Claims claims = jwtService.parseToken(token);
                String tokenType = claims.get("tokenType", String.class);
                if (tokenType == null) {
                    tokenType = firstAudience(claims);
                }
                if (JwtService.AUDIENCE_USER.equals(tokenType)) {
                    UserContext.setUserId(Long.parseLong(claims.getSubject()));
                }
            } catch (Exception ignored) {
                // 无效 token 视为未登录，由业务接口决定是否强制鉴权
            }
        }
        return true;
    }

    private String firstAudience(Claims claims) {
        if (JwtService.AUDIENCE_USER.equals(claims.get("aud", String.class))) {
            return JwtService.AUDIENCE_USER;
        }
        if (JwtService.AUDIENCE_ADMIN.equals(claims.get("aud", String.class))) {
            return JwtService.AUDIENCE_ADMIN;
        }
        try {
            if (claims.getAudience() != null) {
                for (String aud : claims.getAudience()) {
                    return aud;
                }
            }
        } catch (Exception ignored) {
            // ignore
        }
        return null;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContext.clear();
    }
}
