package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_herb_favorite")
public class UserHerbFavorite {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long herbId;

    private LocalDateTime createTime;
}
