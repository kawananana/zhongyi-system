package com.bencao.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HerbAdminVO {

    private Long id;

    private String herbName;

    private String alias;

    private String originProvinceName;

    private String daoDiRegion;

    private Integer isDaoDi;

    private String nature;

    private String taste;

    private String meridian;

    private String propertyDesc;

    private String efficacy;

    private String clinicalUsage;

    private String coverImage;

    private Integer viewCount;

    private Integer collectCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
