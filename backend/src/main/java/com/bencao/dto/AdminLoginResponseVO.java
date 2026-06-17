package com.bencao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponseVO {

    private String accessToken;
    private Long expiresIn;
    private AdminBriefVO adminBrief;
}
