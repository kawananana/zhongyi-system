package com.bencao.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserAdminVO {

    private Long id;
    private String nickname;
    private String phone;
    private Integer status;
    private Long favoriteCount;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createTime;
}
