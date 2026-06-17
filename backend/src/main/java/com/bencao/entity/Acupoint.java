package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("acupoint")
public class Acupoint {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String pointName;

    private String meridian;

    private String positionDesc;

    private String efficacy;

    @TableField("coord_3d")
    private String coord3d;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
