package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("forum_post")
public class ForumPost {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String content;

    private String imageUrls;

    /** question | share */
    private String category;

    /** herb | article 等 */
    private String refType;

    private Long refId;

    private Integer likeCount;

    private Integer commentCount;

    private Integer auditStatus;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
