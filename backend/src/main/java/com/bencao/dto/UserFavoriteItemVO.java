package com.bencao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserFavoriteItemVO {

    private Long id;

    /** herb / article / course */
    private String type;

    private String title;

    private String coverImage;

    private String category;

    private String subtitle;

    private LocalDateTime favoriteTime;
}
