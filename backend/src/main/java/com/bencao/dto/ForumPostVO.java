package com.bencao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ForumPostVO {

    private Long id;
    private Long userId;
    private String authorNickname;
    private String authorAvatar;
    private String title;
    private String content;
    private String category;
    private String refType;
    private Long refId;
    private String refHerbName;
    private String refHerbCover;
    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createTime;
}
