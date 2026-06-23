package com.bencao.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ForumPostAdminVO {

    private Long id;

    private Long userId;

    private String authorNickname;

    private String authorPhone;

    private String title;

    private String content;

    private String category;

    private String refType;

    private Long refId;

    private String refHerbName;

    private Integer likeCount;

    private Integer commentCount;

    private Integer auditStatus;

    private Integer status;

    private LocalDateTime createTime;
}
