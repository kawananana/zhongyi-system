package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("recipe")
public class Recipe {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String recipeName;

    private String category;

    private String coverImage;

    private String summary;

    private String efficacy;

    private String cookingSteps;

    private String cookingTime;

    private String difficulty;

    private String tags;

    private String constitutionTags;

    private Integer isFeatured;

    private Integer viewCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
