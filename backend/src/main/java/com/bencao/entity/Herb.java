package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("herb")
public class Herb {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String herbName;

    private String alias;

    private String originProvince;

    private String originProvinceName;

    private String daoDiRegion;

    private Integer isDaoDi;

    private String nature;

    private String taste;

    private String meridian;

    private String propertyDesc;

    private String efficacy;

    private String clinicalUsage;

    /** 详情页扩展内容（JSON 字符串） */
    private String detailContent;

    private String coverImage;

    private Integer viewCount;

    private Integer collectCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
