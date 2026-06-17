package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("herb_image")
public class HerbImage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long herbId;

    private String imageUrl;

    private Integer sortOrder;

    private LocalDateTime createTime;
}
