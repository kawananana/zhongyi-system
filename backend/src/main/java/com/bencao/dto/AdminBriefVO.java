package com.bencao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBriefVO {

    private Long adminId;
    private String username;
    private String role;
}
